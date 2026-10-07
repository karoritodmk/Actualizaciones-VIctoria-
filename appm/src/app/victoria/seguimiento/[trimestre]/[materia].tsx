import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton, PaneHeader } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import { DetalleMateria, NotaTarea, obtenerNotasMateria } from '@/lib/seguimiento';
import { styles } from './[materia].styles';

const ESTADO_INFO: Record<
  string,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  aprobado: { label: 'Aprobado', color: '#146c43', bg: '#d1f2dc', icon: 'checkmark-circle-outline' },
  en_revision: { label: 'En revisión', color: '#8a6d1d', bg: '#f3e6bf', icon: 'time-outline' },
  rechazado: { label: 'Desaprobado', color: '#8a2b2b', bg: '#f3cfcf', icon: 'close-circle-outline' },
  pendiente: { label: 'Pendiente', color: '#555555', bg: '#e4e4e4', icon: 'ellipse-outline' },
};

// Colores de la barra en la pestaña Promedios — un poco más suaves que
// los badges, para que se vean bien uno junto al otro en la lista.
const COLOR_BARRA: Record<string, string> = {
  aprobado: '#8FAE6A',
  en_revision: '#C2B280',
  rechazado: '#C17A86',
  pendiente: '#D8D8D8',
};

function infoEstado(estado: string) {
  return ESTADO_INFO[estado] ?? ESTADO_INFO.pendiente;
}

function BarraCalificacion({ tarea }: { tarea: NotaTarea }) {
  const [hover, setHover] = useState(false);
  const color = COLOR_BARRA[tarea.estado] ?? COLOR_BARRA.pendiente;
  const porcentaje = tarea.nota !== null ? Math.min(100, Math.max(4, (tarea.nota / 10) * 100)) : 3;

  return (
    <View style={styles.barraFila}>
      <Text style={styles.barraTitulo} numberOfLines={1}>
        {tarea.titulo}
      </Text>
      <View style={styles.barraPista}>
        <Pressable
          style={[styles.barraRellena, { width: `${porcentaje}%`, backgroundColor: color }]}
          onHoverIn={() => setHover(true)}
          onHoverOut={() => setHover(false)}
        />
        {hover ? (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitulo} numberOfLines={1}>
              {tarea.titulo}
            </Text>
            <Text style={styles.tooltipTexto}>
              Calificación: {tarea.nota !== null ? tarea.nota.toFixed(1) : 'Sin calificar'}/10.0
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function SeguimientoDetalleScreen() {
  const { trimestre, materia } = useLocalSearchParams<{ trimestre: string; materia: string }>();
  const claveTrimestre = (trimestre ?? '').toUpperCase();
  const idCompetencia = Number(materia);

  const [detalle, setDetalle] = useState<DetalleMateria | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'tareas' | 'promedios'>('tareas');

  useEffect(() => {
    if (!idCompetencia) return;
    obtenerNotasMateria(claveTrimestre, idCompetencia)
      .then(setDetalle)
      .catch((err) => setError(err.message));
  }, [claveTrimestre, idCompetencia]);

  const infoPromedio =
    detalle?.estado_promedio === 'Aprobado'
      ? ESTADO_INFO.aprobado
      : detalle?.estado_promedio === 'Sin calificar'
        ? ESTADO_INFO.pendiente
        : ESTADO_INFO.en_revision;

  const aprobadas = detalle?.tareas.filter((t) => t.estado === 'aprobado').length ?? 0;
  const enRevision = detalle?.tareas.filter((t) => t.estado === 'en_revision').length ?? 0;
  const desaprobadas = detalle?.tareas.filter((t) => t.estado === 'rechazado').length ?? 0;
  const calificadas = detalle?.tareas.filter((t) => t.nota !== null).length ?? 0;

  return (
    <VictoriaScreenShell>
      <PaneHeader
        eyebrow="Volver a seguimiento"
        title={detalle ? `${detalle.nombre} - Trimestre ${detalle.numero}` : 'Materia'}
        backHref={`/victoria/seguimiento/${claveTrimestre}`}
      />

      <View style={styles.tabsRow}>
        <Pressable
          style={[styles.tabButton, tab === 'tareas' && styles.tabButtonActive]}
          onPress={() => setTab('tareas')}>
          <Ionicons name="list-outline" size={14} color={tab === 'tareas' ? VictoriaColors.white : '#555555'} />
          <Text style={[styles.tabText, tab === 'tareas' && styles.tabTextActive]}>Tareas y Notas</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, tab === 'promedios' && styles.tabButtonActive]}
          onPress={() => setTab('promedios')}>
          <Ionicons
            name="bar-chart-outline"
            size={14}
            color={tab === 'promedios' ? VictoriaColors.white : '#555555'}
          />
          <Text style={[styles.tabText, tab === 'promedios' && styles.tabTextActive]}>Promedios</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!detalle && !error ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}

      {detalle ? (
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.summaryIcon}>
              <Ionicons name="ribbon-outline" size={18} color={VictoriaColors.textOnLight} />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Promedio General</Text>
              <Text style={styles.summaryValue}>
                {detalle.promedio !== null ? detalle.promedio.toFixed(1) : '—'}
                <Text style={styles.summaryValueSuffix}>/10.0</Text>
              </Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: infoPromedio.bg }]}>
            <Text style={[styles.badgeText, { color: infoPromedio.color }]}>{detalle.estado_promedio}</Text>
          </View>
        </View>
      ) : null}

      {detalle && tab === 'tareas' ? (
        detalle.tareas.length === 0 ? (
          <Text style={styles.empty}>Aún no hay tareas registradas para esta materia.</Text>
        ) : (
          <View style={styles.list}>
            {detalle.tareas.map((tarea) => {
              const info = infoEstado(tarea.estado);
              return (
                <View key={tarea.id_tarea} style={styles.row}>
                  <View style={styles.mainCol}>
                    <View style={styles.rowTop}>
                      <Text style={styles.taskTitle}>{tarea.titulo}</Text>
                      <View style={[styles.badge, { backgroundColor: info.bg }]}>
                        <Ionicons name={info.icon} size={13} color={info.color} />
                        <Text style={[styles.badgeText, { color: info.color }]}>{info.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.taskDesc}>
                      {tarea.tiene_archivo ? 'Archivo adjunto' : 'Sin archivo adjunto'}
                    </Text>
                    {tarea.nota !== null ? (
                      <View style={styles.gradeRow}>
                        <View style={[styles.gradeChip, { backgroundColor: info.bg }]}>
                          <Text style={[styles.gradeChipText, { color: info.color }]}>
                            {tarea.nota.toFixed(1)}
                          </Text>
                        </View>
                        {tarea.comentario ? <Text style={styles.comentario}>"{tarea.comentario}"</Text> : null}
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )
      ) : null}

      {detalle && tab === 'promedios' ? (
        <View style={styles.promediosWrap}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statCardNum, { color: '#146c43' }]}>{aprobadas}</Text>
              <Text style={styles.statCardLabel}>Aprobadas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statCardNum, { color: '#8a6d1d' }]}>{enRevision}</Text>
              <Text style={styles.statCardLabel}>En Revisión</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statCardNum, { color: '#8a2b2b' }]}>{desaprobadas}</Text>
              <Text style={styles.statCardLabel}>Desaprobada</Text>
            </View>
          </View>

          <View style={styles.barrasCard}>
            <Text style={styles.barrasTitulo}>Calificaciones por tarea</Text>
            <Text style={styles.barrasSubtitulo}>
              {calificadas} {calificadas === 1 ? 'Tarea calificada' : 'Tareas calificadas'}
            </Text>

            <View style={styles.barrasLista}>
              {detalle.tareas.map((tarea) => (
                <BarraCalificacion key={tarea.id_tarea} tarea={tarea} />
              ))}
            </View>

            <View style={styles.ejeFila}>
              <View style={styles.ejeEspaciador} />
              <View style={styles.ejeLinea}>
                {[0, 2, 4, 6, 8, 10].map((n) => (
                  <Text key={n} style={styles.ejeNumero}>
                    {n}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      ) : null}

      <ExitButton />
    </VictoriaScreenShell>
  );
}
