from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from db.database import Base


class RecuperacionCodigo(Base):

    __tablename__ = "recuperacion_codigo"

    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario", ondelete="CASCADE"), primary_key=True)
    codigo_hash = Column(String(64), nullable=False)
    expira = Column(DateTime(timezone=True), nullable=False)
    intentos = Column(Integer, nullable=False, default=0, server_default="0")
    creado = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
