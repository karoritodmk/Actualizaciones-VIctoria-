from typing import Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from core.uploads import borrar_adjunto, guardar_adjunto, nombre_para_mostrar
from models.portafolio_instructor import NodoPortafolioInstructor as Nodo
from models.usuario import Usuario

# Estructura que se crea sola la primera vez que se abre el portafolio de un
# instructor (la de las pantallas de diseño). Después cada quien la modifica
# libremente. Solo se siembra cuando el instructor no tiene NINGÚN elemento.
ESTRUCTURA_BASE: dict[str, dict] = {
    "COMPETENCIAS COMPORTAMENTALES": {
        "APRENDIZAJE CONTINUO": {},
        "LIDERAZGO": {},
        "TRABAJO EN EQUIPO": {},
        "VOCACION DEL SERVICIO": {},
    },
    "COMPETENCIAS FUNCIONALES": {
        "EJECUCION": {
            "TRIM I": {
                "1. 3407179": {},
                "2. 3407169": {
                    "Sesion 1 - feb 9": {},
                    "Sesion 2 - Feb 16": {},
                    "Sesion 3 - Feb 23": {},
                    "Sesion 4 - mar 2": {},
                },
                "3. 3407177": {},
                "4. 3407178": {},
                "Manejo de apoyo": {},
            },
            "TRIM II": {},
            "TRIM III": {},
        },
        "EVALUACION": {"INDUCCION": {}, "TRIM I": {}, "TRIM II": {}},
        "PLANEACION": {},
    },
}


def _nombre_corto(u: Optional[Usuario]) -> Optional[str]:
    if not u:
        return None
    inicial = f" {u.apellido.strip()[0]}." if u.apellido and u.apellido.strip() else ""
    return f"{u.nombre.strip()}{inicial}"


class PortafolioInstructorService:
    def __init__(self, db: Session):
        self.db = db

    # ------------------------------------------------------------------
    def _instructor_o_404(self, id_instructor: int) -> Usuario:
        u = self.db.query(Usuario).filter(Usuario.id_usuario == id_instructor).first()
        if not u or not u.rol or (u.rol.nombre_rol or "").lower() != "instructor":
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Instructor no encontrado.")
        return u

    def _carpeta_o_404(self, id_instructor: int, id_nodo: int) -> Nodo:
        n = (
            self.db.query(Nodo)
            .filter(Nodo.id_nodo == id_nodo, Nodo.id_instructor == id_instructor)
            .first()
        )
        if not n or n.tipo != "carpeta":
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Carpeta no encontrada.")
        return n

    def nodo_o_404(self, id_nodo: int) -> Nodo:
        n = self.db.query(Nodo).filter(Nodo.id_nodo == id_nodo).first()
        if not n:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Elemento no encontrado.")
        return n

    def _sembrar(self, id_instructor: int, id_creador: Optional[int]) -> None:
        def crear(arbol: dict, id_padre: Optional[int]):
            for nombre, hijos in arbol.items():
                n = Nodo(
                    id_instructor=id_instructor,
                    id_padre=id_padre,
                    tipo="carpeta",
                    nombre=nombre,
                    id_modificado_por=id_creador,
                )
                self.db.add(n)
                self.db.flush()
                crear(hijos, n.id_nodo)

        crear(ESTRUCTURA_BASE, None)
        self.db.commit()

    def _validar_nombre_libre(self, id_instructor: int, id_padre: Optional[int], nombre: str) -> None:
        q = self.db.query(Nodo).filter(Nodo.id_instructor == id_instructor)
        q = q.filter(Nodo.id_padre.is_(None)) if id_padre is None else q.filter(Nodo.id_padre == id_padre)
        if any(n.nombre.lower() == nombre.lower() for n in q.all()):
            raise HTTPException(
                status.HTTP_409_CONFLICT, f'Ya existe un elemento llamado "{nombre}" en esta carpeta.'
            )

    def _tocar(self, id_padre: Optional[int], id_usuario: int) -> None:
        if id_padre is None:
            return
        padre = self.db.query(Nodo).filter(Nodo.id_nodo == id_padre).first()
        if padre:
            padre.id_modificado_por = id_usuario  # onupdate refresca fecha_modificacion

    # ------------------------------------------------------------------
    def explorar(self, id_instructor: int, id_padre: Optional[int], id_usuario: int) -> dict:
        instructor = self._instructor_o_404(id_instructor)

        todos = self.db.query(Nodo).filter(Nodo.id_instructor == id_instructor).all()
        if not todos:
            self._sembrar(id_instructor, id_usuario)
            todos = self.db.query(Nodo).filter(Nodo.id_instructor == id_instructor).all()

        por_id = {n.id_nodo: n for n in todos}
        hijos_de: dict[Optional[int], list[Nodo]] = {}
        for n in todos:
            hijos_de.setdefault(n.id_padre, []).append(n)

        if id_padre is not None and (id_padre not in por_id or por_id[id_padre].tipo != "carpeta"):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Carpeta no encontrada.")

        def contar_archivos(n: Nodo) -> int:
            if n.tipo == "archivo":
                return 0
            return sum(1 if h.tipo == "archivo" else contar_archivos(h) for h in hijos_de.get(n.id_nodo, []))

        ruta = []
        cursor = por_id.get(id_padre) if id_padre is not None else None
        while cursor is not None:
            ruta.append({"id_nodo": cursor.id_nodo, "nombre": cursor.nombre})
            cursor = por_id.get(cursor.id_padre) if cursor.id_padre else None
        ruta.reverse()

        items = sorted(
            hijos_de.get(id_padre, []),
            key=lambda n: (n.tipo != "carpeta", n.nombre.lower()),
        )
        return {
            "id_instructor": id_instructor,
            "nombre_instructor": f"{instructor.nombre} {instructor.apellido or ''}".strip(),
            "carpeta_actual": ruta[-1] if ruta else None,
            "ruta": ruta,
            "items": [self._a_dict(n, contar_archivos(n)) for n in items],
        }

    def _a_dict(self, n: Nodo, total_archivos: int = 0) -> dict:
        return {
            "id_nodo": n.id_nodo,
            "tipo": n.tipo,
            "nombre": n.nombre,
            "archivo_url": n.archivo_url,
            "tamano_bytes": n.tamano_bytes,
            "modificado_por": _nombre_corto(n.modificado_por),
            "fecha_modificacion": n.fecha_modificacion,
            "total_archivos": total_archivos,
        }

    def crear_carpeta(self, id_instructor: int, nombre: str, id_padre: Optional[int], usuario: Usuario) -> dict:
        self._instructor_o_404(id_instructor)
        if id_padre is not None:
            self._carpeta_o_404(id_instructor, id_padre)
        self._validar_nombre_libre(id_instructor, id_padre, nombre)
        n = Nodo(
            id_instructor=id_instructor,
            id_padre=id_padre,
            tipo="carpeta",
            nombre=nombre,
            id_modificado_por=usuario.id_usuario,
        )
        self.db.add(n)
        self._tocar(id_padre, usuario.id_usuario)
        self.db.commit()
        self.db.refresh(n)
        return self._a_dict(n)

    async def subir_archivo(
        self, id_instructor: int, id_padre: Optional[int], archivo: UploadFile, usuario: Usuario
    ) -> dict:
        self._instructor_o_404(id_instructor)
        if id_padre is not None:
            self._carpeta_o_404(id_instructor, id_padre)

        nombre = nombre_para_mostrar(archivo, "archivo")
        self._validar_nombre_libre(id_instructor, id_padre, nombre)

        url = await guardar_adjunto(archivo)
        try:
            tamano = None
            try:
                archivo.file.seek(0, 2)
                tamano = archivo.file.tell()
            except Exception:
                pass
            n = Nodo(
                id_instructor=id_instructor,
                id_padre=id_padre,
                tipo="archivo",
                nombre=nombre,
                archivo_url=url,
                tamano_bytes=tamano,
                id_modificado_por=usuario.id_usuario,
            )
            self.db.add(n)
            self._tocar(id_padre, usuario.id_usuario)
            self.db.commit()
        except Exception:
            self.db.rollback()
            borrar_adjunto(url)  # no dejar un archivo huérfano en disco
            raise
        self.db.refresh(n)
        return self._a_dict(n)

    def eliminar(self, nodo: Nodo) -> None:
        urls: list[str] = []

        def juntar(n: Nodo):
            if n.tipo == "archivo" and n.archivo_url:
                urls.append(n.archivo_url)
            for h in n.hijos:
                juntar(h)

        juntar(nodo)
        self.db.delete(nodo)
        self.db.commit()
        for u in urls:
            borrar_adjunto(u)