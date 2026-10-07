import os
import uuid

from fastapi import HTTPException, UploadFile, status

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(_BASE_DIR, "static", "uploads")

EXTENSIONES_PERMITIDAS = {
    ".pdf", ".png", ".jpg", ".jpeg", ".webp", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".zip",
}
TAMANO_MAXIMO_BYTES = 15 * 1024 * 1024  # 15 MB
_TAMANO_TROZO = 1024 * 1024  # se lee de a 1 MB
_MAX_LARGO_NOMBRE = 200  # igual que String(200) en archivo_*.nombre_archivo


async def guardar_adjunto(archivo: UploadFile) -> str:
    """Valida extensión y tamaño, guarda el archivo en static/uploads con un
    nombre único y devuelve su URL pública (/static/uploads/<nombre>)."""
    extension = os.path.splitext(archivo.filename or "")[1].lower()
    if extension not in EXTENSIONES_PERMITIDAS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido ({extension or 'sin extensión'}).",
        )
    return await _guardar_en_disco(archivo, extension)


# ---------------------------------------------------------------------------
# Documentos de sedes y programas: SOLO PDF o Word.
# ---------------------------------------------------------------------------
EXTENSIONES_DOCUMENTO = {".pdf", ".doc", ".docx"}
MENSAJE_SOLO_DOCUMENTOS = "Solo se permiten archivos PDF o Word (.pdf, .doc, .docx)."

_OLE = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"  # firma de un .doc clásico
_ZIP = b"PK\x03\x04"                           # firma de un .docx (es un zip)


def _cabecera_valida(extension: str, cabecera: bytes) -> bool:
    """Comprueba que el CONTENIDO coincida con la extensión. Sin esto, basta
    con renombrar un .exe o un .html a 'cv.pdf' para subirlo."""
    if extension == ".pdf":
        return b"%PDF-" in cabecera[:1024]
    if extension == ".docx":
        return cabecera.startswith(_ZIP)
    if extension == ".doc":
        # Un .doc "de verdad" es OLE; algunos programas guardan .doc como
        # .docx o RTF, así que también se aceptan esos dos formatos de Word.
        return cabecera.startswith(_OLE) or cabecera.startswith(_ZIP) or cabecera.startswith(b"{\\rtf")
    return False


async def guardar_documento(archivo: UploadFile) -> str:
    """Igual que guardar_adjunto, pero solo acepta PDF/Word y verifica que el
    contenido sea realmente de ese tipo."""
    extension = os.path.splitext(archivo.filename or "")[1].lower()
    if extension not in EXTENSIONES_DOCUMENTO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{MENSAJE_SOLO_DOCUMENTOS} Recibido: {extension or 'archivo sin extensión'}.",
        )
    return await _guardar_en_disco(archivo, extension, validar_cabecera=_cabecera_valida)


async def _guardar_en_disco(archivo: UploadFile, extension: str, validar_cabecera=None) -> str:
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    nombre_unico = f"{uuid.uuid4().hex}{extension}"
    ruta_completa = os.path.join(UPLOADS_DIR, nombre_unico)

    total = 0
    try:
        with open(ruta_completa, "wb") as destino:
            while True:
                trozo = await archivo.read(_TAMANO_TROZO)
                if not trozo:
                    break
                if total == 0 and validar_cabecera and not validar_cabecera(extension, trozo[:1024]):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"El contenido no corresponde a un archivo {extension[1:].upper()} válido. "
                        + MENSAJE_SOLO_DOCUMENTOS,
                    )
                total += len(trozo)
                if total > TAMANO_MAXIMO_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="El archivo supera 15 MB.",
                    )
                destino.write(trozo)
    except BaseException:
        # Límite superado, cliente desconectado, disco lleno...: no dejamos
        # un archivo a medias. El `with` ya cerró el archivo en este punto.
        if os.path.exists(ruta_completa):
            os.remove(ruta_completa)
        raise

    if total == 0:
        borrar_adjunto(nombre_unico)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El archivo está vacío.")

    return f"/static/uploads/{nombre_unico}"


def borrar_adjunto(url: str) -> None:
    """Borra un adjunto recién guardado (para deshacer si la BD falló).
    Solo usa el nombre final de la URL, así que no puede salirse de UPLOADS_DIR."""
    nombre = os.path.basename(url or "")
    if not nombre:
        return
    ruta = os.path.join(UPLOADS_DIR, nombre)
    try:
        if os.path.isfile(ruta):
            os.remove(ruta)
    except OSError:
        pass


def nombre_para_mostrar(archivo: UploadFile, respaldo: str) -> str:
    """Nombre original del archivo para mostrarlo en pantalla: sin rutas
    (algunos navegadores/sistemas mandan 'C:\\carpeta\\archivo.pdf') y
    recortado al largo de la columna, para evitar un error 500 de la BD."""
    nombre = os.path.basename((archivo.filename or "").replace("\\", "/")).strip()
    if not nombre:
        return respaldo
    if len(nombre) > _MAX_LARGO_NOMBRE:
        base, extension = os.path.splitext(nombre)
        nombre = base[: _MAX_LARGO_NOMBRE - len(extension)] + extension
    return nombre
