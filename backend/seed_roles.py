
import getpass
from datetime import date, datetime

from db.database import Base, SessionLocal, engine
from models.rol import Rol
from models.usuario import Usuario
from core.security import hash_password
from schemas.usuario import validar_password_segura

# Solo 3 roles en VICTORIA-FINAL. El orden no importa para la seguridad
# (todo el control de acceso compara por NOMBRE de rol, ver
# core/security.py -> require_roles), pero se mantiene este orden porque
# es el que ya usaban los seeds anteriores del proyecto.
ROLES_BASE = ["coordinador", "instructor", "aprendiz"]


def crear_roles(db):
    creados = []
    for nombre in ROLES_BASE:
        existe = db.query(Rol).filter(Rol.nombre_rol.ilike(nombre)).first()
        if not existe:
            db.add(Rol(nombre_rol=nombre))
            creados.append(nombre)
    if creados:
        db.commit()
        print(f"Roles creados: {', '.join(creados)}")
    else:
        print("Los 3 roles ya existían.")


def crear_primer_coordinador(db):
    rol_coordinador = db.query(Rol).filter(Rol.nombre_rol.ilike("coordinador")).first()

    ya_existe = (
        db.query(Usuario)
        .filter(Usuario.id_rol == rol_coordinador.id_rol)
        .first()
    )
    if ya_existe:
        print(f"Ya existe al menos un coordinador ({ya_existe.numero_documento}). No se crea otro.")
        return

    print("\n--- Crear el primer usuario coordinador ---")
    nombre = input("Nombre: ").strip()
    apellido = input("Apellido: ").strip()
    numero_documento = input("Número de documento: ").strip()
    tipo_documento = input("Tipo de documento (CC/TI/CE): ").strip() or "CC"
    correo_personal = input("Correo personal: ").strip()
    correo_sena = input("Correo SENA: ").strip()

    while True:
        contrasena = getpass.getpass("Contraseña (mín. 8, mayúscula, minúscula, número y especial): ")
        try:
            validar_password_segura(contrasena)
            break
        except ValueError as e:
            print(f"  -> {e}")

    nuevo = Usuario(
        nombre=nombre,
        apellido=apellido or None,
        id_rol=rol_coordinador.id_rol,
        estado="activo",
        fecha_nacimiento=date(1990, 1, 1),  # placeholder editable luego desde el perfil
        numero_documento=numero_documento,
        tipo_documento=tipo_documento,
        correo_personal=correo_personal,
        correo_sena=correo_sena,
        contrasena=hash_password(contrasena),
    )
    db.add(nuevo)
    db.commit()
    print(f"\nCoordinador '{nombre}' creado correctamente. Ya puedes iniciar sesión con su documento.")


if __name__ == "__main__":
    # Crea las tablas que falten. Antes este script asumía que la API ya se
    # había arrancado una vez (o que se había corrido el .sql); en una base
    # de datos vacía fallaba con "relation rol does not exist".
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        crear_roles(db)
        crear_primer_coordinador(db)
    finally:
        db.close()
