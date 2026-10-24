from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status
from sqlalchemy.orm import Session

from core.security import require_instructor_o_coordinador
from db.database import get_db
from models.usuario import Usuario
from schemas.portafolio_instructor import (
    CarpetaPortafolioCreate,
    ExploradorPortafolioResponse,
    NodoPortafolioResponse,
)
from services.portafolio_instructor_service import PortafolioInstructorService

router = APIRouter()


def _autorizar(usuario: Usuario, id_instructor: int) -> None:
    """El coordinador administra el portafolio de cualquier instructor; un
    instructor solo el suyo."""
    rol = (usuario.rol.nombre_rol or "").lower() if usuario.rol else ""
    if rol != "coordinador" and usuario.id_usuario != id_instructor:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Solo puedes ver tu propio portafolio.")


@router.get("/{id_instructor}", response_model=ExploradorPortafolioResponse)
def explorar(
    id_instructor: int,
    id_padre: Optional[int] = Query(None, description="Carpeta a abrir; vacío = raíz del portafolio"),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_instructor_o_coordinador),
):
    _autorizar(usuario_actual, id_instructor)
    return PortafolioInstructorService(db).explorar(id_instructor, id_padre, usuario_actual.id_usuario)


@router.post(
    "/{id_instructor}/carpetas",
    response_model=NodoPortafolioResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_carpeta(
    id_instructor: int,
    data: CarpetaPortafolioCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_instructor_o_coordinador),
):
    _autorizar(usuario_actual, id_instructor)
    return PortafolioInstructorService(db).crear_carpeta(
        id_instructor, data.nombre, data.id_padre, usuario_actual
    )


@router.post(
    "/{id_instructor}/archivos",
    response_model=NodoPortafolioResponse,
    status_code=status.HTTP_201_CREATED,
)
async def subir_archivo(
    id_instructor: int,
    id_padre: Optional[int] = Query(None),
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_instructor_o_coordinador),
):
    _autorizar(usuario_actual, id_instructor)
    return await PortafolioInstructorService(db).subir_archivo(
        id_instructor, id_padre, archivo, usuario_actual
    )


@router.delete("/nodos/{id_nodo}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar(
    id_nodo: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(require_instructor_o_coordinador),
):
    servicio = PortafolioInstructorService(db)
    nodo = servicio.nodo_o_404(id_nodo)
    _autorizar(usuario_actual, nodo.id_instructor)
    servicio.eliminar(nodo)
    return Response(status_code=status.HTTP_204_NO_CONTENT)