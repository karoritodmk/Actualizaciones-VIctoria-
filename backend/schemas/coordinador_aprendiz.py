from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class AprendizDetalleResponse(BaseModel):
    """Perfil de un aprendiz visto por el coordinador (solo lectura).
    Refleja lib/coordinador.ts::AprendizDetalle del frontend."""

    id_usuario: int
    nombre: str
    apellido: Optional[str] = None
    nombre_completo: str
    estado: Optional[str] = None
    tipo_documento: str
    numero_documento: str
    fecha_nacimiento: date
    telefono: Optional[str] = None
    correo_personal: str
    correo_sena: str
    fecha_registro: Optional[datetime] = None
    informacion_adicional: Optional[str] = None
    hoja_vida_url: Optional[str] = None
    # Ficha (None si aún no tiene una asignada)
    id_ficha: Optional[int] = None
    estado_ficha: Optional[str] = None
    trimestre: Optional[str] = None
    horario_ficha: Optional[str] = None
    jornada: Optional[str] = None
    fecha_inicio_ficha: Optional[datetime] = None
    fecha_fin_ficha: Optional[datetime] = None
    director_ficha: Optional[str] = None
    # Programa de la ficha
    programa_nombre: Optional[str] = None
    nivel_formacion: Optional[str] = None
    total_archivos_portafolio: int = 0
