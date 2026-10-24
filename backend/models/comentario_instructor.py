from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from db.database import Base


class ComentarioInstructor(Base):
    """Comentario que un coordinador deja sobre un instructor (perfil del instructor)."""

    __tablename__ = "comentario_instructor"

    id_comentario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_instructor = Column(
        Integer, ForeignKey("usuario.id_usuario", ondelete="CASCADE"), nullable=False, index=True
    )
    # Si el autor se elimina, el comentario se conserva (queda "Usuario eliminado").
    id_autor = Column(Integer, ForeignKey("usuario.id_usuario", ondelete="SET NULL"), nullable=True)
    texto = Column(String(1000), nullable=False)
    fecha_creacion = Column(DateTime, nullable=False, default=datetime.utcnow)