import { API_BASE_URL } from '@/lib/api-config';
import { getToken } from '@/lib/auth';
import { mensajeDeRespuesta } from '@/lib/api-error';
import { DocumentoElegido, subirDocumento } from '@/lib/documentos';

/**
 * CRUD de Sede (la sede física del SENA donde trabajan los instructores
 * -- ver backend/models/sede.py). NO confundir con Coordinacion
 * (lib/coordinaciones.ts, la "coordinación académica").
 *
 * Este archivo cubre crear/editar/borrar (POST/PUT/DELETE /api/sedes/),
 * exclusivo del coordinador. La navegación de solo lectura
 * "Sedes -> Instructores -> Portafolio" (GET /api/coordinador/sedes/...)
 * vive aparte, en lib/coordinador.ts -- no se duplica aquí.
 */
export type Sede = {
  id_sede: number;
  nombre: string;
  descripcion: string | null;
  direccion_principal: string | null;
  telefono_atencion: string | null;
  horario_atencion: string | null;
  archivo_url: string | null;
  archivo_nombre: string | null;
};

export type SedeInput = {
  nombre: string;
  descripcion?: string;
  direccion_principal?: string;
  telefono_atencion?: string;
  horario_atencion?: string;
};

async function authHeaders(json = true): Promise<Record<string, string>> {
  const token = await getToken();
  if (!token) throw new Error('Debes iniciar sesión de nuevo.');
  return json
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { Authorization: `Bearer ${token}` };
}

export async function obtenerSedesGestion(): Promise<Sede[]> {
  const r = await fetch(`${API_BASE_URL}/api/sedes/`, { headers: await authHeaders(false) });
  if (!r.ok) throw new Error('No se pudieron cargar las sedes.');
  return r.json();
}

export async function obtenerSedeGestion(id: number): Promise<Sede> {
  const r = await fetch(`${API_BASE_URL}/api/sedes/${id}`, { headers: await authHeaders(false) });
  if (!r.ok) throw new Error('No se pudo cargar la sede.');
  return r.json();
}

export async function crearSede(data: SedeInput): Promise<Sede> {
  const r = await fetch(`${API_BASE_URL}/api/sedes/`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(mensajeDeRespuesta(r.status, d.detail, 'No se pudo crear la sede.'));
  return d;
}

export async function actualizarSede(id: number, data: SedeInput): Promise<Sede> {
  const r = await fetch(`${API_BASE_URL}/api/sedes/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(mensajeDeRespuesta(r.status, d.detail, 'No se pudo actualizar la sede.'));
  return d;
}

export async function eliminarSede(id: number): Promise<void> {
  const r = await fetch(`${API_BASE_URL}/api/sedes/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(false),
  });
  if (!r.ok) throw new Error('No se pudo eliminar la sede.');
}

/** Adjunta (o reemplaza) el documento PDF/Word de una sede. */
export function subirArchivoSede(id: number, archivo: DocumentoElegido): Promise<Sede> {
  return subirDocumento<Sede>(`/api/sedes/${id}/archivo`, archivo, 'No se pudo subir el archivo de la sede.');
}

export async function quitarArchivoSede(id: number): Promise<Sede> {
  const r = await fetch(`${API_BASE_URL}/api/sedes/${id}/archivo`, {
    method: 'DELETE',
    headers: await authHeaders(false),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(mensajeDeRespuesta(r.status, d.detail, 'No se pudo quitar el archivo.'));
  return d;
}

