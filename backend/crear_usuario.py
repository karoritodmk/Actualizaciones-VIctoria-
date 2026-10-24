import getpass
from datetime import date

import models  # registra todos los modelos
from db.database import SessionLocal
from models.rol import Rol
from models.usuario import Usuario
from core.security import hash_password
from schemas.usuario import validar_password_segura


def main():
    db = SessionLocal()
    try:
        print("Roles disponibles: coordinador, instructor, aprendiz")
        nombre_rol = input("Rol del nuevo usuario: ").strip().lower()
        rol = db.query(Rol).filter(Rol.nombre_rol.ilike(nombre_rol)).first()
        if not rol:
            print("Ese rol no existe. Escribe exactamente: coordinador, instructor o aprendiz.")
            return

        nombre = input("Nombre: ").strip()
        apellido = input("Apellido: ").strip()
        documento = input("Número de documento: ").strip()
        tipo_doc = input("Tipo de documento (CC/TI/CE) [CC]: ").strip() or "CC"
        correo_personal = input("Correo personal: ").strip()
        correo_sena = input("Correo SENA: ").strip()
        nacimiento = input("Fecha de nacimiento (AAAA-MM-DD) [1990-01-01]: ").strip() or "1990-01-01"

        while True:
            clave = getpass.getpass("Contraseña (8+, mayúscula, minúscula, número y especial): ")
            try:
                validar_password_segura(clave)
                break
            except ValueError as e:
                print(f"  -> {e}")

        usuario = Usuario(
            nombre=nombre,
            apellido=apellido or None,
            id_rol=rol.id_rol,
            estado="activo",
            fecha_nacimiento=date.fromisoformat(nacimiento),
            numero_documento=documento,
            tipo_documento=tipo_doc,
            correo_personal=correo_personal,
            correo_sena=correo_sena,
            contrasena=hash_password(clave),
        )
        db.add(usuario)
        db.commit()
        print(f"\nUsuario '{nombre}' creado como {rol.nombre_rol}. Ya puede iniciar sesión con su documento.")
    except Exception as e:
        db.rollback()
        print(f"No se pudo crear el usuario: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()