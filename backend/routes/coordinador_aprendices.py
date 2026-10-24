"""Rutas del COORDINADOR para consultar un aprendiz y su portafolio (SOLO LECTURA).

Todas exigen rol coordinador (require_coordinador): aprendices e instructores reciben 403.
Se registran en main.py con el prefijo /api/coordinador.
"""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.security import require_coordinador
from db.database import get_db
from models.usuario import Usuario
from schemas.coordinador_aprendiz import AprendizDetalleResponse
from schemas.portafolio import (
    ArchivoPortafolioResponse,
    CarpetaAprendizResponse,
    CarpetaPortafolio,
    SubcarpetaPortafolio,
)
from services.coordinador_aprendiz_service import CoordinadorAprendizService

router = APIRouter()
BASE = "/aprendices/{id_aprendiz}"
PORT = BASE + "/portafolio/carpetas"


@router.get(BASE, response_model=AprendizDetalleResponse)
def detalle_aprendiz(
    id_aprendiz: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    """Perfil del aprendiz (datos personales, ficha, programa y total de archivos)."""
    return CoordinadorAprendizService(db).detalle(id_aprendiz)


@router.get(PORT, response_model=List[CarpetaPortafolio])
def portafolio_carpetas(
    id_aprendiz: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    s = CoordinadorAprendizService(db)
    return s.portafolio().obtener_carpetas(s.aprendiz_o_404(id_aprendiz))


@router.get(PORT + "/{categoria}/subcarpetas", response_model=List[SubcarpetaPortafolio])
def portafolio_subcarpetas(
    id_aprendiz: int,
    categoria: str,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    s = CoordinadorAprendizService(db)
    return s.portafolio().obtener_subcarpetas(categoria, s.aprendiz_o_404(id_aprendiz))


@router.get(PORT + "/{categoria}/subcarpetas/{subcarpeta}/archivos", response_model=List[ArchivoPortafolioResponse])
def portafolio_archivos_subcarpeta(
    id_aprendiz: int,
    categoria: str,
    subcarpeta: str,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    s = CoordinadorAprendizService(db)
    return s.portafolio().obtener_archivos_de_subcarpeta(categoria, subcarpeta, s.aprendiz_o_404(id_aprendiz))


@router.get(PORT + "/{categoria}/subcarpetas/{subcarpeta}/carpetas", response_model=List[CarpetaAprendizResponse])
def portafolio_carpetas_subcarpeta(
    id_aprendiz: int,
    categoria: str,
    subcarpeta: str,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    s = CoordinadorAprendizService(db)
    return s.portafolio().obtener_carpetas_de_subcarpeta(categoria, subcarpeta, s.aprendiz_o_404(id_aprendiz))


@router.get(PORT + "/{categoria}/subcarpetas/{subcarpeta}/carpetas/{id_carpeta}", response_model=CarpetaAprendizResponse)
def portafolio_detalle_carpeta(
    id_aprendiz: int,
    categoria: str,
    subcarpeta: str,
    id_carpeta: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    s = CoordinadorAprendizService(db)
    return s.portafolio().obtener_detalle_carpeta(categoria, subcarpeta, id_carpeta, s.aprendiz_o_404(id_aprendiz))


@router.get(
    PORT + "/{categoria}/subcarpetas/{subcarpeta}/carpetas/{id_carpeta}/archivos",
    response_model=List[ArchivoPortafolioResponse],
)
def portafolio_archivos_carpeta(
    id_aprendiz: int,
    categoria: str,
    subcarpeta: str,
    id_carpeta: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_coordinador),
):
    s = CoordinadorAprendizService(db)
    return s.portafolio().obtener_archivos_de_carpeta(categoria, subcarpeta, id_carpeta, s.aprendiz_o_404(id_aprendiz))
