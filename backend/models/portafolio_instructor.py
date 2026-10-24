from datetime import datetime

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import backref, relationship

from db.database import Base


class NodoPortafolioInstructor(Base):
    """Elemento (carpeta o archivo) del portafolio de un instructor.

    Forma un árbol: cada nodo apunta a su carpeta padre (id_padre) y las
    carpetas raíz tienen id_padre NULL. Al borrar una carpeta se borra todo lo
    que contiene (cascade); los archivos físicos los borra el service.
    """

    __tablename__ = "nodo_portafolio_instructor"

    id_nodo = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_instructor = Column(
        Integer, ForeignKey("usuario.id_usuario", ondelete="CASCADE"), nullable=False, index=True
    )
    id_padre = Column(
        Integer, ForeignKey("nodo_portafolio_instructor.id_nodo", ondelete="CASCADE"), nullable=True, index=True
    )
    tipo = Column(String(10), nullable=False)  # "carpeta" | "archivo"
    nombre = Column(String(200), nullable=False)
    archivo_url = Column(String(300), nullable=True)
    tamano_bytes = Column(BigInteger, nullable=True)
    # Si quien modificó se elimina, el elemento se conserva (queda sin autor).
    id_modificado_por = Column(Integer, ForeignKey("usuario.id_usuario", ondelete="SET NULL"), nullable=True)
    fecha_modificacion = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    instructor = relationship("Usuario", foreign_keys=[id_instructor])
    modificado_por = relationship("Usuario", foreign_keys=[id_modificado_por])
    hijos = relationship(
        "NodoPortafolioInstructor",
        cascade="all, delete-orphan",
        backref=backref("padre", remote_side=[id_nodo]),
    )