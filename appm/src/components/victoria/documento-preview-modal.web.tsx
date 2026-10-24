import { Ionicons } from '@expo/vector-icons';
import { createElement, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

import type { DocumentoPreviewProps } from '@/components/victoria/documento-preview-modal';
import { VictoriaColors } from '@/constants/victoria-theme';
import { abrirDocumento, urlAbsoluta } from '@/lib/documentos';
import { styles } from './documento-preview-modal.styles';

type Tipo = 'pdf' | 'docx' | 'doc' | 'imagen' | 'otro';
type Estado = 'cargando' | 'listo' | 'sin-vista' | 'error';

function tipoDe(texto: string | null | undefined): Tipo {
  const t = (texto ?? '').toLowerCase().split('?')[0];
  if (t.endsWith('.pdf')) return 'pdf';
  if (t.endsWith('.docx')) return 'docx';
  if (t.endsWith('.doc')) return 'doc';
  if (/\.(png|jpe?g|webp)$/.test(t)) return 'imagen';
  return 'otro';
}

/** Tipo MIME del blob; sin él el navegador no sabe si es PDF o imagen. */
function mimeDe(texto: string | null | undefined): string {
  const t = (texto ?? '').toLowerCase().split('?')[0];
  if (t.endsWith('.png')) return 'image/png';
  if (t.endsWith('.webp')) return 'image/webp';
  if (/\.jpe?g$/.test(t)) return 'image/jpeg';
  return 'application/pdf';
}

/**
 * Vista previa de un PDF o un Word dentro de un modal (versión web).
 *
 * - PDF o imagen (png/jpg/webp): se descarga y se muestra con una URL blob:
 *   (<iframe> para el PDF, <img> para la imagen). No se usa
 *   la URL del servidor directamente porque la API manda `X-Frame-Options:
 *   DENY` (main.py) y el navegador se negaría a incrustarla; el blob no lleva
 *   esa cabecera y además el archivo queda en memoria sin tocar la seguridad del backend.
 * - .docx: se dibuja con `docx-preview` (se carga solo al abrir uno, para no
 *   aumentar el peso inicial de la app).
 * - .doc (formato antiguo) y PDF en navegadores sin visor de PDF: no se pueden dibujar
 *   aquí; se ofrece abrir el archivo.
 */
export function DocumentoPreviewModal({ visible, titulo, subtitulo, url, nombre, onClose }: DocumentoPreviewProps) {
  const tipo = tipoDe(nombre) !== 'otro' ? tipoDe(nombre) : tipoDe(url);
  const nombreParaMime = tipoDe(nombre) !== 'otro' ? nombre : url;
  const [estado, setEstado] = useState<Estado>('cargando');
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [docxDatos, setDocxDatos] = useState<ArrayBuffer | null>(null);
  const contenedor = useRef<HTMLDivElement | null>(null);

  // 1) Descarga el archivo cada vez que se abre.
  useEffect(() => {
    if (!visible || !url) return;
    let cancelado = false;
    let blobCreado: string | null = null;
    setError(null);
    setBlobUrl(null);
    setDocxDatos(null);

    if (tipo !== 'pdf' && tipo !== 'docx' && tipo !== 'imagen') {
      setEstado('sin-vista');
      return;
    }
    // Algunos navegadores (Chrome en Android, algunos embebidos) no traen visor de PDF
    // y un <iframe> con un PDF se vería en blanco: ahí mejor se ofrece abrir el archivo.
    // `pdfViewerEnabled` es undefined en navegadores antiguos: ahí se intenta mostrarlo.
    if (tipo === 'pdf' && (navigator as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled === false) {
      setEstado('sin-vista');
      return;
    }
    setEstado('cargando');

    (async () => {
      try {
        const respuesta = await fetch(urlAbsoluta(url));
        if (!respuesta.ok) {
          throw new Error(
            respuesta.status === 404
              ? 'El archivo ya no está disponible en el servidor.'
              : 'No se pudo descargar el archivo.'
          );
        }
        const datos = await respuesta.arrayBuffer();
        if (cancelado) return;
        if (tipo === 'pdf' || tipo === 'imagen') {
          blobCreado = URL.createObjectURL(new Blob([datos], { type: mimeDe(nombreParaMime) }));
          setBlobUrl(blobCreado);
        } else {
          setDocxDatos(datos);
        }
        setEstado('listo');
      } catch (err) {
        if (cancelado) return;
        setError(
          err instanceof Error && err.message
            ? err.message
            : 'No se pudo conectar con el servidor. Revisa tu conexión.'
        );
        setEstado('error');
      }
    })();

    return () => {
      cancelado = true;
      if (blobCreado) URL.revokeObjectURL(blobCreado);
    };
  }, [visible, url, tipo, nombreParaMime]);

  // 2) Un .docx se dibuja dentro del contenedor cuando ya existe en pantalla.
  useEffect(() => {
    if (tipo !== 'docx' || estado !== 'listo' || !docxDatos || !contenedor.current) return;
    const destino = contenedor.current;
    let cancelado = false;
    (async () => {
      try {
        const { renderAsync } = await import('docx-preview');
        if (cancelado) return;
        destino.innerHTML = '';
        await renderAsync(docxDatos, destino, undefined, {
          className: 'victoria-docx',
          breakPages: true,
          ignoreLastRenderedPageBreak: false,
        });
      } catch {
        if (cancelado) return;
        setError('No se pudo mostrar este documento Word. Puedes abrirlo para verlo.');
        setEstado('error');
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [tipo, estado, docxDatos]);

  const botonAbrir = (
    <Pressable style={styles.botonAbrir} onPress={() => abrirDocumento(url)} accessibilityRole="button">
      <Ionicons name="open-outline" size={15} color={VictoriaColors.white} />
      <Text style={styles.botonAbrirTexto}>Abrir archivo</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } as object]}
        onPress={onClose}>
        <Pressable
          style={[styles.card, { backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' } as object]}
          onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {titulo}
              </Text>
              {subtitulo ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitulo}
                </Text>
              ) : null}
            </View>
            <View style={styles.headerActions}>
              {url ? (
                <Pressable
                  onPress={() => abrirDocumento(url)}
                  hitSlop={10}
                  accessibilityLabel="Abrir en una pestaña nueva">
                  <Ionicons name="open-outline" size={20} color={VictoriaColors.textOnLight} />
                </Pressable>
              ) : null}
              <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Cerrar">
                <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
              </Pressable>
            </View>
          </View>

          <View style={styles.previewArea}>
            {estado === 'cargando' ? (
              <View style={styles.centrado}>
                <ActivityIndicator color={VictoriaColors.darkGreen} />
                <Text style={styles.mensaje}>Cargando documento…</Text>
              </View>
            ) : null}

            {estado === 'error' ? (
              <View style={styles.centrado}>
                <Text style={[styles.mensaje, styles.mensajeError]}>{error}</Text>
                {url ? botonAbrir : null}
              </View>
            ) : null}

            {estado === 'sin-vista' ? (
              <View style={styles.centrado}>
                <Ionicons name="document-text-outline" size={34} color={VictoriaColors.mutedGreen} />
                <Text style={styles.mensaje}>
                  {tipo === 'doc'
                    ? 'Este archivo es un Word en formato antiguo (.doc) y el navegador no puede mostrarlo aquí. Ábrelo para verlo o descargarlo.'
                    : tipo === 'pdf'
                      ? 'Tu navegador no puede mostrar PDF dentro de la página. Ábrelo para verlo o descargarlo.'
                      : 'Este tipo de archivo no tiene vista previa. Ábrelo para verlo o descargarlo.'}
                </Text>
                {url ? botonAbrir : null}
              </View>
            ) : null}

            {estado === 'listo' && tipo === 'pdf' && blobUrl
              ? createElement('iframe', {
                  // El fragmento oculta la barra y el panel lateral del visor de PDF (así solo se ve
                  // el documento y no el UUID del blob como título). Es opcional: si el navegador lo
                  // ignora, se ve el visor normal. Para el visor completo está "Abrir en una pestaña nueva".
                  src: `${blobUrl}#toolbar=0&navpanes=0&view=FitH`,
                  title: titulo,
                  style: { width: '100%', height: '100%', border: 'none', backgroundColor: '#ffffff' },
                })
              : null}

            {estado === 'listo' && tipo === 'imagen' && blobUrl
              ? createElement('img', {
                  src: blobUrl,
                  alt: titulo,
                  style: { width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#ffffff' },
                })
              : null}

            {estado === 'listo' && tipo === 'docx'
              ? createElement('div', {
                  ref: contenedor,
                  style: { width: '100%', height: '100%', overflow: 'auto', backgroundColor: '#e9ece7' },
                })
              : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
