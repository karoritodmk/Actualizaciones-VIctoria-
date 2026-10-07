
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from core.security import require_coordinador
from db.database import get_db
from models.usuario import Usuario
from schemas.coordinador import (
    CompetenciaDetalleResponse,
    DashboardCoordinadorResponse,
    InstructorDetalleResponse,
    InstructorResumenResponse,
    PortafolioInstructorResponse,
    ProgramaFichasResponse,
    ProgramaSedeCreate,
    ProgramaSedeResponse,
    ProgramaSedeUpdate,
)
from schemas.sede import SedeResponse
from services.coordinador_service import CoordinadorService

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


@router.get("/instructores/{id_instructor}/portafolio", response_model=PortafolioInstructorResponse)
def portafolio_instructor(
    id_instructor: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    return CoordinadorService(db).obtener_portafolio_instructor(id_instructor)


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
