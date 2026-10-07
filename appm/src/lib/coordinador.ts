import { API_BASE_URL } from '@/lib/api-config';
import { getToken } from '@/lib/auth';
import { mensajeDeError } from '@/lib/api-error';

export type FichaResumen = {
  id_ficha: number;
  numero_ficha: string | null;
  nombre_programa: string | null;
  trimestre: number | null;
  nombre_director_ficha: string | null;
  num_estudiantes: number;
};

export type DashboardCoordinador = {
  total_fichas: number;
  fichas_activas: number;
  fichas_sin_instructor: number;
  total_instructores: number;
  instructores_sin_asignacion: number;
  total_aprendices: number;
  aprendices_sin_ficha: number;
  fichas_recientes: FichaResumen[];
};

export type SedeResumen = {
  id_sede: number;
  nombre: string;
  descripcion: string | null;
  // Documento PDF/Word de la sede (si tiene): permite abrirlo sin expandir la tarjeta.
  archivo_url?: string | null;
  archivo_nombre?: string | null;
};

export type SedeDetalle = SedeResumen & {
  direccion_principal: string | null;
  telefono_atencion: string | null;
  horario_atencion: string | null;
  archivo_url: string | null;
  archivo_nombre: string | null;
};

export type TipoInstructor = 'planta' | 'tecnico' | 'transversal';

export type InstructorResumen = {
  id_usuario: number;
  nombre_completo: string;
  tipo_instructor: TipoInstructor;
  numero_documento: string;
};

export type InstructorDetalle = InstructorResumen & {
  especialidad: string | null;
  tipo_contrato: string | null;
  vigencia_contrato: string | null;
  numero_ficha: string | null;
  horario_ficha: string | null;
  correo_sena: string;
  telefono: string | null;
  hoja_vida_url: string | null;
};

export type CompetenciaPortafolio = {
  id_competencia: number;
  nombre: string;
  archivos: number;
};

export type TrimestrePortafolio = {
  trimestre: number;
  evidencias: number;
  competencias: CompetenciaPortafolio[];
};

export type PortafolioInstructor = {
  id_usuario: number;
  nombre_completo: string;
  tipo_instructor: TipoInstructor;
  trimestres: TrimestrePortafolio[];
};

export type EvidenciaArchivo = {
  id_evidencia: number;
  nombre_archivo: string;
  url: string;
};

export type CompetenciaDetalle = {
  id_competencia: number;
  nombre: string;
  descripcion: string | null;
  trimestre: number;
  fecha_creacion: string;
  fecha_edicion: string | null;
  archivos: EvidenciaArchivo[];
};

export type ProgramaSede = {
  id_programa: number;
  nombre: string;
  descripcion: string | null;
  nivel_formacion: string | null;
};

/** Cuerpo de POST/PUT /sedes/{id}/programas (la coordinación la resuelve el servidor). */
export type ProgramaSedeInput = {
  nombre: string;
  descripcion?: string;
  nivel_formacion?: string;
  url_programa?: string;
};

export type Jornada = 'diurna' | 'nocturna' | 'mixta';

export type FichaPrograma = {
  id_ficha: number;
  estado: string;
  trimestre: number | null;
  horario: string | null;
  jornada: Jornada | null;
  fecha_inicio: string;
  fecha_fin: string;
  num_aprendices: number;
};

export type ProgramaFichas = {
  id_programa: number;
  nombre: string;
  nivel_formacion: string | null;
  fichas: FichaPrograma[];
};

export class CoordinadorApiError extends Error {}

// --------------------------------------------------------------------
// Helper interno: fetch autenticado + manejo uniforme de errores
// --------------------------------------------------------------------
async function fetchCoordinador<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  if (!token) {
    throw new CoordinadorApiError('No hay sesión activa.');
  }

  const respuesta = await fetch(`${API_BASE_URL}/api/coordinador${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    if (respuesta.status === 403) {
      throw new CoordinadorApiError(
        mensajeDeError(datos.detail, 'No tienes permisos de coordinador para esta acción.')
      );
    }
    throw new CoordinadorApiError(mensajeDeError(datos.detail, `Error ${respuesta.status} al consultar la API.`));
  }

  return respuesta.json();
}

// --------------------------------------------------------------------
// 1. Dashboard
// --------------------------------------------------------------------
export function obtenerDashboardCoordinador(): Promise<DashboardCoordinador> {
  return fetchCoordinador('/dashboard');
}

// --------------------------------------------------------------------
// 2. Sedes SENA
// --------------------------------------------------------------------
export function obtenerSedes(): Promise<SedeResumen[]> {
  return fetchCoordinador('/sedes');
}

export function obtenerSedeDetalle(idSede: number): Promise<SedeDetalle> {
  return fetchCoordinador(`/sedes/${idSede}`);
}

// --------------------------------------------------------------------
// 3. Instructores por sede
// --------------------------------------------------------------------
export function obtenerInstructoresSede(
  idSede: number,
  tipo?: TipoInstructor
): Promise<InstructorResumen[]> {
  const query = tipo ? `?tipo=${tipo}` : '';
  return fetchCoordinador(`/sedes/${idSede}/instructores${query}`);
}

export function obtenerInstructorDetalle(idInstructor: number): Promise<InstructorDetalle> {
  return fetchCoordinador(`/instructores/${idInstructor}`);
}

// --------------------------------------------------------------------
// 3b. Programas de una sede y sus fichas
// --------------------------------------------------------------------
export function obtenerProgramasSede(idSede: number): Promise<ProgramaSede[]> {
  return fetchCoordinador(`/sedes/${idSede}/programas`);
}

export function crearProgramaSede(idSede: number, data: ProgramaSedeInput): Promise<ProgramaSede> {
  return fetchCoordinador(`/sedes/${idSede}/programas`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function actualizarProgramaSede(
  idSede: number,
  idPrograma: number,
  data: ProgramaSedeInput
): Promise<ProgramaSede> {
  return fetchCoordinador(`/sedes/${idSede}/programas/${idPrograma}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function obtenerFichasPrograma(idSede: number, idPrograma: number): Promise<ProgramaFichas> {
  return fetchCoordinador(`/sedes/${idSede}/programas/${idPrograma}/fichas`);
}

// --------------------------------------------------------------------
// 4. Portafolio del instructor (solo lectura para el coordinador)
// --------------------------------------------------------------------
export function obtenerPortafolioInstructor(idInstructor: number): Promise<PortafolioInstructor> {
  return fetchCoordinador(`/instructores/${idInstructor}/portafolio`);
}

export function obtenerCompetenciaDetalle(
  idInstructor: number,
  trimestre: number,
  idCompetencia: number
): Promise<CompetenciaDetalle> {
  return fetchCoordinador(
    `/instructores/${idInstructor}/portafolio/${trimestre}/competencias/${idCompetencia}`
  );
}