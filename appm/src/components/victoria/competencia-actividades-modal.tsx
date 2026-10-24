import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { VictoriaColors } from '@/constants/victoria-theme';
import {
  type CompetenciaFicha,
  quitarArchivoCompetencia,
  subirArchivoCompetencia,
} from '@/lib/competencias-ficha';
import { abrirDocumento, elegirDocumento } from '@/lib/documentos';
import { DocumentoPreview } from './documento-preview';
import { styles } from './competencias-modales.styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  idFicha: number;
  competencia: CompetenciaFicha | null;
  /** Se llama tras subir/quitar el documento, para refrescar la lista de atrás. */
  onCambio: (mensaje?: string) => void;
};

/**
 * "Actividades Competencia": vista previa del documento (PDF o Word) que se
 * adjuntó a la competencia, con opciones para abrirlo, reemplazarlo o quitarlo.
 */
export function CompetenciaActividadesModal({ visible, onClose, idFicha, competencia, onCambio }: Props) {
  const { height } = useWindowDimensions();
  const alto = Math.max(320, Math.min(560, Math.round(height * 0.55)));
  const [archivo, setArchivo] = useState<{ url: string; nombre: string | null } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !competencia) return;
    setArchivo(competencia.archivo_url ? { url: competencia.archivo_url, nombre: competencia.archivo_nombre } : null);
    setOcupado(false);
    setError(null);
  }, [visible, competencia?.id_competencia]);

  async function adjuntar() {
    if (!competencia) return;
    setError(null);
    try {
      const elegido = await elegirDocumento();
      if (!elegido) return;
      setOcupado(true);
      const actualizada = await subirArchivoCompetencia(competencia.id_competencia, elegido);
      setArchivo(actualizada.archivo_url ? { url: actualizada.archivo_url, nombre: actualizada.archivo_nombre } : null);
      onCambio('Documento de actividades actualizado');
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo adjuntar el documento.');
    } finally {
      setOcupado(false);
    }
  }

  async function quitar() {
    if (!competencia) return;
    setError(null);
    setOcupado(true);
    try {
      await quitarArchivoCompetencia(competencia.id_competencia);
      setArchivo(null);
      onCambio('Documento de actividades quitado');
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo quitar el documento.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.card, styles.cardAncha]} onPress={(e) => e.stopPropagation()}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Actividades Competencia</Text>
                <Text style={styles.subtitle}>Competencias · Ficha {idFicha}</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar">
                <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
              </Pressable>
            </View>

            {competencia ? <Text style={styles.nombreDoc}>{competencia.nombre}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {archivo ? (
              <>
                <DocumentoPreview key={archivo.url} url={archivo.url} nombre={archivo.nombre} alto={alto} />
                <Text style={styles.ayuda}>{archivo.nombre ?? 'Documento'}</Text>
              </>
            ) : (
              <View style={styles.vacioDoc}>
                <Ionicons name="document-outline" size={30} color="#6b7d70" />
                <Text style={styles.vacioDocTexto}>
                  Esta competencia todavía no tiene un documento de actividades.
                </Text>
              </View>
            )}

            <View style={styles.acciones}>
              {archivo ? (
                <Pressable style={styles.accion} onPress={() => abrirDocumento(archivo.url)} disabled={ocupado}>
                  <Ionicons name="open-outline" size={15} color={VictoriaColors.white} />
                  <Text style={styles.accionTexto}>Abrir en otra pestaña</Text>
                </Pressable>
              ) : null}
              <Pressable style={[styles.accion, styles.accionClara]} onPress={adjuntar} disabled={ocupado}>
                {ocupado ? (
                  <ActivityIndicator color={VictoriaColors.white} size="small" />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={15} color={VictoriaColors.white} />
                )}
                <Text style={styles.accionTexto}>{archivo ? 'Reemplazar documento' : 'Adjuntar documento'}</Text>
              </Pressable>
              {archivo ? (
                <Pressable style={[styles.accion, styles.accionPeligro]} onPress={quitar} disabled={ocupado}>
                  <Ionicons name="trash-outline" size={15} color="#b3261e" />
                  <Text style={[styles.accionTexto, styles.accionTextoPeligro]}>Quitar</Text>
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}