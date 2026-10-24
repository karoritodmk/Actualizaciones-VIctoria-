import * as DocumentPicker from 'expo-document-picker';
import { Linking, Platform } from 'react-native';

import { mensajeDeRespuesta } from '@/lib/api-error';
import { API_BASE_URL } from '@/lib/api-config';
import { getToken } from '@/lib/auth';



export const EXTENSIONES_DOCUMENTO = ['.pdf', '.doc', '.docx'];
export const MENSAJE_SOLO_DOCUMENTOS = 'Solo se permiten archivos PDF o Word (.pdf, .doc, .docx).';
export const TAMANO_MAXIMO_BYTES = 15 * 1024 * 1024;

const TIPOS_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export type DocumentoElegido = DocumentPicker.DocumentPickerAsset;

function extensionDe(nombre: string): string {
  const n = nombre.toLowerCase();
  const i = n.lastIndexOf('.');
  return i >= 0 ? n.slice(i) : '';
}

export function tipoDeDocumento(nombre: string | null | undefined): string {
  const ext = extensionDe(nombre ?? '');
  if (ext === '.pdf') return 'PDF';
  if (['.xls', '.xlsx'].includes(ext)) return 'Excel';
  if (['.ppt', '.pptx'].includes(ext)) return 'PowerPoint';
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return 'Imagen';
  if (ext === '.zip') return 'ZIP';
  return 'Word';
}

export function formatearTamano(bytes?: number | null): string {
  if (bytes == null) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Devuelve el texto del aviso si el archivo no sirve, o null si está bien. */
export function validarDocumento(asset: DocumentoElegido): string | null {
  if (!EXTENSIONES_DOCUMENTO.includes(extensionDe(asset.name ?? ''))) {
    return `"${asset.name}" no es un archivo válido. ${MENSAJE_SOLO_DOCUMENTOS}`;
  }
  if (asset.size === 0) return `"${asset.name}" está vacío.`;
  if (asset.size != null && asset.size > TAMANO_MAXIMO_BYTES) {
    return `"${asset.name}" pesa ${formatearTamano(asset.size)} y el máximo es 15 MB.`;
  }
  return null;
}

/**
 * Abre el selector de archivos. Devuelve null si la persona cancela y LANZA
 * un Error con el aviso si el archivo elegido no es PDF/Word. (El filtro del
 * selector es solo una pista: en muchos sistemas se puede elegir "Todos los
 * archivos", por eso se valida aquí.)
 */
export async function elegirDocumento(): Promise<DocumentoElegido | null> {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: TIPOS_MIME,
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (resultado.canceled || !resultado.assets?.length) return null;
  const asset = resultado.assets[0];
  const problema = validarDocumento(asset);
  if (problema) throw new Error(problema);
  return asset;
}

export function urlAbsoluta(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${API_BASE_URL}${url}`;
}

export function abrirDocumento(url: string | null | undefined): void {
  if (!url) return;
  Linking.openURL(urlAbsoluta(url)).catch(() => {});
}

/** Sube un documento (multipart) a `ruta` y devuelve la respuesta ya convertida. */
export async function subirDocumento<T>(
  ruta: string,
  asset: DocumentoElegido,
  fallback = 'No se pudo subir el archivo.'
): Promise<T> {
  const token = await getToken();
  if (!token) throw new Error('Debes iniciar sesión de nuevo.');

  const formData = new FormData();
  if (Platform.OS === 'web') {
    // En web FormData necesita un File/Blob real; un objeto { uri, name }
    // (lo que usa el celular) se enviaría como el texto "[object Object]".
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
    respuesta = await fetch(`${API_BASE_URL}${ruta}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(mensajeDeRespuesta(respuesta.status, datos.detail, fallback));
  return datos as T;
}

/**
 * Archivo informativo de una sede: además de PDF/Word admite Excel, PowerPoint,
 * imágenes y ZIP (la misma lista que acepta el backend en core/uploads.py).
 */
export const EXTENSIONES_ARCHIVO_SEDE = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg', '.webp', '.zip',
];
export const MENSAJE_ARCHIVO_SEDE =
  'Formatos permitidos: PDF, Word, Excel, PowerPoint, imágenes (PNG/JPG/WEBP) o ZIP. Máximo 15 MB.';

export function validarArchivoSede(asset: DocumentoElegido): string | null {
  if (!EXTENSIONES_ARCHIVO_SEDE.includes(extensionDe(asset.name ?? ''))) {
    return `"${asset.name}" no es un formato permitido. ${MENSAJE_ARCHIVO_SEDE}`;
  }
  if (asset.size === 0) return `"${asset.name}" está vacío.`;
  if (asset.size != null && asset.size > TAMANO_MAXIMO_BYTES) {
    return `"${asset.name}" pesa ${formatearTamano(asset.size)} y el máximo es 15 MB.`;
  }
  return null;
}

/** Selector sin filtro de tipo (así se puede elegir cualquier archivo); valida después. */
export async function elegirArchivoSede(): Promise<DocumentoElegido | null> {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (resultado.canceled || !resultado.assets?.length) return null;
  const asset = resultado.assets[0];
  const problema = validarArchivoSede(asset);
  if (problema) throw new Error(problema);
  return asset;
}
