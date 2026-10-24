from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from models.comentario_instructor import ComentarioInstructor
from schemas.coordinador import ContratoInstructorUpdate, ProgramaSedeCreate, ProgramaSedeUpdate
from models.asignacion_instructor import AsignacionInstructor
from models.competencia import Competencia
from models.coordinacion import Coordinacion
from models.archivo_portafolio import ArchivoPortafolio
from models.entrega import Entrega
from models.ficha import Ficha
from models.programa import Programa
from models.rol import Rol
from models.sede import Sede
from models.tarea import Tarea
from models.usuario import Usuario
from schemas.coordinador import ProgramaSedeCreate, ProgramaSedeUpdate


NOMBRE_ROL_INSTRUCTOR = "instructor"
NOMBRE_ROL_APRENDIZ = "aprendiz"

# Orden de búsqueda de la jornada dentro del texto libre de Ficha.horario.
JORNADAS = ("diurna", "nocturna", "mixta")


def jornada_de_horario(horario: Optional[str]) -> Optional[str]:
    """'Diurna, Lun-Vie 7am-1pm' -> 'diurna'. None si no menciona ninguna."""
    texto = (horario or "").lower()
    for jornada in JORNADAS:
        if jornada in texto:
            return jornada
    return None


class CoordinadorService:
    def __init__(self, db: Session):
        self.db = db


    def _contar_usuarios_por_rol(self, nombre_rol: str, *filtros) -> int:
        """Cuenta usuarios de un rol, con filtros extra opcionales."""
        return (
            self.db.query(Usuario)
            .join(Rol, Usuario.id_rol == Rol.id_rol)
            .filter(Rol.nombre_rol.ilike(nombre_rol), *filtros)
            .count()
        )

    def obtener_dashboard(self) -> dict:
        """
        Resumen GENERAL para el coordinador (no de una sola ficha): totales
        del sistema y pendientes que requieren su atención. Cada pendiente
        se calcula con las tablas existentes, sin columnas nuevas:
          - ficha activa sin ninguna fila en asignacion_instructor
          - instructor sin ninguna fila en asignacion_instructor
          - aprendiz con id_ficha NULL
        """
        # Fichas
        total_fichas = self.db.query(Ficha).count()
        es_activa = func.lower(Ficha.estado) == "activa"
        fichas_activas = self.db.query(Ficha).filter(es_activa).count()
        fichas_sin_instructor = (
            self.db.query(Ficha)
            .filter(es_activa, ~Ficha.id_ficha.in_(select(AsignacionInstructor.id_ficha)))
            .count()
        )

        # Instructores
        total_instructores = self._contar_usuarios_por_rol(NOMBRE_ROL_INSTRUCTOR)
        instructores_sin_asignacion = self._contar_usuarios_por_rol(
            NOMBRE_ROL_INSTRUCTOR,
            ~Usuario.id_usuario.in_(select(AsignacionInstructor.id_instructor)),
        )

        # Aprendices
        total_aprendices = self._contar_usuarios_por_rol(NOMBRE_ROL_APRENDIZ)
        aprendices_sin_ficha = self._contar_usuarios_por_rol(
            NOMBRE_ROL_APRENDIZ, Usuario.id_ficha.is_(None)
        )

        # Lista "Fichas recientes": las 5 de fecha de inicio más nueva.
        fichas = self.db.query(Ficha).order_by(Ficha.fecha_inicio.desc()).limit(5).all()

        return {
            "total_fichas": total_fichas,
            "fichas_activas": fichas_activas,
            "fichas_sin_instructor": fichas_sin_instructor,
            "total_instructores": total_instructores,
            "instructores_sin_asignacion": instructores_sin_asignacion,
            "total_aprendices": total_aprendices,
            "aprendices_sin_ficha": aprendices_sin_ficha,
            "fichas_recientes": [self._armar_ficha_resumen(f) for f in fichas],
        }

    def _nombre_director_de_ficha(self, ficha: Ficha) -> Optional[str]:
        if ficha.director:
            return " ".join(filter(None, [ficha.director.nombre, ficha.director.apellido]))

        # Sin director explícito: se aproxima con la asignación más antigua
        # sobre esa ficha (mismo criterio que usaba el módulo original).
        primera_asignacion = (
            self.db.query(AsignacionInstructor)
            .filter(AsignacionInstructor.id_ficha == ficha.id_ficha)
            .order_by(AsignacionInstructor.fecha_creacion.asc())
            .first()
        )
        if not primera_asignacion:
            return None
        instructor = (
            self.db.query(Usuario).filter(Usuario.id_usuario == primera_asignacion.id_instructor).first()
        )
        return " ".join(filter(None, [instructor.nombre, instructor.apellido])) if instructor else None

    def _armar_ficha_resumen(self, ficha: Ficha) -> dict:
        num_estudiantes = (
            self.db.query(Usuario)
            .join(Rol, Usuario.id_rol == Rol.id_rol)
            .filter(Usuario.id_ficha == ficha.id_ficha, Rol.nombre_rol.ilike(NOMBRE_ROL_APRENDIZ))
            .count()
        )

        return {
            "id_ficha": ficha.id_ficha,
            # El número de ficha REAL del SENA es el propio id_ficha (ver
            # models/ficha.py): se expone como texto porque así lo espera
            # el frontend, que lo trata como una etiqueta, no un número.
            "numero_ficha": str(ficha.id_ficha),
            "nombre_programa": ficha.programa.nombre if ficha.programa else None,
            "trimestre": int(ficha.trimestre.strip("T")) if (ficha.trimestre or "").strip("T").isdigit() else None,
            "nombre_director_ficha": self._nombre_director_de_ficha(ficha),
            "num_estudiantes": num_estudiantes,
        }

    # ------------------------------------------------------------
    # 2. Sedes (solo lectura aquí; el CRUD completo vive en
    #    services/sede_service.py, usado por routes/sede.py)
    # ------------------------------------------------------------
    def obtener_sedes(self) -> List[Sede]:
        return self.db.query(Sede).order_by(Sede.nombre.asc()).all()

    def obtener_sede_por_id(self, id_sede: int) -> Sede:
        sede = self.db.query(Sede).filter(Sede.id_sede == id_sede).first()
        if not sede:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sede no encontrada.")
        return sede

    # ------------------------------------------------------------
    # 3. Instructores
    # ------------------------------------------------------------
    def obtener_instructores_sede(self, id_sede: int, tipo: Optional[str] = None) -> List[dict]:
        self.obtener_sede_por_id(id_sede)  # 404 si la sede no existe

        query = (
            self.db.query(Usuario)
            .join(Rol, Usuario.id_rol == Rol.id_rol)
            .filter(Usuario.id_sede == id_sede, Rol.nombre_rol.ilike(NOMBRE_ROL_INSTRUCTOR))
        )
        if tipo:
            query = query.filter(Usuario.tipo_instructor == tipo)

        return [self._armar_instructor_resumen(i) for i in query.order_by(Usuario.nombre.asc()).all()]

    def _armar_instructor_resumen(self, instructor: Usuario) -> dict:
        return {
            "id_usuario": instructor.id_usuario,
            "nombre_completo": " ".join(filter(None, [instructor.nombre, instructor.apellido])),
            # Instructores creados antes de que existiera esta columna no
            # tienen tipo_instructor -- se muestran como "planta" por
            # defecto en vez de romper el schema con None.
            "tipo_instructor": instructor.tipo_instructor or "planta",
            "numero_documento": instructor.numero_documento,
        }

    def obtener_instructor_detalle(self, id_instructor: int) -> dict:
        instructor = self._obtener_instructor_o_404(id_instructor)
        ficha = instructor.ficha  # "ficha principal" del instructor (Usuario.id_ficha)

        return {
            **self._armar_instructor_resumen(instructor),
            "especialidad": instructor.especialidad,
            "tipo_contrato": instructor.tipo_contrato,
            "estado_contrato": instructor.estado_contrato,
            "vigencia_contrato": instructor.vigencia_contrato,
            "numero_ficha": str(ficha.id_ficha) if ficha else None,
            "horario_ficha": ficha.horario if ficha else None,
            "correo_sena": instructor.correo_sena,
            "telefono": instructor.telefono,
            "hoja_vida_url": instructor.hoja_vida_url,
        }



    # 1) En backend/services/coordinador_service.py, junto a los otros imports, agrega:
#     from models.comentario_instructor import ComentarioInstructor
#    y cambia el import de schemas.coordinador por:
#     from schemas.coordinador import ContratoInstructorUpdate, ProgramaSedeCreate, ProgramaSedeUpdate
# 2) En obtener_instructor_detalle, dentro del diccionario que devuelve, debajo de
#     "tipo_contrato": instructor.tipo_contrato,   agrega:
#     "estado_contrato": instructor.estado_contrato,
# 3) PEGA estos métodos DENTRO de la clase CoordinadorService (por ejemplo, justo antes
#    del método obtener_portafolio_instructor), respetando la sangría de 4 espacios:

    # ------------------------------------------------------------
    # 3b. Contrato y comentarios del instructor
    # ------------------------------------------------------------
    def actualizar_contrato_instructor(self, id_instructor: int, datos: ContratoInstructorUpdate) -> dict:
        instructor = self._obtener_instructor_o_404(id_instructor)
        # Solo se tocan los campos que llegaron en la petición: así un valor
        # antiguo escrito a mano en el otro campo no estorba ni se borra.
        if "tipo_contrato" in datos.model_fields_set:
            instructor.tipo_contrato = datos.tipo_contrato
        if "estado_contrato" in datos.model_fields_set:
            instructor.estado_contrato = datos.estado_contrato
        self.db.commit()
        self.db.refresh(instructor)
        return self.obtener_instructor_detalle(id_instructor)

    @staticmethod
    def _armar_comentario(comentario: ComentarioInstructor, autor: Optional[Usuario]) -> dict:
        nombre = f"{autor.nombre} {autor.apellido or ''}".strip() if autor else "Usuario eliminado"
        return {
            "id_comentario": comentario.id_comentario,
            "texto": comentario.texto,
            "fecha_creacion": comentario.fecha_creacion,
            "id_autor": comentario.id_autor,
            "nombre_autor": nombre,
        }

    def listar_comentarios_instructor(self, id_instructor: int) -> list[dict]:
        self._obtener_instructor_o_404(id_instructor)
        filas = (
            self.db.query(ComentarioInstructor, Usuario)
            .outerjoin(Usuario, Usuario.id_usuario == ComentarioInstructor.id_autor)
            .filter(ComentarioInstructor.id_instructor == id_instructor)
            .order_by(ComentarioInstructor.fecha_creacion.desc(), ComentarioInstructor.id_comentario.desc())
            .all()
        )
        return [self._armar_comentario(c, u) for c, u in filas]

    def crear_comentario_instructor(self, id_instructor: int, texto: str, autor: Usuario) -> dict:
        self._obtener_instructor_o_404(id_instructor)
        comentario = ComentarioInstructor(id_instructor=id_instructor, id_autor=autor.id_usuario, texto=texto)
        self.db.add(comentario)
        self.db.commit()
        self.db.refresh(comentario)
        return self._armar_comentario(comentario, autor)
    

    # ------------------------------------------------------------
    # 4. Portafolio de un instructor (solo lectura)
    # ------------------------------------------------------------
    def obtener_portafolio_instructor(self, id_instructor: int) -> dict:
        instructor = self._obtener_instructor_o_404(id_instructor)

        if instructor.tipo_instructor == "transversal":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Los instructores transversales no tienen portafolio de competencias.",
            )

        asignaciones = (
            self.db.query(AsignacionInstructor)
            .filter(AsignacionInstructor.id_instructor == id_instructor)
            .all()
        )

        por_trimestre: dict = {}
        for asignacion in asignaciones:
            por_trimestre.setdefault(asignacion.trimestre, []).append(asignacion)

        trimestres_out = []
        for trimestre in sorted(por_trimestre.keys()):
            competencias_out = []
            evidencias_trimestre = 0
            vistas = set()  # evita repetir la materia si se dicta en 2 fichas del mismo trimestre
            for asignacion in por_trimestre[trimestre]:
                if asignacion.id_competencia in vistas:
                    continue
                vistas.add(asignacion.id_competencia)

                competencia = (
                    self.db.query(Competencia)
                    .filter(Competencia.id_competencia == asignacion.id_competencia)
                    .first()
                )
                num_archivos = (
                    self.db.query(Tarea)
                    .filter(
                        Tarea.id_instructor == id_instructor,
                        Tarea.id_competencia == asignacion.id_competencia,
                        Tarea.archivo_url.isnot(None),
                    )
                    .count()
                )
                evidencias_trimestre += num_archivos
                competencias_out.append(
                    {
                        "id_competencia": asignacion.id_competencia,
                        "nombre": competencia.nombre if competencia else "Materia",
                        "archivos": num_archivos,
                    }
                )

            trimestres_out.append(
                {"trimestre": trimestre, "evidencias": evidencias_trimestre, "competencias": competencias_out}
            )

        return {
            "id_usuario": instructor.id_usuario,
            "nombre_completo": " ".join(filter(None, [instructor.nombre, instructor.apellido])),
            "tipo_instructor": instructor.tipo_instructor or "planta",
            "trimestres": trimestres_out,
        }

    # ------------------------------------------------------------------
    # Portafolio de UN aprendiz visto por el coordinador (solo lectura).
    # A diferencia de InstructorService.obtener_portafolio_aprendiz (que
    # solo muestra las materias/actividades del instructor que consulta),
    # aquí se ven TODAS las materias de la ficha y las actividades de
    # cualquier instructor, con la entrega de ESE aprendiz en cada una.
    # ------------------------------------------------------------------
    def obtener_portafolio_aprendiz(self, id_ficha: int, id_aprendiz: int) -> dict:
        from services.instructor_service import _tipo_archivo

        ficha = self.db.query(Ficha).filter(Ficha.id_ficha == id_ficha).first()
        if not ficha:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ficha no encontrada.")

        aprendiz = (
            self.db.query(Usuario)
            .join(Rol, Usuario.id_rol == Rol.id_rol)
            .filter(
                Usuario.id_usuario == id_aprendiz,
                Usuario.id_ficha == id_ficha,
                Rol.nombre_rol.ilike(NOMBRE_ROL_APRENDIZ),
            )
            .first()
        )
        if not aprendiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El aprendiz no existe o no pertenece a esta ficha.",
            )

        tareas = (
            self.db.query(Tarea)
            .filter(Tarea.id_ficha == id_ficha)
            .order_by(Tarea.fecha_creacion.desc())
            .all()
        )
        # Materias de la ficha = las asignadas a algún instructor + las que ya tienen tareas.
        ids_competencia = {
            a.id_competencia
            for a in self.db.query(AsignacionInstructor)
            .filter(AsignacionInstructor.id_ficha == id_ficha)
            .all()
        } | {t.id_competencia for t in tareas}

        entregas = {
            e.id_tarea: e
            for e in self.db.query(Entrega)
            .filter(Entrega.id_aprendiz == id_aprendiz, Entrega.id_tarea.in_([t.id_tarea for t in tareas] or [0]))
            .all()
        }

        competencias_out: List[dict] = []
        for id_competencia in sorted(ids_competencia):
            competencia = (
                self.db.query(Competencia).filter(Competencia.id_competencia == id_competencia).first()
            )
            actividades = []
            for tarea in (t for t in tareas if t.id_competencia == id_competencia):
                entrega = entregas.get(tarea.id_tarea)
                actividades.append(
                    {
                        "id_tarea": tarea.id_tarea,
                        "titulo": tarea.titulo,
                        "descripcion": tarea.descripcion,
                        "fecha_limite": tarea.fecha_limite,
                        "id_entrega": entrega.id_entrega if entrega else None,
                        "estado": entrega.estado if entrega else None,
                        "archivo_url": entrega.archivo_url if entrega else None,
                        "tipo_archivo": _tipo_archivo(entrega.archivo_url) if entrega else None,
                        "fecha_entrega": entrega.fecha_entrega if entrega else None,
                        "nota": float(entrega.nota) if entrega and entrega.nota is not None else None,
                        "comentario": entrega.comentario if entrega else None,
                    }
                )
            competencias_out.append(
                {
                    "id_competencia": id_competencia,
                    "nombre_competencia": competencia.nombre if competencia else "Materia",
                    "actividades": actividades,
                }
            )

        return {
            "id_usuario": aprendiz.id_usuario,
            "nombre_completo": " ".join(filter(None, [aprendiz.nombre, aprendiz.apellido])),
            "numero_documento": aprendiz.numero_documento,
            "id_ficha": id_ficha,
            "numero_ficha": str(ficha.id_ficha),
            "competencias": competencias_out,
        }

    def obtener_competencia_detalle(self, id_instructor: int, trimestre: int, id_competencia: int) -> dict:
        self._obtener_instructor_o_404(id_instructor)

        asignacion = (
            self.db.query(AsignacionInstructor)
            .filter(
                AsignacionInstructor.id_instructor == id_instructor,
                AsignacionInstructor.trimestre == trimestre,
                AsignacionInstructor.id_competencia == id_competencia,
            )
            .first()
        )
        if not asignacion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ese instructor no dicta esta materia en ese trimestre.",
            )

        competencia = self.db.query(Competencia).filter(Competencia.id_competencia == id_competencia).first()
        if not competencia:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Materia no encontrada.")

        tareas = (
            self.db.query(Tarea)
            .filter(
                Tarea.id_instructor == id_instructor,
                Tarea.id_competencia == id_competencia,
                Tarea.archivo_url.isnot(None),
            )
            .order_by(Tarea.fecha_creacion.desc())
            .all()
        )

        return {
            "id_competencia": id_competencia,
            "nombre": competencia.nombre,
            "descripcion": competencia.descripcion,
            "trimestre": trimestre,
            "fecha_creacion": competencia.fecha_carga,
            "fecha_edicion": None,  # el modelo Competencia no guarda fecha de edición
            "archivos": [
                {"id_evidencia": t.id_tarea, "nombre_archivo": t.titulo, "url": t.archivo_url}
                for t in tareas
            ],
        }

    # ------------------------------------------------------------
    # Aprendices: perfil (solo lectura para el coordinador)
    # ------------------------------------------------------------
    def obtener_aprendiz_o_404(self, id_aprendiz: int) -> Usuario:
        aprendiz = (
            self.db.query(Usuario)
            .join(Rol, Usuario.id_rol == Rol.id_rol)
            .filter(Usuario.id_usuario == id_aprendiz, Rol.nombre_rol.ilike(NOMBRE_ROL_APRENDIZ))
            .first()
        )
        if not aprendiz:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aprendiz no encontrado.")
        return aprendiz

    def obtener_aprendiz_detalle(self, id_aprendiz: int) -> dict:
        """Perfil de un aprendiz aplanado usuario -> ficha -> programa."""
        aprendiz = self.obtener_aprendiz_o_404(id_aprendiz)
        ficha = aprendiz.ficha
        programa = ficha.programa if ficha else None
        total_archivos = (
            self.db.query(func.count(ArchivoPortafolio.id_archivo))
            .filter(ArchivoPortafolio.id_aprendiz == aprendiz.id_usuario)
            .scalar()
        ) or 0
        return {
            "id_usuario": aprendiz.id_usuario,
            "nombre": aprendiz.nombre,
            "apellido": aprendiz.apellido,
            "nombre_completo": " ".join(filter(None, [aprendiz.nombre, aprendiz.apellido])),
            "estado": aprendiz.estado,
            "tipo_documento": aprendiz.tipo_documento,
            "numero_documento": aprendiz.numero_documento,
            "fecha_nacimiento": aprendiz.fecha_nacimiento,
            "telefono": aprendiz.telefono,
            "correo_personal": aprendiz.correo_personal,
            "correo_sena": aprendiz.correo_sena,
            "fecha_registro": aprendiz.fecha_creacion,
            "informacion_adicional": aprendiz.informacion_adicional,
            "hoja_vida_url": aprendiz.hoja_vida_url,
            "id_ficha": ficha.id_ficha if ficha else None,
            "estado_ficha": ficha.estado if ficha else None,
            "trimestre": ficha.trimestre if ficha else None,
            "horario_ficha": ficha.horario if ficha else None,
            "jornada": jornada_de_horario(ficha.horario) if ficha else None,
            "fecha_inicio_ficha": ficha.fecha_inicio if ficha else None,
            "fecha_fin_ficha": ficha.fecha_fin if ficha else None,
            "director_ficha": self._nombre_director_de_ficha(ficha) if ficha else None,
            "programa_nombre": programa.nombre if programa else None,
            "nivel_formacion": programa.nivel_formacion if programa else None,
            "total_archivos_portafolio": total_archivos,
        }

    def _obtener_instructor_o_404(self, id_instructor: int) -> Usuario:
        instructor = (
            self.db.query(Usuario)
            .join(Rol, Usuario.id_rol == Rol.id_rol)
            .filter(Usuario.id_usuario == id_instructor, Rol.nombre_rol.ilike(NOMBRE_ROL_INSTRUCTOR))
            .first()
        )
        if not instructor:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instructor no encontrado.")
        return instructor

    # ------------------------------------------------------------
    # 5. Programas de una sede
    # ------------------------------------------------------------
    def obtener_programas_sede(self, id_sede: int) -> List[Programa]:
        self.obtener_sede_por_id(id_sede)  # 404 si la sede no existe
        return (
            self.db.query(Programa)
            .filter(Programa.id_sede == id_sede)
            .order_by(Programa.nombre.asc())
            .all()
        )

    def _resolver_coordinacion(self, coordinador: Usuario) -> int:
        """
        Programa.id_coordinacion es NOT NULL, pero el modal "Añadir Programa"
        no la pide. Orden de decisión:
          1. La coordinación de la cuenta del coordinador autenticado.
          2. Si no tiene, la primera coordinación registrada (la de menor id).
          3. Si no hay ninguna, se crea una "Coordinación general" para que
             el usuario no tenga que ir antes a Gestión a crearla. Se puede
             renombrar o reemplazar luego en Gestión > Coordinaciones.
        """
        if coordinador.id_coordinacion:
            return coordinador.id_coordinacion

        primera = (
            self.db.query(Coordinacion.id_coordinacion)
            .order_by(Coordinacion.id_coordinacion.asc())
            .first()
        )
        if primera:
            return primera[0]

        general = Coordinacion(
            nombre_coordinacion="Coordinación general",
            descripcion_coordinacion="Creada automáticamente al añadir el primer programa.",
            area_enfoque="General",
        )
        self.db.add(general)
        self.db.flush()  # obtiene el id; el commit lo hace crear_programa_sede
        return general.id_coordinacion

    def crear_programa_sede(self, id_sede: int, datos: ProgramaSedeCreate, coordinador: Usuario) -> Programa:
        self.obtener_sede_por_id(id_sede)  # 404 si la sede no existe

        repetido = (
            self.db.query(Programa)
            .filter(Programa.id_sede == id_sede, func.lower(Programa.nombre) == datos.nombre.lower())
            .first()
        )
        if repetido:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Esta sede ya tiene un programa con ese nombre.",
            )

        nuevo = Programa(
            nombre=datos.nombre,
            descripcion=datos.descripcion,
            nivel_formacion=datos.nivel_formacion,
            # url_programa es NOT NULL en la tabla; si no se envía, queda vacía.
            url_programa=datos.url_programa or "",
            id_coordinacion=self._resolver_coordinacion(coordinador),
            id_sede=id_sede,
        )
        self.db.add(nuevo)
        self.db.commit()
        self.db.refresh(nuevo)
        return nuevo

    def actualizar_programa_sede(self, id_sede: int, id_programa: int, datos: ProgramaSedeUpdate) -> Programa:
        self.obtener_sede_por_id(id_sede)  # 404 si la sede no existe

        # El programa debe pertenecer a ESA sede: así no se edita por error
        # (ni a propósito) un programa de otra sede cambiando solo la URL.
        programa = (
            self.db.query(Programa)
            .filter(Programa.id_programa == id_programa, Programa.id_sede == id_sede)
            .first()
        )
        if not programa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Programa no encontrado en esta sede.",
            )

        repetido = (
            self.db.query(Programa)
            .filter(
                Programa.id_sede == id_sede,
                func.lower(Programa.nombre) == datos.nombre.lower(),
                Programa.id_programa != id_programa,
            )
            .first()
        )
        if repetido:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Esta sede ya tiene un programa con ese nombre.",
            )

        programa.nombre = datos.nombre
        # model_fields_set: solo se toca lo que el cliente realmente envió.
        enviados = datos.model_fields_set
        if "descripcion" in enviados:
            programa.descripcion = datos.descripcion or None
        if "nivel_formacion" in enviados:
            programa.nivel_formacion = datos.nivel_formacion or None
        if "url_programa" in enviados:
            # NOT NULL en la tabla: vacío, nunca None.
            programa.url_programa = datos.url_programa or ""

        self.db.commit()
        self.db.refresh(programa)
        return programa

    # ------------------------------------------------------------
    # 6. Fichas de un programa
    # ------------------------------------------------------------
    def obtener_fichas_programa(self, id_sede: int, id_programa: int) -> dict:
        self.obtener_sede_por_id(id_sede)  # 404 si la sede no existe

        programa = (
            self.db.query(Programa)
            .filter(Programa.id_programa == id_programa, Programa.id_sede == id_sede)
            .first()
        )
        if not programa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Programa no encontrado en esta sede.",
            )

        fichas = (
            self.db.query(Ficha)
            .filter(Ficha.id_programa == id_programa)
            .order_by(Ficha.fecha_inicio.desc(), Ficha.id_ficha.desc())
            .all()
        )

        # Aprendices por ficha en UNA consulta (no una por ficha).
        conteos: dict = {}
        if fichas:
            filas = (
                self.db.query(Usuario.id_ficha, func.count(Usuario.id_usuario))
                .join(Rol, Usuario.id_rol == Rol.id_rol)
                .filter(
                    Rol.nombre_rol.ilike(NOMBRE_ROL_APRENDIZ),
                    Usuario.id_ficha.in_([f.id_ficha for f in fichas]),
                )
                .group_by(Usuario.id_ficha)
                .all()
            )
            conteos = {id_ficha: total for id_ficha, total in filas}

        return {
            "id_programa": programa.id_programa,
            "nombre": programa.nombre,
            "nivel_formacion": programa.nivel_formacion,
            "fichas": [
                {
                    "id_ficha": f.id_ficha,
                    "estado": f.estado,
                    # 'T1'..'T4' -> 1..4 (mismo criterio que el dashboard)
                    "trimestre": int(f.trimestre.strip("T"))
                    if (f.trimestre or "").strip("T").isdigit()
                    else None,
                    "horario": f.horario,
                    "jornada": jornada_de_horario(f.horario),
                    "fecha_inicio": f.fecha_inicio.date(),
                    "fecha_fin": f.fecha_fin.date(),
                    "num_aprendices": conteos.get(f.id_ficha, 0),
                }
                for f in fichas
            ],
        }