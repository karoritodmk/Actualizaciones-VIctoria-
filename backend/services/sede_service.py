from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile, status

from core.uploads import borrar_adjunto, guardar_adjunto, nombre_para_mostrar

from models.sede import Sede
from schemas.sede import SedeCreate


class SedeService:
    def __init__(self, db: Session):
        self.db = db

    def crear_sede(self, data_in: SedeCreate):
        existe = self.db.query(Sede).filter(Sede.nombre == data_in.nombre).first()
        if existe:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe una sede con ese nombre.")

        nueva_sede = Sede(**data_in.model_dump())
        self.db.add(nueva_sede)
        self.db.commit()
        self.db.refresh(nueva_sede)
        return nueva_sede

    def obtener_sedes(self):
        return self.db.query(Sede).order_by(Sede.nombre.asc()).all()

    def obtener_sede_por_id(self, id_sede: int):
        sede = self.db.query(Sede).filter(Sede.id_sede == id_sede).first()
        if not sede:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sede no encontrada.")
        return sede

    def actualizar_sede(self, id_sede: int, data_in: SedeCreate):
        sede_actual = self.obtener_sede_por_id(id_sede)
        sede_actual.nombre = data_in.nombre
        sede_actual.descripcion = data_in.descripcion
        sede_actual.direccion_principal = data_in.direccion_principal
        sede_actual.telefono_atencion = data_in.telefono_atencion
        sede_actual.horario_atencion = data_in.horario_atencion
        self.db.commit()
        self.db.refresh(sede_actual)
        return sede_actual

    async def guardar_archivo(self, id_sede: int, archivo: UploadFile):
        """Adjunta (o reemplaza) el archivo informativo de la sede."""
        sede = self.obtener_sede_por_id(id_sede)
        url_anterior = sede.archivo_url
        url_nueva = await guardar_adjunto(archivo)
        try:
            sede.archivo_url = url_nueva
            sede.archivo_nombre = nombre_para_mostrar(archivo, "Archivo de la sede")
            self.db.commit()
        except Exception:
            self.db.rollback()
            borrar_adjunto(url_nueva)  # no dejamos un archivo huérfano
            raise
        if url_anterior:
            borrar_adjunto(url_anterior)
        self.db.refresh(sede)
        return sede

    def quitar_archivo(self, id_sede: int):
        sede = self.obtener_sede_por_id(id_sede)
        url_anterior = sede.archivo_url
        sede.archivo_url = None
        sede.archivo_nombre = None
        self.db.commit()
        if url_anterior:
            borrar_adjunto(url_anterior)
        self.db.refresh(sede)
        return sede

    def eliminar_sede(self, id_sede: int):
        sede = self.obtener_sede_por_id(id_sede)
        url_archivo = sede.archivo_url
        self.db.delete(sede)
        self.db.commit()
        if url_archivo:
            borrar_adjunto(url_archivo)
        return {"mensaje": "Sede eliminada exitosamente."}
