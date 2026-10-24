"""Perfil y portafolio de un aprendiz para el COORDINADOR (solo lectura).

El portafolio reutiliza PortafolioService (el mismo que usa el aprendiz) pasándole
al aprendiz consultado como "dueño": así el coordinador ve exactamente lo que el
aprendiz ve, sin duplicar lógica y sin poder modificar nada (aquí no hay POST/PUT/DELETE).
"""
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.archivo_portafolio import ArchivoPortafolio
from models.rol import Rol
from models.usuario import Usuario
from services.coordinador_service import jornada_de_horario
from services.portafolio_service import PortafolioService

NOMBRE_ROL_APRENDIZ = "aprendiz"


class CoordinadorAprendizService:
    def __init__(self, db: Session):
        self.db = db

    def aprendiz_o_404(self, id_aprendiz: int) -> Usuario:
        aprendiz = (
            self.db.query(Usuario)
            .join(Rol, Usuario.id_rol == Rol.id_rol)
            .filter(Usuario.id_usuario == id_aprendiz, Rol.nombre_rol.ilike(NOMBRE_ROL_APRENDIZ))
            .first()
        )
        if not aprendiz:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aprendiz no encontrado.")
        return aprendiz

    def detalle(self, id_aprendiz: int) -> dict:
        a = self.aprendiz_o_404(id_aprendiz)
        ficha = a.ficha
        programa = ficha.programa if ficha else None
        director = ficha.director if ficha else None
        total = (
            self.db.query(func.count(ArchivoPortafolio.id_archivo))
            .filter(ArchivoPortafolio.id_aprendiz == a.id_usuario)
            .scalar()
            or 0
        )
        return {
            "id_usuario": a.id_usuario,
            "nombre": a.nombre,
            "apellido": a.apellido,
            "nombre_completo": f"{a.nombre} {a.apellido or ''}".strip(),
            "estado": a.estado,
            "tipo_documento": a.tipo_documento,
            "numero_documento": a.numero_documento,
            "fecha_nacimiento": a.fecha_nacimiento,
            "telefono": a.telefono,
            "correo_personal": a.correo_personal,
            "correo_sena": a.correo_sena,
            "fecha_registro": a.fecha_creacion,
            "informacion_adicional": a.informacion_adicional,
            "hoja_vida_url": a.hoja_vida_url,
            "id_ficha": ficha.id_ficha if ficha else None,
            "estado_ficha": ficha.estado if ficha else None,
            "trimestre": ficha.trimestre if ficha else None,
            "horario_ficha": ficha.horario if ficha else None,
            "jornada": jornada_de_horario(ficha.horario) if ficha else None,
            "fecha_inicio_ficha": ficha.fecha_inicio if ficha else None,
            "fecha_fin_ficha": ficha.fecha_fin if ficha else None,
            "director_ficha": f"{director.nombre} {director.apellido or ''}".strip() if director else None,
            "programa_nombre": programa.nombre if programa else None,
            "nivel_formacion": programa.nivel_formacion if programa else None,
            "total_archivos_portafolio": total,
        }

    def portafolio(self) -> PortafolioService:
        return PortafolioService(self.db)
