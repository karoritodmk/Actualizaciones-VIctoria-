"""
Migraciones ligeras y repetibles (PostgreSQL).

Base.metadata.create_all() (main.py) crea las tablas que faltan, pero NUNCA
modifica una tabla que ya existe. Cuando se agregan columnas a un modelo, una
base de datos creada antes falla con "column ... does not exist". Estas
sentencias son idempotentes (IF NOT EXISTS / DROP NOT NULL), así que se pueden
ejecutar en cada arranque sin riesgo.
"""
import logging

from sqlalchemy import text

logger = logging.getLogger(__name__)

_SENTENCIAS = [
    # Documento adjunto (PDF/Word) de cada sede
    "ALTER TABLE sede ADD COLUMN IF NOT EXISTS archivo_url VARCHAR(300)",
    "ALTER TABLE sede ADD COLUMN IF NOT EXISTS archivo_nombre VARCHAR(200)",
    # Programas: pertenecen a una sede, llevan documento y ya no exigen
    # enlace ni coordinación (los programas creados desde una sede no los piden)
    "ALTER TABLE programa ADD COLUMN IF NOT EXISTS id_sede INTEGER REFERENCES sede(id_sede) ON DELETE SET NULL",
    "ALTER TABLE programa ADD COLUMN IF NOT EXISTS archivo_url VARCHAR(300)",
    "ALTER TABLE programa ADD COLUMN IF NOT EXISTS archivo_nombre VARCHAR(200)",
    "ALTER TABLE programa ALTER COLUMN url_programa DROP NOT NULL",
    "ALTER TABLE programa ALTER COLUMN id_coordinacion DROP NOT NULL",
    # Tamaños de sede: el script SQL viejo los creaba más cortos que el modelo
    # (teléfono 20, horario 100, descripción 300) y un valor largo daba error 500.
    "ALTER TABLE sede ALTER COLUMN descripcion TYPE VARCHAR(500)",
    "ALTER TABLE sede ALTER COLUMN telefono_atencion TYPE VARCHAR(200)",
    "ALTER TABLE sede ALTER COLUMN horario_atencion TYPE VARCHAR(300)",
]


def aplicar_migraciones(engine) -> None:
    """Cada sentencia va en su propia transacción: si una falla (por ejemplo,
    la tabla aún no existe), las demás se siguen aplicando y el servidor
    arranca igual; el error queda en el log."""
    for sentencia in _SENTENCIAS:
        try:
            with engine.begin() as conexion:
                conexion.execute(text(sentencia))
        except Exception:
            logger.exception("Migración omitida: %s", sentencia)
