"""
Se importa el paquete "models" completo (no un modelo suelto) para que
TODOS los modelos queden registrados en Base.metadata ANTES de llamar a
create_all(). Ver main.py.
"""
from .rol import Rol
from .sede import Sede
from .coordinacion import Coordinacion
from .proyecto import Proyecto
from .competencia import Competencia
from .materiales import Material
from .ficha import Ficha
from .programa import Programa
from .usuario import Usuario
from .tarea import Tarea
from .archivo_tarea import ArchivoTarea
from .entrega import Entrega
from .archivo_entrega import ArchivoEntrega
from .archivo_portafolio import ArchivoPortafolio
from .carpeta_portafolio import CarpetaAprendiz
from .asignacion_instructor import AsignacionInstructor
from .nota import Nota
from .notificacion import Notificacion
__all__ = [
    "Rol",
    "Sede",
    "Coordinacion",
    "Proyecto",
    "Programa",
    "Ficha",
    "Competencia",
    "Material",
    "Usuario",
    "Tarea",
    "Entrega",
    "AsignacionInstructor",
    "Nota",
    "Notificacion",
]
