import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, TextInput, View } from 'react-native';

import { VictoriaColors } from '@/constants/victoria-theme';
import { EstadoEntrega, tipoDeArchivo } from '@/lib/instructor';
import { styles } from './entrega-grade-card.styles';

const ETIQUETAS_ESTADO: Record<EstadoEntrega, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
};

const ICONO_ARCHIVO: Record<'pdf' | 'word' | 'video' | 'otro', keyof typeof Ionicons.glyphMap> = {
  pdf: 'document-text-outline',
  word: 'document-outline',
  video: 'videocam-outline',
  otro: 'attach-outline',
};

const NOTA_MAXIMA = 10;

/**
 * Tarjeta reutilizable de "una entrega": link al archivo subido (Word,
 * PDF o video, detectado por extensión), chip de estado y un formulario
 * para calificar (nota 0-10 + comentario). Se usa tanto en la vista de
 * instructor/tareas/[idTarea].tsx (todos los aprendices de una actividad)
 * como en instructor/portafolios/[idFicha]/[idAprendiz].tsx (todas las
 * actividades de un aprendiz).
 */
export function EntregaGradeCard({
  titulo,
  subtitulo,
  archivoUrl,
  estado,
  nota,
  comentario,
  sinEntrega,
  onGuardar,
}: {
  /** Nombre del aprendiz (vista por tarea) o título de la actividad (vista por aprendiz). */
  titulo: string;
  subtitulo?: string;
  archivoUrl: string | null;
  estado: EstadoEntrega | null;
  nota: number | null;
  comentario: string | null;
  /** true si el aprendiz todavía no tiene ninguna fila de entrega para esta actividad. */
  sinEntrega?: boolean;
  onGuardar: (cambios: { estado?: EstadoEntrega; nota?: number; comentario?: string }) => Promise<void>;
}) {
  const [abierto, setAbierto] = useState(false);
  const [notaTexto, setNotaTexto] = useState(nota != null ? String(nota) : '');
  const [comentarioTexto, setComentarioTexto] = useState(comentario ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tipo = tipoDeArchivo(archivoUrl);

  async function guardar() {
    setError(null);
    const notaNum = notaTexto.trim() === '' ? undefined : Number(notaTexto.replace(',', '.'));
    if (notaNum !== undefined && (Number.isNaN(notaNum) || notaNum < 0 || notaNum > NOTA_MAXIMA)) {
      setError(`La nota debe ser un número entre 0 y ${NOTA_MAXIMA}.`);
      return;
    }
    setGuardando(true);
    try {
      await onGuardar({
        nota: notaNum,
        comentario: comentarioTexto.trim() === '' ? undefined : comentarioTexto.trim(),
      });
      setAbierto(false);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo guardar la calificación.');
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(nuevo: EstadoEntrega) {
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({ estado: nuevo });
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo actualizar el estado.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.titulo}>{titulo}</Text>
          {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
        </View>
        {estado ? (
          <View style={[styles.chip, chipColorPorEstado(estado)]}>
            <Text style={styles.chipText}>{ETIQUETAS_ESTADO[estado]}</Text>
          </View>
        ) : null}
      </View>

      {sinEntrega ? (
        <Text style={styles.sinEntrega}>El aprendiz todavía no ha subido nada.</Text>
      ) : (
        <>
          <View style={styles.infoRow}>
            {archivoUrl ? (
              <Pressable
                style={styles.archivoBtn}
                onPress={() => Linking.openURL(archivoUrl)}>
                <Ionicons name={ICONO_ARCHIVO[tipo ?? 'otro']} size={16} color={VictoriaColors.darkerGreen} />
                <Text style={styles.archivoBtnText}>
                  {tipo === 'pdf' ? 'Ver PDF' : tipo === 'word' ? 'Ver Word' : tipo === 'video' ? 'Ver video' : 'Ver archivo'}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.sinArchivo}>Sin archivo adjunto.</Text>
            )}

            {nota != null ? (
              <View style={styles.notaBadge}>
                <Text style={styles.notaBadgeText}>{nota.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>

          {comentario && !abierto ? <Text style={styles.comentarioPreview}>“{comentario}”</Text> : null}

          {!abierto ? (
            <View style={styles.accionesRow}>
              <Pressable style={styles.calificarBtn} onPress={() => setAbierto(true)}>
                <Ionicons name="create-outline" size={14} color={VictoriaColors.white} />
                <Text style={styles.calificarBtnText}>
                  {nota != null || comentario ? 'Editar calificación' : 'Calificar'}
                </Text>
              </Pressable>
              {(['en_revision', 'aprobado', 'rechazado'] as EstadoEntrega[])
                .filter((e) => e !== estado)
                .map((e) => (
                  <Pressable key={e} style={styles.estadoBtn} onPress={() => cambiarEstado(e)} disabled={guardando}>
                    <Text style={styles.estadoBtnText}>{ETIQUETAS_ESTADO[e]}</Text>
                  </Pressable>
                ))}
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Nota (0-{NOTA_MAXIMA})</Text>
                <TextInput
                  value={notaTexto}
                  onChangeText={setNotaTexto}
                  placeholder="8.5"
                  placeholderTextColor="#8a8a8a"
                  keyboardType="decimal-pad"
                  style={styles.notaInput}
                />
              </View>
              <TextInput
                value={comentarioTexto}
                onChangeText={setComentarioTexto}
                placeholder="Comentario para el aprendiz..."
                placeholderTextColor="#8a8a8a"
                multiline
                numberOfLines={3}
                style={styles.comentarioInput}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={styles.formAcciones}>
                <Pressable style={styles.cancelarBtn} onPress={() => setAbierto(false)} disabled={guardando}>
                  <Text style={styles.cancelarBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.guardarBtn} onPress={guardar} disabled={guardando}>
                  {guardando ? (
                    <ActivityIndicator color={VictoriaColors.white} size="small" />
                  ) : (
                    <Text style={styles.guardarBtnText}>Guardar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function chipColorPorEstado(estado: EstadoEntrega) {
  switch (estado) {
    case 'aprobado':
      return { backgroundColor: '#d1f2dc' };
    case 'en_revision':
      return { backgroundColor: '#fdecc8' };
    case 'rechazado':
      return { backgroundColor: '#f8d7da' };
    default:
      return { backgroundColor: 'rgba(0,0,0,0.08)' };
  }
}
