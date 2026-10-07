import { API_BASE_URL } from '@/lib/api-config';
import { getToken } from '@/lib/auth';
import { mensajeDeRespuesta } from '@/lib/api-error';
import { DocumentoElegido, subirDocumento } from '@/lib/documentos';

/** Refleja schemas/programa.py::ProgramaResponse */
export type Programa = {
  id_programa: number;
  nombre: string;
  nivel_formacion: string | null;
  descripcion: string | null;
  url_programa: string | null;
  id_coordinacion: number | null;
  id_sede: number | null;
  id_ficha: number | null;
  id_proyecto: number | null;
  id_competencia: number | null;
  archivo_url: string | null;
  archivo_nombre: string | null;
};

export type ProgramaInput = {
  nombre: string;
  nivel_formacion?: string;
  descripcion?: string;
  url_programa?: string;
  id_coordinacion?: number;
  id_sede?: number;
};

async function authHeaders(json = true): Promise<Record<string, string>> {
  const token = await getToken();
  if (!token) throw new Error('Debes iniciar sesión de nuevo.');
  return json
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { Authorization: `Bearer ${token}` };
}

export async function obtenerProgramas(): Promise<Programa[]> {
  const r = await fetch(`${API_BASE_URL}/api/programas/`, { headers: await authHeaders(false) });
  if (!r.ok) throw new Error('No se pudieron cargar los programas.');
  return r.json();
}

/** Programas de una sede (el filtro lo hace el backend: GET /api/programas/?id_sede=N). */
export async function obtenerProgramasPorSede(idSede: number): Promise<Programa[]> {
  const r = await fetch(`${API_BASE_URL}/api/programas/?id_sede=${idSede}`, { headers: await authHeaders(false) });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error(mensajeDeRespuesta(r.status, d.detail, 'No se pudieron cargar los programas.'));
  }
  return r.json();
}

export async function obtenerPrograma(id: number): Promise<Programa> {
  const r = await fetch(`${API_BASE_URL}/api/programas/${id}`, { headers: await authHeaders(false) });
  if (!r.ok) throw new Error('No se pudo cargar el programa.');
  return r.json();
}

export async function crearPrograma(data: ProgramaInput): Promise<Programa> {
  const r = await fetch(`${API_BASE_URL}/api/programas/`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(mensajeDeRespuesta(r.status, d.detail, 'No se pudo crear el programa.'));
  return d;
}

export async function actualizarPrograma(id: number, data: ProgramaInput): Promise<Programa> {
  const r = await fetch(`${API_BASE_URL}/api/programas/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(mensajeDeRespuesta(r.status, d.detail, 'No se pudo actualizar el programa.'));
  return d;
}

export async function eliminarPrograma(id: number): Promise<void> {
  const r = await fetch(`${API_BASE_URL}/api/programas/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(false),
  });
  if (!r.ok) throw new Error('No se pudo eliminar el programa.');
}

/** Adjunta (o reemplaza) el documento PDF/Word de un programa. */
export function subirArchivoPrograma(id: number, archivo: DocumentoElegido): Promise<Programa> {
  return subirDocumento<Programa>(`/api/programas/${id}/archivo`, archivo, 'No se pudo subir el archivo del programa.');
}

export async function quitarArchivoPrograma(id: number): Promise<Programa> {
  const r = await fetch(`${API_BASE_URL}/api/programas/${id}/archivo`, {
    method: 'DELETE',
    headers: await authHeaders(false),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(mensajeDeRespuesta(r.status, d.detail, 'No se pudo quitar el archivo.'));
  return d;
}

