import py_compile
import re
import shutil
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
hechos, avisos = [], []

MODELO_PORTAFOLIO_INSTRUCTOR = 'from sqlalchemy import Column, DateTime, ForeignKey, Integer, String\nfrom sqlalchemy.orm import backref, relationship\nfrom sqlalchemy.sql import func\n\nfrom db.database import Base\n\n\nclass NodoPortafolioInstructor(Base):\n    """Elemento (carpeta o archivo) del portafolio de un instructor.\n\n    Es un árbol: `id_padre` apunta a la carpeta que lo contiene (NULL = raíz).\n    Borrar una carpeta borra todo lo que contiene (cascade). Cada cambio\n    guarda quién lo hizo (`id_modificado_por`) y cuándo (`fecha_modificacion`).\n    """\n\n    __tablename__ = "nodo_portafolio_instructor"\n\n    id_nodo = Column(Integer, primary_key=True, index=True, autoincrement=True)\n    id_instructor = Column(\n        Integer, ForeignKey("usuario.id_usuario", ondelete="CASCADE"), nullable=False, index=True\n    )\n    id_padre = Column(\n        Integer,\n        ForeignKey("nodo_portafolio_instructor.id_nodo", ondelete="CASCADE"),\n        nullable=True,\n        index=True,\n    )\n    tipo = Column(String(10), nullable=False)  # \'carpeta\' | \'archivo\'\n    nombre = Column(String(200), nullable=False)\n    archivo_url = Column(String(300), nullable=True)\n    tamano_bytes = Column(Integer, nullable=True)\n    id_modificado_por = Column(Integer, ForeignKey("usuario.id_usuario", ondelete="SET NULL"), nullable=True)\n    fecha_modificacion = Column(\n        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False\n    )\n\n    instructor = relationship("Usuario", foreign_keys=[id_instructor])\n    modificado_por = relationship("Usuario", foreign_keys=[id_modificado_por])\n    hijos = relationship(\n        "NodoPortafolioInstructor",\n        cascade="all, delete-orphan",\n        backref=backref("padre", remote_side=[id_nodo]),\n    )\n'


def leer(ruta):
    b = ruta.read_bytes()
    nl = "\r\n" if b"\r\n" in b else "\n"
    return b.decode("utf-8").replace("\r\n", "\n"), nl


def escribir(ruta, texto, nl):
    ruta.write_bytes(texto.replace("\n", nl).encode("utf-8"))


def respaldar(ruta):
    bak = ruta.with_suffix(ruta.suffix + ".bak")
    if not bak.exists():
        shutil.copy2(ruta, bak)


def parchar(rel, descripcion, ya_hecho, cambios):
    ruta = RAIZ / rel
    if not ruta.exists():
        avisos.append(f"{rel}: NO existe, se omitió ({descripcion})")
        return
    texto, nl = leer(ruta)
    if ya_hecho(texto):
        hechos.append(f"ya estaba      {rel}: {descripcion}")
        return
    nuevo = texto
    for viejo, reemplazo in cambios:
        if viejo not in nuevo:
            avisos.append(f"{rel}: no encontré el texto esperado para «{descripcion}». Aplícalo a mano (ver LEEME).")
            return
        nuevo = nuevo.replace(viejo, reemplazo, 1)
    respaldar(ruta)
    escribir(ruta, nuevo, nl)
    hechos.append(f"APLICADO       {rel}: {descripcion}")


# 0) comprobaciones previas -------------------------------------------------
if not (RAIZ / "main.py").exists() or not (RAIZ / "routes").is_dir():
    sys.exit("Ejecuta este script DENTRO de la carpeta backend (donde está main.py).")
for nuevo in (
    "routes/coordinador_aprendices.py",
    "schemas/coordinador_aprendiz.py",
    "services/coordinador_aprendiz_service.py",
):
    if not (RAIZ / nuevo).exists():
        sys.exit(f"Falta el archivo nuevo {nuevo}. Copia primero las carpetas routes/, schemas/ y services/ de la entrega sobre tu backend.")

# 1) main.py: registrar las rutas nuevas + migraciones al arrancar ----------
parchar(
    "main.py",
    "importar las rutas del coordinador sobre aprendices",
    lambda t: "coordinador_aprendices_router" in t,
    [("from routes.portafolio_instructor import router as portafolio_instructor_router\n",
      "from routes.portafolio_instructor import router as portafolio_instructor_router\n"
      "from routes.coordinador_aprendices import router as coordinador_aprendices_router\n")],
)
parchar(
    "main.py",
    "registrar /api/coordinador/aprendices/...",
    lambda t: "include_router(coordinador_aprendices_router" in t,
    [('app.include_router(coordinador_router, prefix="/api/coordinador", tags=["Coordinador"])\n',
      'app.include_router(coordinador_router, prefix="/api/coordinador", tags=["Coordinador"])\n'
      'app.include_router(coordinador_aprendices_router, prefix="/api/coordinador", tags=["Coordinador"])\n')],
)
parchar(
    "main.py",
    "ejecutar las migraciones (columnas nuevas) al arrancar",
    lambda t: "aplicar_migraciones(engine)" in t,
    [("Base.metadata.create_all(bind=engine)\n",
      "Base.metadata.create_all(bind=engine)\n\n"
      "# create_all() crea tablas que faltan pero NO agrega columnas a tablas que ya\n"
      "# existen. Esto las agrega (sentencias idempotentes, seguras en cada arranque).\n"
      "from db.migraciones import aplicar_migraciones  # noqa: E402\n"
      "aplicar_migraciones(engine)\n")],
)

# 2) migraciones: columnas de las funciones nuevas --------------------------
parchar(
    "db/migraciones.py",
    "columnas estado_contrato y archivo de competencia",
    lambda t: "estado_contrato" in t and "competencia ADD COLUMN IF NOT EXISTS archivo_url" in t,
    [("    # Tamaños de sede:",
      "    # Estado del contrato del instructor (Vigente / No Vigente / En estudio)\n"
      '    "ALTER TABLE usuario ADD COLUMN IF NOT EXISTS estado_contrato VARCHAR(30)",\n'
      "    # Documento de actividades (PDF/Word) de cada competencia\n"
      '    "ALTER TABLE competencia ADD COLUMN IF NOT EXISTS archivo_url VARCHAR(300)",\n'
      '    "ALTER TABLE competencia ADD COLUMN IF NOT EXISTS archivo_nombre VARCHAR(200)",\n'
      "    # Tamaños de sede:")],
)

# 3) SEGURIDAD: la lista completa de usuarios solo para el coordinador ------
ruta = RAIZ / "routes/usuario.py"
if ruta.exists():
    texto, nl = leer(ruta)
    m = re.search(r"def listar_usuarios\((.*?)\):\n", texto, re.S)
    if not m:
        avisos.append("routes/usuario.py: no encontré listar_usuarios")
    elif "require_coordinador" in m.group(1):
        hechos.append("ya estaba      routes/usuario.py: GET /api/usuarios/ solo coordinador")
    else:
        firma = m.group(1)
        nueva = firma.replace("Depends(get_current_active_user)", "Depends(require_coordinador)")
        nueva = nueva.replace(
            "usuario_actual: Usuario = Depends(require_coordinador)",
            "# Antes: cualquier usuario logueado (incluido un aprendiz) recibía documento,\n"
            "    # correos, teléfono y fecha de nacimiento de TODOS. Solo el coordinador la usa.\n"
            "    usuario_actual: Usuario = Depends(require_coordinador)",
            1,
        )
        respaldar(ruta)
        escribir(ruta, texto.replace(firma, nueva, 1), nl)
        hechos.append("APLICADO       routes/usuario.py: GET /api/usuarios/ solo coordinador")
    t2, _ = leer(ruta)
    if "require_coordinador" not in t2.split("def listar_usuarios")[0]:
        avisos.append("routes/usuario.py: verifica que importe require_coordinador desde core.security")

# 4) SEGURIDAD: el registro ya no es público ---------------------------------
ruta = RAIZ / "api/v1/auth.py"
if ruta.exists():
    texto, nl = leer(ruta)
    m = re.search(r"def registrar\((.*?)\):\n", texto, re.S)
    if not m:
        avisos.append("api/v1/auth.py: no encontré registrar")
    elif "require_coordinador" in m.group(1):
        hechos.append("ya estaba      api/v1/auth.py: registro solo coordinador")
    else:
        nuevo = texto.replace(
            m.group(0),
            "def registrar(\n    usuario: UsuarioRegistroPublico,\n    db: Session = Depends(get_db),\n"
            "    # Antes era pública: cualquiera podía crearse una cuenta y elegir su ficha.\n"
            "    usuario_actual: Usuario = Depends(require_coordinador),\n):\n",
            1,
        )
        if "require_coordinador" not in nuevo.split("def registrar")[0]:
            nuevo = re.sub(
                r"from core\.security import ([^\n]+)",
                lambda mm: "from core.security import " + mm.group(1) + ", require_coordinador",
                nuevo,
                count=1,
            )
        respaldar(ruta)
        escribir(ruta, nuevo, nl)
        hechos.append("APLICADO       api/v1/auth.py: registro solo coordinador")

# 5) modelo del portafolio del instructor (estaba roto) ----------------------
ruta = RAIZ / "models/portafolio_instructor.py"
if ruta.exists():
    texto, nl = leer(ruta)
    if "class NodoPortafolioInstructor" in texto:
        hechos.append("ya estaba      models/portafolio_instructor.py: modelo correcto")
    else:
        respaldar(ruta)
        escribir(ruta, MODELO_PORTAFOLIO_INSTRUCTOR, nl)
        hechos.append("APLICADO       models/portafolio_instructor.py: restaurado el modelo (tenía un esquema Pydantic)")

# 6) limpieza: comentarios de instrucciones que quedaron pegados en el servicio
ruta = RAIZ / "services/coordinador_service.py"
if ruta.exists():
    texto, nl = leer(ruta)
    limpio = re.sub(
        r"\n *# 1\) En backend/services/coordinador_service\.py.*?# 3\) PEGA estos métodos DENTRO.*?\n(?:#[^\n]*\n)*\n",
        "\n",
        texto,
        count=1,
        flags=re.S,
    )
    if limpio != texto:
        respaldar(ruta)
        escribir(ruta, limpio, nl)
        hechos.append("APLICADO       services/coordinador_service.py: quitados comentarios de instrucciones")

# 7) verificación: ¿compilan los archivos tocados? --------------------------
print("\n=========== RESULTADO ===========")
for h in hechos:
    print(" ", h)
for a in avisos:
    print("  ⚠", a)
errores = 0
for rel in ("main.py", "routes/usuario.py", "api/v1/auth.py", "models/portafolio_instructor.py",
            "routes/coordinador_aprendices.py", "services/coordinador_aprendiz_service.py",
            "schemas/coordinador_aprendiz.py", "services/coordinador_service.py"):
    try:
        py_compile.compile(str(RAIZ / rel), doraise=True)
    except Exception as e:  # noqa: BLE001
        errores += 1
        print(f"  ✘ {rel} NO compila: {e}")
if not errores:
    print("  ✔ todos los archivos compilan")
print("\nSiguiente paso: reinicia uvicorn (python -m uvicorn main:app --reload).")
