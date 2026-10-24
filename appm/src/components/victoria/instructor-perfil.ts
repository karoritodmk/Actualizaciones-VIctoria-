import { API_BASE_URL } from '@/lib/api-config';
import { mensajeDeRespuesta } from '@/lib/api-error';
import { getToken } from '@/lib/auth';
import type { InstructorDetalle } from '@/lib/coordinador';

/** Perfil del instructor visto por el coordinador: contrato y comentarios. */
export const TIPOS_CONTRATO = ['Planta', 'Contratista', 'Otro'] as const;
export const ESTADOS_CONTRATO = ['Vigente', 'No Vigente', 'En estudio'] as const;

export type InstructorPerfil = InstructorDetalle & { estado_contrato?: string | null };

export type ComentarioInstructor = {
  id_comentario: number;
  texto: string;
  fecha_creacion: string;
  id_autor: number | null;
  nombre_autor: string;
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

export function obtenerPerfilInstructor(idInstructor: number) {
  return pedir<InstructorPerfil>(`/api/coordinador/instructores/${idInstructor}`, 'No se pudo cargar el instructor.');
}

/** Solo se envían los campos que se pasan (null = dejar "Sin asignar"). */
export function actualizarContratoInstructor(
  idInstructor: number,
  cambios: { tipo_contrato?: string | null; estado_contrato?: string | null }
) {
  return pedir<InstructorPerfil>(
    `/api/coordinador/instructores/${idInstructor}/contrato`,
    'No se pudo actualizar el contrato.',
    { method: 'PUT', body: cambios }
  );
}

export function obtenerComentariosInstructor(idInstructor: number) {
  return pedir<ComentarioInstructor[]>(
    `/api/coordinador/instructores/${idInstructor}/comentarios`,
    'No se pudieron cargar los comentarios.'
  );
}

export function enviarComentarioInstructor(idInstructor: number, texto: string) {
  return pedir<ComentarioInstructor>(
    `/api/coordinador/instructores/${idInstructor}/comentarios`,
    'No se pudo enviar el comentario.',
    { method: 'POST', body: { texto } }
  );
}