import { useEffect } from 'react';

import { abrirDocumento } from '@/lib/documentos';

export type DocumentoPreviewProps = {
  visible: boolean;
  titulo: string;
  subtitulo?: string;
  /** URL del archivo (relativa a la API o absoluta). */
  url: string | null;
  /** Nombre original del archivo; se usa para saber si es PDF, Word o imagen. */
  nombre?: string | null;
  onClose: () => void;
};

/**
 * Versión de celular (iOS/Android). No hay forma de dibujar un PDF/Word dentro
 * de la app sin añadir un WebView nativo, así que se entrega el archivo al
 * visor del sistema y se cierra el modal. La vista previa dentro de la pantalla
 * vive en documento-preview-modal.web.tsx.
 */
export function DocumentoPreviewModal({ visible, url, onClose }: DocumentoPreviewProps) {
  useEffect(() => {
    if (!visible || !url) return;
    abrirDocumento(url);
    onClose();
  }, [visible, url, onClose]);

  return null;
}
