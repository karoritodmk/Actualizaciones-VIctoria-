
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from db.database import Base
 
 
class Sede(Base):
    __tablename__ = "sede"
 
    id_sede = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(120), nullable=False)
    descripcion = Column(String(500), nullable=True)
 
    # Solo se muestran al expandir la tarjeta de la sede.
    direccion_principal = Column(String(200), nullable=True)
    telefono_atencion = Column(String(200), nullable=True)
    horario_atencion = Column(String(300), nullable=True)

    # Documento adjunto de la sede (PDF o Word). Ver core/uploads.guardar_documento.
    archivo_url = Column(String(300), nullable=True)
    archivo_nombre = Column(String(200), nullable=True)
 
    usuarios = relationship("Usuario", back_populates="sede")
 