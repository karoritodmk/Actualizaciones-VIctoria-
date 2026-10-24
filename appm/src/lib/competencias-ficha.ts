import { API_BASE_URL } from '@/lib/api-config';
import { mensajeDeRespuesta } from '@/lib/api-error';
import { getToken } from '@/lib/auth';
import { type DocumentoElegido, subirDocumento } from '@/lib/documentos';

/** Competencias de la ficha: listar por programa, crear, asignar instructor y documento de actividades. */
export const TRIMESTRES_COMPETENCIA = ['T1', 'T2', 'T3', 'T4'] as const;
export type TrimestreCompetencia = (typeof TRIMESTRES_COMPETENCIA)[number];

/** Refleja schemas/competencia.py::CompetenciaResponse */
export type CompetenciaFicha = {
  id_competencia: number;
  nombre: string;
  descripcion: string | null;
  trimestre: string;
  fecha_carga: string;
  id_programa: number | null;
  id_instructor: number | null;
  nombre_instructor: string | null;
  archivo_url: string | null;
  archivo_nombre: string | null;
};

async function pedir<T>(
  ruta: string,
  fallback: string,
  opciones: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = await getToken();
  if (!token) throw new Error('Debes iniciar sesión de nuevo.');
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
      method: opciones.method ?? 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: opciones.body !== undefined ? JSON.stringify(opciones.body) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  }
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(mensajeDeRespuesta(respuesta.status, datos.detail, fallback));
  return datos as T;
}

export async function obtenerCompetenciasDePrograma(idPrograma: number): Promise<CompetenciaFicha[]> {
  const todas = await pedir<CompetenciaFicha[]>(
    `/api/competencias/?id_programa=${idPrograma}`,
    'No se pudieron cargar las competencias.'
  );
  // Si el backend ignora el filtro, igual mostramos solo las de este programa.
  return todas.filter((c) => c.id_programa === idPrograma);
}

export async function crearCompetencia(datos: {
  nombre: string;
  descripcion?: string;
  trimestre: TrimestreCompetencia;
  id_programa: number;
}): Promise<CompetenciaFicha> {
  return pedir<CompetenciaFicha>('/api/competencias/', 'No se pudo crear la competencia.', {
    method: 'POST',
    body: { ...datos, fecha_carga: new Date().toISOString().slice(0, 19) },
  });
}

/** Asigna (o quita, con null) el instructor de una competencia. */
export async function asignarInstructorCompetencia(
  c: CompetenciaFicha,
  idInstructor: number | null
): Promise<CompetenciaFicha> {
  return pedir<CompetenciaFicha>(`/api/competencias/${c.id_competencia}`, 'No se pudo asignar el instructor.', {
    method: 'PUT',
    body: {
      nombre: c.nombre,
      descripcion: c.descripcion,
      trimestre: c.trimestre,
      fecha_carga: c.fecha_carga,
      id_programa: c.id_programa,
      id_instructor: idInstructor,
    },
  });
}

export function subirArchivoCompetencia(idCompetencia: number, archivo: DocumentoElegido) {
  return subirDocumento<CompetenciaFicha>(
    `/api/competencias/${idCompetencia}/archivo`,
    archivo,
    'No se pudo subir el documento.'
  );
}

export function quitarArchivoCompetencia(idCompetencia: number) {
  return pedir<CompetenciaFicha>(`/api/competencias/${idCompetencia}/archivo`, 'No se pudo quitar el documento.', {
    method: 'DELETE',
  });
}