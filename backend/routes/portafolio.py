
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from models.usuario import Usuario
from schemas.portafolio import (
    CarpetaPortafolio,
    SubcarpetaPortafolio,
    ArchivoPortafolioResponse,
    CarpetaAprendizCrear,
    CarpetaAprendizResponse,
)
from services.portafolio_service import PortafolioService
from core.security import get_current_active_user
from core.uploads import borrar_adjunto, guardar_adjunto, nombre_para_mostrar

router = APIRouter()

# Los adjuntos (extensiones, tamaño, carpeta) se manejan en core/uploads.py.


@router.get("/carpetas", response_model=List[CarpetaPortafolio])
def listar_carpetas(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_active_user),
):
    """Las 5 carpetas fijas del portafolio del aprendiz logueado, con
    conteo de archivos y fecha de la última subida. La usa
    /victoria/portafolio (index)."""
    return PortafolioService(db).obtener_carpetas(usuario_actual)


@router.get("/carpetas/{categoria}/subcarpetas", response_model=List[SubcarpetaPortafolio])
def listar_subcarpetas(
    categoria: str,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_active_user),
):
    """Las 4 subcarpetas de trimestre dentro de una carpeta puntual. La
    usa /victoria/portafolio/[categoria]."""
    return PortafolioService(db).obtener_subcarpetas(categoria, usuario_actual)


@router.get(
    "/carpetas/{categoria}/subcarpetas/{subcarpeta}/archivos",
    response_model=List[ArchivoPortafolioResponse],
)
def listar_archivos_de_subcarpeta(
    categoria: str,
    subcarpeta: str,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_active_user),
):
    """Archivos sueltos que el aprendiz logueado subió a una subcarpeta
    puntual. La usa /victoria/portafolio/[categoria]/[subcarpeta]."""
    return PortafolioService(db).obtener_archivos_de_subcarpeta(categoria, subcarpeta, usuario_actual)


@router.post(
    "/carpetas/{categoria}/subcarpetas/{subcarpeta}/archivos",
    response_model=ArchivoPortafolioResponse,
    status_code=status.HTTP_201_CREATED,
)
async def subir_archivo_a_subcarpeta(
    categoria: str,
    subcarpeta: str,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_active_user),
):
    """Sube un archivo a una subcarpeta puntual del portafolio del
    aprendiz logueado (botón "Nuevo" del frontend)."""
    url = await guardar_adjunto(archivo)
    try:
        return PortafolioService(db).agregar_archivo(
            categoria=categoria,
            subcarpeta=subcarpeta,
            nombre_archivo=nombre_para_mostrar(archivo, url.rsplit("/", 1)[-1]),
            url=url,
            aprendiz=usuario_actual,
        )
    except Exception:
        borrar_adjunto(url)  # no dejar el archivo huérfano si la BD lo rechazó
        raise


@router.get(
    "/carpetas/{categoria}/subcarpetas/{subcarpeta}/carpetas",
    response_model=List[CarpetaAprendizResponse],
)
def listar_carpetas_de_subcarpeta(
    categoria: str,
    subcarpeta: str,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_active_user),
):
    """Carpetas que el aprendiz logueado creó dentro de un trimestre.
    La usa /victoria/portafolio/[categoria]/[subcarpeta]."""
    return PortafolioService(db).obtener_carpetas_de_subcarpeta(categoria, subcarpeta, usuario_actual)


@router.post(
    "/carpetas/{categoria}/subcarpetas/{subcarpeta}/carpetas",
    response_model=CarpetaAprendizResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_carpeta_en_subcarpeta(
    categoria: str,
    subcarpeta: str,
    datos: CarpetaAprendizCrear,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_active_user),
):
    """Crea una carpeta dentro de un trimestre (botón Carpeta Nueva)."""
    return PortafolioService(db).crear_carpeta(categoria, subcarpeta, datos.nombre, usuario_actual)

@router.get(
    "/carpetas/{categoria}/subcarpetas/{subcarpeta}/carpetas/{id_carpeta}",
    response_model=CarpetaAprendizResponse,
)
def obtener_carpeta(
    categoria: str,
    subcarpeta: str,
    id_carpeta: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_active_user),
):
    """Datos de una carpeta creada por el aprendiz (nombre y conteo de
    archivos), para el encabezado de la pantalla al entrar a ella."""
    return PortafolioService(db).obtener_detalle_carpeta(categoria, subcarpeta, id_carpeta, usuario_actual)


@router.get(
    "/carpetas/{categoria}/subcarpetas/{subcarpeta}/carpetas/{id_carpeta}/archivos",
    response_model=List[ArchivoPortafolioResponse],
)
def listar_archivos_de_carpeta(
    categoria: str,
    subcarpeta: str,
    id_carpeta: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_active_user),
):
    """Archivos dentro de una carpeta creada por el aprendiz."""
    return PortafolioService(db).obtener_archivos_de_carpeta(categoria, subcarpeta, id_carpeta, usuario_actual)


@router.post(
    "/carpetas/{categoria}/subcarpetas/{subcarpeta}/carpetas/{id_carpeta}/archivos",
    response_model=ArchivoPortafolioResponse,
    status_code=status.HTTP_201_CREATED,
)
async def subir_archivo_a_carpeta(
    categoria: str,
    subcarpeta: str,
    id_carpeta: int,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(get_current_active_user),
):
    """Sube un archivo dentro de una carpeta creada por el aprendiz."""
    url = await guardar_adjunto(archivo)
    try:
        return PortafolioService(db).agregar_archivo_a_carpeta(
            categoria=categoria,
            subcarpeta=subcarpeta,
            id_carpeta=id_carpeta,
            nombre_archivo=nombre_para_mostrar(archivo, url.rsplit("/", 1)[-1]),
            url=url,
            aprendiz=usuario_actual,
        )
    except Exception:
        borrar_adjunto(url)  # no dejar el archivo huérfano si la BD lo rechazó
        raise