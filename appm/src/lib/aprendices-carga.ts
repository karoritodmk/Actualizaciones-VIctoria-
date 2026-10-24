import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

import { API_BASE_URL } from '@/lib/api-config';
import { mensajeDeRespuesta } from '@/lib/api-error';
import { getToken } from '@/lib/auth';

/**
 * Listado de aprendices en archivo plano: elegir, validar y subir.
 * El backend vuelve a validar todo; esta validación avisa al instante.
 */
export const EXTENSIONES_LISTADO = ['.csv', '.tsv', '.txt', '.xlsx'];
export const MENSAJE_FORMATOS_LISTADO = 'Formatos: .csv, .tsv, .txt o .xlsx (máximo 5 MB).';
const TAMANO_MAXIMO_LISTADO = 5 * 1024 * 1024;

export type ListadoElegido = DocumentPicker.DocumentPickerAsset;

export type ResultadoListado = {
  creados: string[];
  errores: { fila: number; error: string }[];
  total?: number;
};

function extensionDe(nombre: string): string {
  const n = nombre.toLowerCase();
  const i = n.lastIndexOf('.');
  return i >= 0 ? n.slice(i) : '';
}

export function formatearTamanoListado(bytes?: number | null): string {
  if (bytes == null) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Abre el selector. null = canceló. Lanza Error con el aviso si el archivo no sirve. */
export async function elegirListado(): Promise<ListadoElegido | null> {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: '*/*', // el filtro por tipo es poco fiable con .csv/.txt; se valida abajo
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (resultado.canceled || !resultado.assets?.length) return null;
  const asset = resultado.assets[0];
  if (!EXTENSIONES_LISTADO.includes(extensionDe(asset.name ?? ''))) {
    throw new Error(`"${asset.name}" no es un formato válido. ${MENSAJE_FORMATOS_LISTADO}`);
  }
  if (asset.size === 0) throw new Error(`"${asset.name}" está vacío.`);
  if (asset.size != null && asset.size > TAMANO_MAXIMO_LISTADO) {
    throw new Error(`"${asset.name}" pesa ${formatearTamanoListado(asset.size)} y el máximo es 5 MB.`);
  }
  return asset;
}

/** POST /api/usuarios/carga-masiva (multipart: id_ficha + archivo). */
export async function subirListadoAprendices(
  idFicha: number,
  asset: ListadoElegido
): Promise<ResultadoListado> {
  const token = await getToken();
  if (!token) throw new Error('Debes iniciar sesión de nuevo.');

  const formData = new FormData();
  formData.append('id_ficha', String(idFicha));
  if (Platform.OS === 'web') {
    // En web FormData necesita un File/Blob real, no un objeto { uri, name }.
    const contenido: Blob = (asset as any).file ?? (await (await fetch(asset.uri)).blob());
    (formData as any).append('archivo', contenido, asset.name);
  } else {
    formData.append('archivo', {
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_BASE_URL}/api/usuarios/carga-masiva`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  }
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(mensajeDeRespuesta(respuesta.status, datos.detail, 'No se pudo procesar el archivo.'));
  }
  return datos as ResultadoListado;
}