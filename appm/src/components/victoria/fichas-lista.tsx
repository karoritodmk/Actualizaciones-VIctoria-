import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { FichaFormModal } from '@/components/victoria/ficha-form-modal';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { useVictoriaToast } from '@/components/victoria/toast';
import { ExitButton, FilterChip, PaneHeader, PillButton, SearchPill } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import type { Jornada } from '@/lib/coordinador';
import { styles } from './fichas-lista.styles';

/** Una ficha lista para mostrar, sin importar de qué endpoint venga. */
export type FichaItem = {
  id_ficha: number;
  id_programa: number | null;
  programaNombre: string;
  sedeNombre?: string | null;
  /** '1' a '4' (sin la T). */
  trimestre: string | null;
  estado: string;
  horario: string | null;
  jornada: Jornada | null;
  /** 'AAAA-MM-DD' (si viene con hora, se ignora la hora). */
  fecha_inicio: string;
  fecha_fin: string;
  num_aprendices?: number;
};

type Filtro = Jornada | 'sin';

const JORNADAS: { label: string; valor: Jornada }[] = [
  { label: 'Diurna', valor: 'diurna' },
  { label: 'Nocturna', valor: 'nocturna' },
  { label: 'Mixta', valor: 'mixta' },
];

/** Misma regla del backend: busca la palabra de la jornada dentro del horario. */
export function jornadaDeHorario(horario?: string | null): Jornada | null {
  const texto = (horario ?? '').toLowerCase();
  for (const j of ['diurna', 'nocturna', 'mixta'] as const) {
    if (texto.includes(j)) return j;
  }
  return null;
}

function formatearFecha(valor: string) {
  const [anio, mes, dia] = valor.slice(0, 10).split('-');
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : valor;
}

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** null = todavía cargando. */
  items: FichaItem[] | null;
  error: string | null;
  /** Programas entre los que se puede elegir al añadir una ficha. */
  programas: { id_programa: number; nombre: string }[];
  onRecargar: () => void;
  vacioMensaje?: string;
};

/**
 * Lista de fichas clasificadas por jornada (Diurna / Nocturna / Mixta), con
 * buscador, botones por tarjeta y los botones laterales "Añadir Ficha" /
 * "Añadir Competencia". La usan la sección general "Fichas SENA" y las
 * fichas de cada sede.
 *
 * Sin ninguna jornada seleccionada se muestran TODAS las fichas; tocar la
 * jornada activa la quita. El buscador filtra por número de ficha, programa,
 * sede u horario.
 */
export function FichasLista({
  eyebrow,
  title,
  subtitle,
  items,
  error,
  programas,
  onRecargar,
  vacioMensaje = 'Todavía no hay fichas registradas.',
}: Props) {
  const { mostrarExito, mostrarInfo } = useVictoriaToast();
  const [filtro, setFiltro] = useState<Filtro | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [expandida, setExpandida] = useState<number | null>(null);
  const [modalFicha, setModalFicha] = useState(false);

  const lista = items ?? [];
  const cuenta = (f: Filtro) => lista.filter((i) => (i.jornada ?? 'sin') === f).length;
  const termino = busqueda.trim().toLowerCase();
  const filtradas = lista
    .filter((i) => filtro === null || (i.jornada ?? 'sin') === filtro)
    .filter(
      (i) =>
        !termino ||
        [String(i.id_ficha), i.programaNombre, i.sedeNombre ?? '', i.horario ?? ''].some((t) =>
          t.toLowerCase().includes(termino)
        )
    );

  const proximamente = () => mostrarInfo('Esta vista todavía está en desarrollo.');

  return (
    <VictoriaScreenShell>
      <PaneHeader eyebrow={eyebrow} title={title} />
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={styles.filtersRow}>
        {JORNADAS.map((j) => (
          <FilterChip
            key={j.valor}
            label={items ? `${j.label} · ${cuenta(j.valor)}` : j.label}
            active={filtro === j.valor}
            onPress={() => setFiltro((actual) => (actual === j.valor ? null : j.valor))}
          />
        ))}
        {cuenta('sin') > 0 ? (
          <FilterChip
            label={`Sin jornada · ${cuenta('sin')}`}
            active={filtro === 'sin'}
            onPress={() => setFiltro((actual) => (actual === 'sin' ? null : 'sin'))}
          />
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.layout}>
        <View style={styles.main}>
          {!items && !error ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}
          {items && filtradas.length === 0 ? (
            <Text style={styles.empty}>
              {lista.length === 0 ? vacioMensaje : 'No hay fichas para ese filtro o búsqueda.'}
            </Text>
          ) : null}

          <View style={styles.list}>
            {filtradas.map((ficha) => {
              const abierta = expandida === ficha.id_ficha;
              return (
                <View key={ficha.id_ficha} style={styles.card}>
                  <Pressable
                    style={styles.cardHeader}
                    onPress={() => setExpandida(abierta ? null : ficha.id_ficha)}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="layers-outline" size={18} color={VictoriaColors.white} />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.cardTitle}>Ficha {ficha.id_ficha}</Text>
                      <Text style={styles.cardSubtitle}>
                        {ficha.programaNombre}
                        {ficha.trimestre ? `  -  Trimestre ${ficha.trimestre}` : ''}
                      </Text>
                    </View>
                    <Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={18} color="#555555" />
                  </Pressable>

                  {abierta ? (
                    <View style={styles.detailBlock}>
                      {ficha.sedeNombre ? <Text style={styles.detailLine}>Sede: {ficha.sedeNombre}</Text> : null}
                      <Text style={styles.detailLine}>Estado: {ficha.estado}</Text>
                      <Text style={styles.detailLine}>Horario: {ficha.horario ?? 'Sin horario registrado'}</Text>
                      <Text style={styles.detailLine}>
                        Periodo: {formatearFecha(ficha.fecha_inicio)} - {formatearFecha(ficha.fecha_fin)}
                      </Text>
                      {ficha.num_aprendices !== undefined ? (
                        <Text style={styles.detailLine}>Aprendices: {ficha.num_aprendices}</Text>
                      ) : null}
                    </View>
                  ) : null}

                  <View style={styles.cardActions}>
                    <PillButton
                      label="Aprendices"
                      icon="create-outline"
                      variant="dark"
                      onPress={() =>
                        router.push(`/victoria/coordinador/fichas/${ficha.id_ficha}/aprendices` as never)
                      }
                    />
                    <PillButton
                      label="Instructor jefe"
                      icon="create-outline"
                      variant="light"
                      onPress={() =>
                        router.push(`/victoria/coordinador/fichas/${ficha.id_ficha}/instructor-jefe` as never)
                      }
                    />
                    <PillButton
                      label="Competencias"
                      icon="create-outline"
                      variant="light"
                      onPress={() =>
                        router.push(`/victoria/coordinador/fichas/${ficha.id_ficha}/competencias` as never)
                      }
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.side}>
          <SearchPill value={busqueda} onChangeText={setBusqueda} placeholder="Encontrar ficha" />
          <Pressable style={styles.sideButton} onPress={() => setModalFicha(true)} accessibilityRole="button">
            <Ionicons name="cloud-upload-outline" size={15} color={VictoriaColors.white} />
            <Text style={styles.sideButtonText}>Añadir Ficha</Text>
          </Pressable>
          <Pressable style={styles.sideButton} onPress={proximamente} accessibilityRole="button">
            <Ionicons name="cloud-upload-outline" size={15} color={VictoriaColors.white} />
            <Text style={styles.sideButtonText}>Añadir Competencia</Text>
          </Pressable>
        </View>
      </View>

      <ExitButton />

      <FichaFormModal
        visible={modalFicha}
        onClose={() => setModalFicha(false)}
        programas={programas}
        onCreada={(numero) => {
          onRecargar();
          mostrarExito(`Ficha ${numero} creada con éxito`);
        }}
      />
    </VictoriaScreenShell>
  );
}