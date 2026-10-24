from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from core.security import require_coordinador
from db.database import get_db
from models.usuario import Usuario
from schemas.coordinador import (
    AprendizDetalleResponse,
    CompetenciaDetalleResponse,
    DashboardCoordinadorResponse,
    InstructorDetalleResponse,
    InstructorResumenResponse,
    PortafolioInstructorResponse,
    ProgramaFichasResponse,
    ProgramaSedeCreate,
    ProgramaSedeResponse,
    ProgramaSedeUpdate,
    ComentarioInstructorCreate,
    ComentarioInstructorResponse,
    ContratoInstructorUpdate,
)
from schemas.portafolio import (
    ArchivoPortafolioResponse,
    CarpetaAprendizResponse,
    CarpetaPortafolio,
    SubcarpetaPortafolio,
)
from schemas.sede import SedeResponse
from schemas.tarea import PortafolioAprendizResponse
from services.coordinador_service import CoordinadorService
from services.portafolio_service import PortafolioService

router = APIRouter()


@router.get("/dashboard", response_model=DashboardCoordinadorResponse)
def dashboard(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).obtener_dashboard()


@router.get("/sedes", response_model=list[SedeResponse])
def listar_sedes(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).obtener_sedes()


@router.get("/sedes/{id_sede}", response_model=SedeResponse)
def sede_detalle(
    id_sede: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).obtener_sede_por_id(id_sede)


@router.get("/sedes/{id_sede}/instructores", response_model=list[InstructorResumenResponse])
def instructores_de_sede(
    id_sede: int,
    tipo: Optional[str] = Query(None, description="Filtra por 'planta' | 'tecnico' | 'transversal' | 'contratista'"),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).obtener_instructores_sede(id_sede, tipo)


@router.get("/sedes/{id_sede}/programas", response_model=list[ProgramaSedeResponse])
def programas_de_sede(
    id_sede: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).obtener_programas_sede(id_sede)


@router.post(
    "/sedes/{id_sede}/programas",
    response_model=ProgramaSedeResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_programa_de_sede(
    id_sede: int,
    data: ProgramaSedeCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).crear_programa_sede(id_sede, data, usuario_actual)


@router.put("/sedes/{id_sede}/programas/{id_programa}", response_model=ProgramaSedeResponse)
def actualizar_programa_de_sede(
    id_sede: int,
    id_programa: int,
    data: ProgramaSedeUpdate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).actualizar_programa_sede(id_sede, id_programa, data)


@router.get(
    "/sedes/{id_sede}/programas/{id_programa}/fichas",
    response_model=ProgramaFichasResponse,
)
def fichas_de_programa(
    id_sede: int,
    id_programa: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).obtener_fichas_programa(id_sede, id_programa)


@router.get("/instructores/{id_instructor}", response_model=InstructorDetalleResponse)
def instructor_detalle(
    id_instructor: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).obtener_instructor_detalle(id_instructor)

# 1) En backend/routes/coordinador.py, dentro del import de schemas.coordinador, agrega:
#     ComentarioInstructorCreate,
#     ComentarioInstructorResponse,
#     ContratoInstructorUpdate,
# 2) PEGA estas rutas justo ANTES de @router.get("/instructores/{id_instructor}/portafolio"...):

@router.put("/instructores/{id_instructor}/contrato", response_model=InstructorDetalleResponse)
def actualizar_contrato_instructor(
    id_instructor: int,
    datos: ContratoInstructorUpdate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    """Actualiza el tipo y el estado del contrato del instructor."""
    return CoordinadorService(db).actualizar_contrato_instructor(id_instructor, datos)


@router.get("/instructores/{id_instructor}/comentarios", response_model=list[ComentarioInstructorResponse])
def comentarios_instructor(
    id_instructor: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).listar_comentarios_instructor(id_instructor)


@router.post(
    "/instructores/{id_instructor}/comentarios",
    response_model=ComentarioInstructorResponse,
    status_code=status.HTTP_201_CREATED,
)
def comentar_instructor(
    id_instructor: int,
    datos: ComentarioInstructorCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).crear_comentario_instructor(id_instructor, datos.texto, usuario_actual)


@router.get("/instructores/{id_instructor}/portafolio", response_model=PortafolioInstructorResponse)
def portafolio_instructor(
    id_instructor: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).obtener_portafolio_instructor(id_instructor)


@router.get(
    "/fichas/{id_ficha}/aprendices/{id_aprendiz}/portafolio",
    response_model=PortafolioAprendizResponse,
)
def portafolio_aprendiz(
    id_ficha: int,
    id_aprendiz: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    """Portafolio de un aprendiz (todas las materias de la ficha), solo lectura."""
    return CoordinadorService(db).obtener_portafolio_aprendiz(id_ficha, id_aprendiz)


@router.get(
    "/instructores/{id_instructor}/portafolio/{trimestre}/competencias/{id_competencia}",
    response_model=CompetenciaDetalleResponse,
)
def competencia_detalle(
    id_instructor: int,
    trimestre: int,
    id_competencia: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).obtener_competencia_detalle(id_instructor, trimestre, id_competencia)


# ==========================================================================
# Aprendices: perfil y portafolio (solo lectura para el coordinador)
# Mismas respuestas que /api/portafolio, pero para el aprendiz que se indica.
# ==========================================================================
@router.get("/aprendices/{id_aprendiz}", response_model=AprendizDetalleResponse)
def aprendiz_detalle(
    id_aprendiz: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).obtener_aprendiz_detalle(id_aprendiz)


@router.get("/aprendices/{id_aprendiz}/portafolio/carpetas", response_model=List[CarpetaPortafolio])
def aprendiz_portafolio_carpetas(
    id_aprendiz: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    aprendiz = CoordinadorService(db).obtener_aprendiz_o_404(id_aprendiz)
    return PortafolioService(db).obtener_carpetas(aprendiz)


@router.get(
    "/aprendices/{id_aprendiz}/portafolio/carpetas/{categoria}/subcarpetas",
    response_model=List[SubcarpetaPortafolio],
)
def aprendiz_portafolio_subcarpetas(
    id_aprendiz: int,
    categoria: str,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    aprendiz = CoordinadorService(db).obtener_aprendiz_o_404(id_aprendiz)
    return PortafolioService(db).obtener_subcarpetas(categoria, aprendiz)


@router.get(
    "/aprendices/{id_aprendiz}/portafolio/carpetas/{categoria}/subcarpetas/{subcarpeta}/archivos",
    response_model=List[ArchivoPortafolioResponse],
)
def aprendiz_portafolio_archivos_subcarpeta(
    id_aprendiz: int,
    categoria: str,
    subcarpeta: str,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    aprendiz = CoordinadorService(db).obtener_aprendiz_o_404(id_aprendiz)
    return PortafolioService(db).obtener_archivos_de_subcarpeta(categoria, subcarpeta, aprendiz)


@router.get(
    "/aprendices/{id_aprendiz}/portafolio/carpetas/{categoria}/subcarpetas/{subcarpeta}/carpetas",
    response_model=List[CarpetaAprendizResponse],
)
def aprendiz_portafolio_carpetas_subcarpeta(
    id_aprendiz: int,
    categoria: str,
    subcarpeta: str,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    aprendiz = CoordinadorService(db).obtener_aprendiz_o_404(id_aprendiz)
    return PortafolioService(db).obtener_carpetas_de_subcarpeta(categoria, subcarpeta, aprendiz)


@router.get(
    "/aprendices/{id_aprendiz}/portafolio/carpetas/{categoria}/subcarpetas/{subcarpeta}/carpetas/{id_carpeta}",
    response_model=CarpetaAprendizResponse,
)
def aprendiz_portafolio_detalle_carpeta(
    id_aprendiz: int,
    categoria: str,
    subcarpeta: str,
    id_carpeta: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    aprendiz = CoordinadorService(db).obtener_aprendiz_o_404(id_aprendiz)
    return PortafolioService(db).obtener_detalle_carpeta(categoria, subcarpeta, id_carpeta, aprendiz)


@router.get(
    "/aprendices/{id_aprendiz}/portafolio/carpetas/{categoria}/subcarpetas/{subcarpeta}/carpetas/{id_carpeta}/archivos",
    response_model=List[ArchivoPortafolioResponse],
)
def aprendiz_portafolio_archivos_carpeta(
    id_aprendiz: int,
    categoria: str,
    subcarpeta: str,
    id_carpeta: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    aprendiz = CoordinadorService(db).obtener_aprendiz_o_404(id_aprendiz)
    return PortafolioService(db).obtener_archivos_de_carpeta(categoria, subcarpeta, id_carpeta, aprendiz)