import * as DocumentPicker from 'expo-document-picker';

import { mensajeDeRespuesta } from '@/lib/api-error';
import { API_BASE_URL } from '@/lib/api-config';
import { getToken } from '@/lib/auth';
import { formatearTamano, subirDocumento } from '@/lib/documentos';

/**
 * Cliente del portafolio "tipo Drive" de un instructor
 * (backend: routes/portafolio_instructor.py). Una carpeta puede contener
 * carpetas y archivos a cualquier profundidad.
 */

export type NodoPortafolio = {
  id_nodo: number;
  tipo: 'carpeta' | 'archivo';
  nombre: string;
  archivo_url: string | null;
  tamano_bytes: number | null;
  modificado_por: string | null;
  fecha_modificacion: string;
  total_archivos: number;
};

export type MigaPortafolio = { id_nodo: number; nombre: string };

export type ExploradorPortafolio = {
  id_instructor: number;
  nombre_instructor: string;
  carpeta_actual: MigaPortafolio | null;
  ruta: MigaPortafolio[];
  items: NodoPortafolio[];
};

// Mismas extensiones y tope que core/uploads.py::guardar_adjunto.
const EXTENSIONES = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip'];
const TAMANO_MAXIMO = 15 * 1024 * 1024;

const BASE = '/api/portafolio-instructor';

async function pedir<T>(ruta: string, init: RequestInit = {}, fallback: string): Promise<T> {
  const token = await getToken();
  if (!token) throw new Error('Debes iniciar sesión de nuevo.');
  let r: Response;
  try {
    r = await fetch(`${API_BASE_URL}${ruta}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  }
  if (r.status === 204) return undefined as T;
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(mensajeDeRespuesta(r.status, datos.detail, fallback));
  return datos as T;
}

export function obtenerExplorador(idInstructor: number, idPadre?: number | null) {
  const q = idPadre ? `?id_padre=${idPadre}` : '';
  return pedir<ExploradorPortafolio>(`${BASE}/${idInstructor}${q}`, {}, 'No se pudo cargar el portafolio.');
}

export function crearCarpetaPortafolio(idInstructor: number, nombre: string, idPadre?: number | null) {
  return pedir<NodoPortafolio>(
    `${BASE}/${idInstructor}/carpetas`,
    { method: 'POST', body: JSON.stringify({ nombre, id_padre: idPadre ?? null }) },
    'No se pudo crear la carpeta.'
  );
}

export function eliminarNodoPortafolio(idNodo: number) {
  return pedir<void>(`${BASE}/nodos/${idNodo}`, { method: 'DELETE' }, 'No se pudo eliminar.');
}

/** Abre el selector de archivos; devuelve null si se cancela y lanza Error si no sirve. */
export async function elegirArchivoPortafolio(): Promise<DocumentPicker.DocumentPickerAsset | null> {
  const r = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
  if (r.canceled || !r.assets?.length) return null;
  const asset = r.assets[0];
  const nombre = (asset.name ?? '').toLowerCase();
  const ext = nombre.includes('.') ? nombre.slice(nombre.lastIndexOf('.')) : '';
  if (!EXTENSIONES.includes(ext)) {
    throw new Error(`"${asset.name}" no es un tipo permitido (${EXTENSIONES.join(', ')}).`);
  }
  if (asset.size === 0) throw new Error(`"${asset.name}" está vacío.`);
  if (asset.size != null && asset.size > TAMANO_MAXIMO) {
    throw new Error(`"${asset.name}" pesa ${formatearTamano(asset.size)} y el máximo es 15 MB.`);
  }
  return asset;
}

export function subirArchivoPortafolio(
  idInstructor: number,
  asset: DocumentPicker.DocumentPickerAsset,
  idPadre?: number | null
) {
  const q = idPadre ? `?id_padre=${idPadre}` : '';
  return subirDocumento<NodoPortafolio>(
    `${BASE}/${idInstructor}/archivos${q}`,
    asset,
    'No se pudo subir el archivo.'
  );
}