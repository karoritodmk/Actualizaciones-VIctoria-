from datetime import date, datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

from core.validators import anti_scripting

TipoInstructor = Literal["planta", "tecnico", "transversal", "contratista"]


# ==========================================================================
# 1. Dashboard
# ==========================================================================
class FichaResumenResponse(BaseModel):
    id_ficha: int
    numero_ficha: Optional[str] = None
    nombre_programa: Optional[str] = None
    trimestre: Optional[int] = None
    nombre_director_ficha: Optional[str] = None
    num_estudiantes: int


class DashboardCoordinadorResponse(BaseModel):
    # Los nombres deben coincidir EXACTO con las llaves que devuelve
    # CoordinadorService.obtener_dashboard() y con lo que lee el front
    # (appm/src/lib/coordinador.ts::DashboardCoordinador).
    total_fichas: int
    fichas_activas: int
    fichas_sin_instructor: int
    total_instructores: int
    instructores_sin_asignacion: int
    total_aprendices: int
    aprendices_sin_ficha: int
    fichas_recientes: List[FichaResumenResponse] = []


class InstructorResumenResponse(BaseModel):
    id_usuario: int
    nombre_completo: str
    tipo_instructor: TipoInstructor
    numero_documento: str


class InstructorDetalleResponse(InstructorResumenResponse):
    especialidad: Optional[str] = None
    tipo_contrato: Optional[str] = None
    estado_contrato: Optional[str] = None
    vigencia_contrato: Optional[date] = None
    numero_ficha: Optional[str] = None
    horario_ficha: Optional[str] = None
    correo_sena: str
    telefono: Optional[str] = None
    hoja_vida_url: Optional[str] = None


# ==========================================================================
# 3. Portafolio del instructor (solo lectura para el coordinador)
# ==========================================================================
class CompetenciaPortafolioResponse(BaseModel):
    id_competencia: int
    nombre: str
    archivos: int


class TrimestrePortafolioResponse(BaseModel):
    trimestre: int
    evidencias: int
    competencias: List[CompetenciaPortafolioResponse] = []


class PortafolioInstructorResponse(BaseModel):
    id_usuario: int
    nombre_completo: str
    tipo_instructor: TipoInstructor
    trimestres: List[TrimestrePortafolioResponse] = []


class EntregaArchivoResponse(BaseModel):
    id_evidencia: int
    nombre_archivo: str
    url: str


class CompetenciaDetalleResponse(BaseModel):
    id_competencia: int
    nombre: str
    descripcion: Optional[str] = None
    trimestre: int
    fecha_creacion: datetime
    fecha_edicion: Optional[datetime] = None
    archivos: List[EntregaArchivoResponse] = []


# ==========================================================================
# 4. Programas de una sede
# ==========================================================================
class ProgramaSedeResponse(BaseModel):
    id_programa: int
    nombre: str
    descripcion: Optional[str] = None
    nivel_formacion: Optional[str] = None

    class Config:
        from_attributes = True


class ProgramaSedeCreate(BaseModel):
    """
    Cuerpo de POST /api/coordinador/sedes/{id_sede}/programas. Solo lo que
    el modal \"Añadir Programa\" realmente captura. La coordinación NO viaja
    aquí: la resuelve el servidor (ver CoordinadorService.crear_programa_sede).
    Los límites de largo replican las columnas de models/programa.py para
    devolver un 422 claro en vez de un 500 de la base de datos.
    """
    nombre: str = Field(min_length=1, max_length=120)
    descripcion: Optional[str] = Field(default=None, max_length=300)
    nivel_formacion: Optional[str] = Field(default=None, max_length=20)
    url_programa: Optional[str] = Field(default=None, max_length=200)

    # ESCUDO ANTI-XSS en todos los campos de texto libre.
    @field_validator("nombre", "descripcion", "nivel_formacion", "url_programa")
    @classmethod
    def _bloquear_scripting(cls, valor):
        return anti_scripting(valor)

    @field_validator("nombre")
    @classmethod
    def _nombre_no_vacio(cls, valor):
        if not valor:
            raise ValueError("El nombre del programa es obligatorio.")
        return valor


class ProgramaSedeUpdate(ProgramaSedeCreate):
    """
    Cuerpo de PUT /api/coordinador/sedes/{id_sede}/programas/{id_programa}.
    Mismos campos que al crear. Solo se modifican los que vienen en la
    petición (descripcion, nivel_formacion y url_programa son opcionales):
    lo que el front no envía se conserva tal cual en la base de datos.
    """


# ==========================================================================
# 5. Fichas de un programa (Sedes > Programas > Ver Fichas)
# ==========================================================================
Jornada = Literal["diurna", "nocturna", "mixta"]


class FichaProgramaResponse(BaseModel):
    id_ficha: int
    estado: str
    trimestre: Optional[int] = None
    horario: Optional[str] = None
    # Derivada del texto de `horario` (no existe columna propia): None si el
    # horario no menciona ninguna jornada reconocible.
    jornada: Optional[Jornada] = None
    fecha_inicio: date
    fecha_fin: date
    num_aprendices: int


class ProgramaFichasResponse(BaseModel):
    id_programa: int
    nombre: str
    nivel_formacion: Optional[str] = None
    fichas: List[FichaProgramaResponse] = []


# PEGAR AL FINAL de backend/schemas/coordinador.py
# Además, en la clase InstructorDetalleResponse agrega, debajo de tipo_contrato:
#     estado_contrato: Optional[str] = None

# ==========================================================================
# Contrato y comentarios del instructor (perfil que consulta el coordinador)
# ==========================================================================
TIPOS_CONTRATO = ("Planta", "Contratista", "Otro")
ESTADOS_CONTRATO = ("Vigente", "No Vigente", "En estudio")


class ContratoInstructorUpdate(BaseModel):
    """None (o "Sin asignar") deja el campo sin asignar."""

    tipo_contrato: Optional[str] = None
    estado_contrato: Optional[str] = None

    @field_validator("tipo_contrato", "estado_contrato", mode="before")
    @classmethod
    def _vacio_es_none(cls, v):
        if v is None:
            return None
        v = str(v).strip()
        return None if v == "" or v.lower() == "sin asignar" else v

    @field_validator("tipo_contrato")
    @classmethod
    def _tipo_valido(cls, v):
        if v is not None and v not in TIPOS_CONTRATO:
            raise ValueError("Tipo de contrato no válido. Opciones: " + ", ".join(TIPOS_CONTRATO))
        return v

    @field_validator("estado_contrato")
    @classmethod
    def _estado_valido(cls, v):
        if v is not None and v not in ESTADOS_CONTRATO:
            raise ValueError("Estado de contrato no válido. Opciones: " + ", ".join(ESTADOS_CONTRATO))
        return v


class ComentarioInstructorCreate(BaseModel):
    texto: str = Field(..., max_length=1000)

    @field_validator("texto")
    @classmethod
    def _texto_no_vacio(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("El comentario no puede estar vacío.")
        return v


class ComentarioInstructorResponse(BaseModel):
    id_comentario: int
    texto: str
    fecha_creacion: datetime
    id_autor: Optional[int] = None
    nombre_autor: str


# ==========================================================================
# Perfil de un aprendiz (vista del coordinador)
# ==========================================================================
class AprendizDetalleResponse(BaseModel):
    """Todo lo que el sistema sabe de un aprendiz, ya "aplanado" desde
    usuario -> ficha -> programa para que la pantalla de perfil no tenga que
    hacer varias consultas. Nunca incluye la contraseña ni datos de seguridad
    del login (intentos fallidos, códigos de recuperación)."""
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

    # Ficha (None si el aprendiz aún no tiene ficha asignada)
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

    # Cuántos archivos ha subido a su portafolio (en total)
    total_archivos_portafolio: int = 0