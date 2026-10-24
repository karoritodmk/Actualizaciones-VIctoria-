import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { FichaFormModal } from '@/components/victoria/ficha-form-modal';
import { useVictoriaToast } from '@/components/victoria/toast';

import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton, FilterChip, PaneHeader, PillButton, SearchPill } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import {
  CoordinadorApiError,
  FichaPrograma,
  Jornada,
  obtenerFichasPrograma,
  obtenerSedeDetalle,
  ProgramaFichas,
} from '@/lib/coordinador';
import { useRoleGuard } from '@/lib/role-guard';
import { styles } from './[idPrograma].styles';

const JORNADAS: { label: string; valor: Jornada }[] = [
  { label: 'Diurna', valor: 'diurna' },
  { label: 'Nocturna', valor: 'nocturna' },
  { label: 'Mixta', valor: 'mixta' },
];

/** 'AAAA-MM-DD' -> 'DD/MM/AAAA' (sin pasar por Date: evita corrimientos de zona horaria). */
function formatearFecha(iso: string) {
  const [anio, mes, dia] = iso.split('-');
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : iso;
}


export default function CoordinadorFichasProgramaScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const { idSede, idPrograma } = useLocalSearchParams<{ idSede: string; idPrograma: string }>();
  const idSedeNum = Number(idSede);
  const idProgramaNum = Number(idPrograma);

  const [nombreSede, setNombreSede] = useState<string | null>(null);
  const [datos, setDatos] = useState<ProgramaFichas | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jornada, setJornada] = useState<Jornada | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [expandida, setExpandida] = useState<number | null>(null);
  const { mostrarExito } = useVictoriaToast();
  const [modalFicha, setModalFicha] = useState(false);


  const cargar = useCallback(() => {
    if (!perfil) return;
    // Sin ids válidos en la URL no hay nada que pedir: se avisa explícito en
    // vez de dejar el spinner girando para siempre.
    if (!idSedeNum || !idProgramaNum || Number.isNaN(idSedeNum) || Number.isNaN(idProgramaNum)) {
      setError('No se especificó un programa válido.');
      return;
    }
    setError(null);
    obtenerSedeDetalle(idSedeNum)
      .then((sede) => setNombreSede(sede.nombre))
      .catch(() => undefined);
    obtenerFichasPrograma(idSedeNum, idProgramaNum)
      .then((res) => {
        setDatos(res);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof CoordinadorApiError ? err.message : 'No se pudieron cargar las fichas.')
      );
  }, [perfil, idSedeNum, idProgramaNum]);

  useFocusEffect(cargar);

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  // El nombre en base de datos puede ya traer el prefijo "Sede ": se quita
  // para no mostrar "Fichas Sede Sede Fontibon".
  const sedeLimpia = (nombreSede ?? '').replace(/^sede\s+/i, '').trim();

  const fichas = datos?.fichas ?? [];
  const filtradas = fichas
    .filter((f) => jornada === null || f.jornada === jornada)
    .filter((f) => String(f.id_ficha).includes(busqueda.trim()));

  function detalle(ficha: FichaPrograma) {
    return (
      <View style={styles.detailBlock}>
        <Text style={styles.detailLine}>Estado: {ficha.estado}</Text>
        <Text style={styles.detailLine}>Horario: {ficha.horario ?? 'Sin horario registrado'}</Text>
        <Text style={styles.detailLine}>
          Periodo: {formatearFecha(ficha.fecha_inicio)} - {formatearFecha(ficha.fecha_fin)}
        </Text>
        <Text style={styles.detailLine}>
          Aprendices: {ficha.num_aprendices}
        </Text>
      </View>
    );
  }

  return (
    <VictoriaScreenShell>
      <PaneHeader
        eyebrow={sedeLimpia ? `VICTORIA > Fichas Sede ${sedeLimpia}` : 'VICTORIA > Fichas'}
        title={datos ? `Fichas - ${datos.nombre}` : 'Fichas'}
      />
      {datos?.nivel_formacion ? (
        <Text style={styles.subtitle}>{'• ' + datos.nivel_formacion}</Text>
      ) : null}

      <View style={styles.filtersRow}>
        {JORNADAS.map((j) => (
          <FilterChip
            key={j.valor}
            label={j.label}
            active={jornada === j.valor}
            onPress={() => setJornada((actual) => (actual === j.valor ? null : j.valor))}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.layout}>
        <View style={styles.main}>
          {!datos && !error ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}
          {datos && filtradas.length === 0 ? (
            <Text style={styles.empty}>
              {fichas.length === 0
                ? 'Este programa todavía no tiene fichas.'
                : 'No hay fichas para este filtro.'}
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
                        {datos?.nombre}
                        {ficha.trimestre ? `  -  Trimestre ${ficha.trimestre}` : ''}
                      </Text>
                    </View>
                    <Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={18} color="#555555" />
                  </Pressable>

                  {abierta ? detalle(ficha) : null}

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
          {/* TODO: siguientes vistas -> añadir ficha y añadir competencia. */}
          <Pressable style={styles.sideButton} onPress={() => setModalFicha(true)} accessibilityRole="button">
            <Ionicons name="cloud-upload-outline" size={15} color={VictoriaColors.white} />
            <Text style={styles.sideButtonText}>Añadir Ficha</Text>
          </Pressable>
          <Pressable style={styles.sideButton} accessibilityRole="button">
            <Ionicons name="cloud-upload-outline" size={15} color={VictoriaColors.white} />
            <Text style={styles.sideButtonText}>Añadir Competencia</Text>
          </Pressable>
        </View>
      </View>
      <FichaFormModal
        visible={modalFicha}
        onClose={() => setModalFicha(false)}
        idPrograma={idProgramaNum}
        programaNombre={datos?.nombre ?? ''}
        onCreada={(numero) => {
          cargar();
          mostrarExito(`Ficha ${numero} creada con éxito`);
        }}
      />

      <ExitButton />
    </VictoriaScreenShell>
  );
}
