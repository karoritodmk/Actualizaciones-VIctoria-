from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base

class Competencia(Base):
    __tablename__ = 'competencia'

    id_competencia = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(120), nullable=False)
    descripcion = Column(String(300), nullable=True)
    trimestre = Column(String(2), nullable=False)
    fecha_carga = Column(DateTime, nullable=False)



    id_programa = Column(
        Integer,
        ForeignKey("programa.id_programa", ondelete="SET NULL", use_alter=True, name="fk_competencia_programa"),
        nullable=True,
    )
    id_instructor = Column(
        Integer,
        ForeignKey("usuario.id_usuario", ondelete="SET NULL"),
        nullable=True,
    )

    programa = relationship("Programa", foreign_keys=[id_programa])
    instructor = relationship("Usuario", foreign_keys=[id_instructor])
