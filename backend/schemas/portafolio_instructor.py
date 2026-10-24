from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from core.validators import anti_scripting


class CarpetaPortafolioCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    id_padre: Optional[int] = None

    @field_validator("nombre")
    @classmethod
    def _validar_nombre(cls, valor):
        valor = anti_scripting(valor).strip()
        if not valor:
            raise ValueError("El nombre de la carpeta no puede estar vacío.")
        if "/" in valor or "\\" in valor:
            raise ValueError("El nombre no puede contener / ni \\.")
        return valor


class NodoPortafolioResponse(BaseModel):
    id_nodo: int
    tipo: str
    nombre: str
    archivo_url: Optional[str] = None
    tamano_bytes: Optional[int] = None
    modificado_por: Optional[str] = None
    fecha_modificacion: datetime
    # Carpeta: archivos contenidos (en cualquier nivel). Archivo: 0.
    total_archivos: int = 0


class MigaPortafolio(BaseModel):
    id_nodo: int
    nombre: str


class ExploradorPortafolioResponse(BaseModel):
    id_instructor: int
    nombre_instructor: str
    carpeta_actual: Optional[MigaPortafolio] = None
    # Camino desde la raíz hasta la carpeta actual (incluida), para las migas.
    ruta: list[MigaPortafolio]
    items: list[NodoPortafolioResponse]