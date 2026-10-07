import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { VictoriaColors } from '@/constants/victoria-theme';
import { abrirDocumento, tipoDeDocumento } from '@/lib/documentos';
import { styles } from './archivo-card.styles';

/**
 * Recuadro de acceso rápido a un documento (PDF o Word) de una sede o un
 * programa: muestra su nombre y tipo, y se abre con un toque (en web, en una
 * pestaña nueva). Si recibe `onQuitar`, muestra un botón "Quitar" que pide una
 * segunda pulsación para confirmar (Alert no funciona en web, así que la
 * confirmación se hace en el propio botón).
 */
export function ArchivoCard({
  nombre,
  url,
  onQuitar,
  quitando = false,
}: {
  nombre: string | null | undefined;
  url: string | null | undefined;
  onQuitar?: () => void;
  quitando?: boolean;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    []
  );

  if (!url) return null;
  const titulo = nombre || 'Documento adjunto';
  const tipo = tipoDeDocumento(nombre || url);

  function pulsarQuitar() {
    if (!onQuitar || quitando) return;
    if (!confirmando) {
      setConfirmando(true);
      temporizador.current = setTimeout(() => setConfirmando(false), 3500);
      return;
    }
    if (temporizador.current) clearTimeout(temporizador.current);
    setConfirmando(false);
    onQuitar();
  }

  return (
    <Pressable
      onPress={() => abrirDocumento(url)}
      accessibilityRole="link"
      accessibilityLabel={`Abrir documento ${titulo}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.icono}>
        <Ionicons name="document-text-outline" size={20} color={VictoriaColors.white} />
      </View>
      <View style={styles.textos}>
        <Text style={styles.nombre} numberOfLines={1}>
          {titulo}
        </Text>
        <Text style={styles.detalle}>{tipo} · Toca para abrir</Text>
      </View>
      <View style={styles.acciones}>
        <View style={styles.abrir}>
          <Ionicons name="open-outline" size={13} color={VictoriaColors.white} />
          <Text style={styles.abrirTexto}>Abrir</Text>
        </View>
        {onQuitar ? (
          <Pressable
            onPress={pulsarQuitar}
            disabled={quitando}
            accessibilityRole="button"
            style={[styles.quitar, confirmando && styles.quitarConfirmar]}>
            <Ionicons name="trash-outline" size={13} color="#b3261e" />
            <Text style={styles.quitarTexto}>{quitando ? 'Quitando…' : confirmando ? '¿Seguro?' : 'Quitar'}</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}
