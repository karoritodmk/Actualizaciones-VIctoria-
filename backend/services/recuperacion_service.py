import hashlib
import hmac
import logging
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from core.config import settings
from core.security import hash_password
from models.recuperacion_codigo import RecuperacionCodigo
from models.usuario import Usuario

logger = logging.getLogger(__name__)

MINUTOS_DE_VALIDEZ = 15
MAX_INTENTOS_CODIGO = 5          # al 5.º código incorrecto, el código se quema
SEGUNDOS_ENTRE_ENVIOS = 60       # no se manda otro correo si el anterior fue hace menos de esto
TIMEOUT_SMTP_SEGUNDOS = 10       # sin timeout, un SMTP caído dejaba la petición colgada para siempre

RESPUESTA_GENERICA = {"mensaje": "Si el correo existe, te llegará un código."}


def _hash_codigo(id_usuario: int, codigo: str) -> str:
    """HMAC-SHA256 del código con la SECRET_KEY del servidor. Así, aunque
    alguien lea la tabla, no ve los códigos ni puede calcularlos sin la llave."""
    clave = settings.SECRET_KEY.encode("utf-8")
    mensaje = f"{id_usuario}:{codigo}".encode("utf-8")
    return hmac.new(clave, mensaje, hashlib.sha256).hexdigest()


def enviar_correo_codigo(destinatario: str, codigo: str) -> None:
    """Envía el correo con el código. Se ejecuta en segundo plano
    (BackgroundTasks), así que NUNCA lanza excepciones: si falla, se deja
    en el log del servidor. Esto evita que la respuesta de la API cambie (o
    tarde más) cuando el correo sí existe, que era una forma de averiguar
    qué correos están registrados."""
    try:
        mensaje = MIMEMultipart("alternative")
        mensaje["Subject"] = "Recuperación de contraseña - VICTORIA"
        mensaje["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
        mensaje["To"] = destinatario

        cuerpo = f"""
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color: #1a3322;">Recuperación de contraseña</h2>
          <p>Usa este código en la app VICTORIA para restablecer tu contraseña:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1a3322;">
            {codigo}
          </p>
          <p>Este código vence en {MINUTOS_DE_VALIDEZ} minutos.</p>
          <p style="color: #888; font-size: 12px;">
            Si tú no pediste este cambio, ignora este correo.
          </p>
        </div>
        """
        mensaje.attach(MIMEText(cuerpo, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=TIMEOUT_SMTP_SEGUNDOS) as servidor:
            servidor.starttls()
            servidor.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            servidor.sendmail(settings.SMTP_USER, destinatario, mensaje.as_string())
    except Exception:
        logger.exception(
            "No se pudo enviar el correo de recuperación. Revisa SMTP_HOST, SMTP_PORT, "
            "SMTP_USER y SMTP_PASSWORD en el .env."
        )


class RecuperacionService:
    def __init__(self, db: Session):
        self.db = db

    def _buscar_usuario(self, correo: str):
        # Los correos no distinguen mayúsculas: "Juan@Gmail.com" y
        # "juan@gmail.com" son la misma cuenta. Antes la búsqueda era exacta.
        c = correo.strip().lower()
        return (
            self.db.query(Usuario)
            .filter(
                (func.lower(Usuario.correo_personal) == c)
                | (func.lower(Usuario.correo_sena) == c)
            )
            .first()
        )

    def solicitar_codigo(self, correo: str, tareas: BackgroundTasks):
        usuario = self._buscar_usuario(correo)

        # No revelamos si el correo existe o no: siempre la misma respuesta.
        if not usuario:
            return dict(RESPUESTA_GENERICA)

        ahora = datetime.now(timezone.utc)
        registro = self.db.get(RecuperacionCodigo, usuario.id_usuario)

        # Anti-spam: si ya se mandó un código hace menos de un minuto, no se
        # manda otro (ni se pisa el vigente). Misma respuesta de siempre.
        if registro and registro.creado and (ahora - registro.creado).total_seconds() < SEGUNDOS_ENTRE_ENVIOS:
            return dict(RESPUESTA_GENERICA)

        # secrets (no random): el módulo random NO es criptográficamente seguro.
        codigo = f"{secrets.randbelow(1_000_000):06d}"
        codigo_hash = _hash_codigo(usuario.id_usuario, codigo)
        expira = ahora + timedelta(minutes=MINUTOS_DE_VALIDEZ)

        if registro:
            registro.codigo_hash = codigo_hash
            registro.expira = expira
            registro.intentos = 0
            registro.creado = ahora
        else:
            self.db.add(
                RecuperacionCodigo(
                    id_usuario=usuario.id_usuario,
                    codigo_hash=codigo_hash,
                    expira=expira,
                    intentos=0,
                    creado=ahora,
                )
            )
        self.db.commit()

        tareas.add_task(enviar_correo_codigo, correo, codigo)
        return dict(RESPUESTA_GENERICA)

    def confirmar_codigo(self, correo: str, codigo: str, nueva_contrasena: str):
        error_generico = HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código incorrecto o vencido.",
        )

        usuario = self._buscar_usuario(correo)
        if not usuario:
            raise error_generico

        # with_for_update(): bloquea la fila mientras se evalúa el intento.
        # Sin esto, varias peticiones simultáneas podían leer "0 intentos"
        # a la vez y adivinar más veces del límite.
        registro = (
            self.db.query(RecuperacionCodigo)
            .filter(RecuperacionCodigo.id_usuario == usuario.id_usuario)
            .with_for_update()
            .first()
        )
        if not registro:
            raise error_generico

        ahora = datetime.now(timezone.utc)
        if ahora > registro.expira or registro.intentos >= MAX_INTENTOS_CODIGO:
            self.db.delete(registro)
            self.db.commit()
            raise error_generico

        # compare_digest: comparación en tiempo constante.
        if not hmac.compare_digest(registro.codigo_hash, _hash_codigo(usuario.id_usuario, codigo)):
            registro.intentos += 1
            if registro.intentos >= MAX_INTENTOS_CODIGO:
                self.db.delete(registro)  # código quemado: hay que pedir uno nuevo
            self.db.commit()
            raise error_generico

        usuario.contrasena = hash_password(nueva_contrasena)
        # Quien demuestra que es dueño del correo también queda desbloqueado.
        # Antes, si la cuenta estaba bloqueada por intentos fallidos, la
        # persona cambiaba su contraseña y seguía "bloqueada" hasta 30 min.
        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None
        # Columnas antiguas (ya sin uso): se limpian por si quedó algo.
        usuario.reset_code = None
        usuario.reset_code_expira = None
        self.db.delete(registro)
        self.db.commit()

        return {"mensaje": "Contraseña actualizada correctamente."}
