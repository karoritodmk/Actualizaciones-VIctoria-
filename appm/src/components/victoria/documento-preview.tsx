import { createElement, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';

import { VictoriaColors, VictoriaRadius } from '@/constants/victoria-theme';
import { abrirDocumento, urlAbsoluta } from '@/lib/documentos';

/**
 * Vista previa de un documento dentro de la pantalla.
 *  - PDF  (.pdf)  -> visor del navegador en un iframe.
 *  - Word (.docx) -> se dibuja con `docx-preview` (conserva tablas y colores).
 *  - .doc antiguo y celular -> no hay vista previa en pantalla: se ofrece abrirlo.
 * (Requiere `npm install docx-preview` para la vista de Word.)
 */
type Props = { url: string; nombre?: string | null; alto: number };

function extensionDe(texto: string): string {
  const limpio = texto.toLowerCase().split('?')[0];
  const i = limpio.lastIndexOf('.');
  return i >= 0 ? limpio.slice(i) : '';
}

function SinVista({ url, motivo, alto }: { url: string; motivo: string; alto: number }) {
  return (
    <View
      style={{
        minHeight: Math.min(alto, 220),
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 20,
      }}>
      <Text style={{ fontSize: 14, color: '#556b5c', textAlign: 'center' }}>{motivo}</Text>
      <Pressable
        onPress={() => abrirDocumento(url)}
        style={{
          backgroundColor: VictoriaColors.darkGreen,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: VictoriaRadius.pill,
        }}>
        <Text style={{ color: VictoriaColors.white, fontSize: 13, fontWeight: '600' }}>Abrir documento</Text>
      </Pressable>
    </View>
  );
}

function VistaWord({ url, alto }: { url: string; alto: number }) {
  const contenedor = useRef<any>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');

  useEffect(() => {
    let cancelado = false;
    setEstado('cargando');
    (async () => {
      try {
        const [{ renderAsync }, respuesta] = await Promise.all([import('docx-preview'), fetch(url)]);
        if (!respuesta.ok) throw new Error('No se pudo descargar el documento.');
        const blob = await respuesta.blob();
        if (cancelado || !contenedor.current) return;
        contenedor.current.innerHTML = '';
        await renderAsync(blob, contenedor.current, undefined, { inWrapper: true, breakPages: true });
        if (!cancelado) setEstado('listo');
      } catch {
        if (!cancelado) setEstado('error');
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [url]);

  return (
    <View style={{ height: alto }}>
      {estado === 'cargando' ? <ActivityIndicator color={VictoriaColors.darkGreen} style={{ marginTop: 20 }} /> : null}
      {estado === 'error' ? (
        <SinVista url={url} alto={alto} motivo="No se pudo mostrar la vista previa de este documento de Word." />
      ) : null}
      {createElement('div', {
        ref: contenedor,
        style: {
          display: estado === 'listo' ? 'block' : 'none',
          width: '100%',
          height: alto,
          overflow: 'auto',
          borderRadius: 12,
          background: '#dfe5dc',
        },
      })}
    </View>
  );
}

export function DocumentoPreview({ url, nombre, alto }: Props) {
  const absoluta = urlAbsoluta(url);
  const ext = extensionDe(nombre ?? url) || extensionDe(url);

  if (Platform.OS !== 'web') {
    return <SinVista url={url} alto={alto} motivo="En el celular el documento se abre en su propia aplicación." />;
  }
  if (ext === '.pdf') {
    return createElement('iframe', {
      src: `${absoluta}#view=FitH`,
      title: nombre ?? 'Documento',
      style: { width: '100%', height: alto, border: 'none', borderRadius: 12, background: '#ffffff' },
    });
  }
  if (ext === '.docx') return <VistaWord url={absoluta} alto={alto} />;
  return (
    <SinVista
      url={url}
      alto={alto}
      motivo="Los archivos .doc antiguos no se pueden previsualizar aquí. Ábrelo para verlo (o guárdalo como .docx)."
    />
  );
}