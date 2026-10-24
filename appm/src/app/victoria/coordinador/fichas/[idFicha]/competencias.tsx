import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { CompetenciaActividadesModal } from '@/components/victoria/competencia-actividades-modal';
import { CompetenciaFormModal } from '@/components/victoria/competencia-form-modal';
import { CompetenciaInstructorModal } from '@/components/victoria/competencia-instructor-modal';
import { styles } from '@/components/victoria/competencias-ficha.styles';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { useVictoriaToast } from '@/components/victoria/toast';
import { ExitButton, FilterChip, PaneHeader, PillButton, SearchPill } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import {
  type CompetenciaFicha,
  obtenerCompetenciasDePrograma,
  TRIMESTRES_COMPETENCIA,
  type TrimestreCompetencia,
} from '@/lib/competencias-ficha';
import { type Ficha, obtenerFicha } from '@/lib/fichas';
import { obtenerProgramas } from '@/lib/programas';
import { useRoleGuard } from '@/lib/role-guard';

/**
 * Competencias de una ficha (las de su programa de formación), por trimestre.
 * Se abre con el botón "Competencias" de cada ficha.
 *  - Actividades: vista previa del documento (PDF/Word) de la competencia.
 *  - Instructor: ver / asignar el instructor de la competencia.
 *  - Añadir Competencia: nombre, información, trimestre y documento.
 */
export default function CoordinadorCompetenciasFichaScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const { idFicha } = useLocalSearchParams<{ idFicha: string }>();
  const idFichaNum = Number(idFicha);
  const { mostrarExito } = useVictoriaToast();

  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [programaNombre, setProgramaNombre] = useState('');
  const [competencias, setCompetencias] = useState<CompetenciaFicha[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trimestre, setTrimestre] = useState<TrimestreCompetencia | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [expandida, setExpandida] = useState<number | null>(null);
  const [modalForm, setModalForm] = useState(false);
  // Se guarda el id (no el objeto) para que el modal siempre vea la competencia ya refrescada.
  const [idActividades, setIdActividades] = useState<number | null>(null);
  const [idInstructor, setIdInstructor] = useState<number | null>(null);

  const cargar = useCallback(() => {
    if (!perfil) return;
    if (!idFichaNum || Number.isNaN(idFichaNum)) {
      setError('No se especificó una ficha válida.');
      return;
    }
    setError(null);
    obtenerFicha(idFichaNum)
      .then(async (f) => {
        setFicha(f);
        if (f.id_programa == null) {
          setCompetencias([]);
          return;
        }
        obtenerProgramas()
          .then((progs) => setProgramaNombre(progs.find((p) => p.id_programa === f.id_programa)?.nombre ?? ''))
          .catch(() => undefined);
        setCompetencias(await obtenerCompetenciasDePrograma(f.id_programa));
      })
      .catch((err: any) => setError(err?.message ?? 'No se pudieron cargar las competencias.'));
  }, [perfil, idFichaNum]);

  useFocusEffect(cargar);

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  const lista = competencias ?? [];
  const cuenta = (t: string) => lista.filter((c) => c.trimestre === t).length;
  const termino = busqueda.trim().toLowerCase();
  const filtradas = lista
    .filter((c) => trimestre === null || c.trimestre === trimestre)
    .filter(
      (c) =>
        !termino ||
        [c.nombre, c.descripcion ?? '', c.nombre_instructor ?? ''].some((t) => t.toLowerCase().includes(termino))
    )
    .sort((a, b) => a.trimestre.localeCompare(b.trimestre) || a.nombre.localeCompare(b.nombre, 'es'));

  const sinPrograma = ficha !== null && ficha.id_programa == null;
  const idPrograma = ficha?.id_programa ?? null;
  const actividades = lista.find((c) => c.id_competencia === idActividades) ?? null;
  const instructor = lista.find((c) => c.id_competencia === idInstructor) ?? null;

  const refrescar = (mensaje?: string) => {
    cargar();
    if (mensaje) mostrarExito(mensaje);
  };

  return (
    <VictoriaScreenShell>
      <PaneHeader
        eyebrow={programaNombre ? `Fichas · ${programaNombre}` : 'Fichas'}
        title={`Competencias - Ficha ${idFichaNum}`}
        backHref="/victoria/coordinador/fichas"
      />
      <Text style={styles.subtitle}>{programaNombre || 'Programa sin nombre'}</Text>

      <View style={styles.filtersRow}>
        {TRIMESTRES_COMPETENCIA.map((t) => (
          <FilterChip
            key={t}
            label={competencias ? `${t} · ${cuenta(t)}` : t}
            active={trimestre === t}
            onPress={() => setTrimestre((actual) => (actual === t ? null : t))}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.layout}>
        <View style={styles.main}>
          {!competencias && !error ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}
          {sinPrograma ? (
            <Text style={styles.empty}>
              Esta ficha no tiene un programa de formación asignado, por eso no tiene competencias.
            </Text>
          ) : null}
          {competencias && !sinPrograma && filtradas.length === 0 ? (
            <Text style={styles.empty}>
              {lista.length === 0
                ? 'Este programa todavía no tiene competencias. Usa "Añadir Competencia".'
                : 'No hay competencias para ese filtro o búsqueda.'}
            </Text>
          ) : null}

          <View style={styles.list}>
            {filtradas.map((c) => {
              const abierta = expandida === c.id_competencia;
              return (
                <View key={c.id_competencia} style={styles.card}>
                  <Pressable
                    style={styles.cardHeader}
                    onPress={() => setExpandida(abierta ? null : c.id_competencia)}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="layers-outline" size={18} color={VictoriaColors.white} />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.cardTitle}>{c.nombre}</Text>
                      <Text style={styles.cardDescription} numberOfLines={abierta ? undefined : 1}>
                        {c.descripcion ?? 'Sin descripción registrada.'}
                      </Text>
                      {abierta ? (
                        <Text style={styles.cardMeta}>
                          {c.trimestre} · Instructor: {c.nombre_instructor ?? 'sin asignar'}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={18} color="#555555" />
                  </Pressable>

                  <View style={styles.cardActions}>
                    <PillButton
                      label="Actividades"
                      icon="create-outline"
                      variant="dark"
                      onPress={() => setIdActividades(c.id_competencia)}
                    />
                    <PillButton
                      label="Instructor"
                      icon="create-outline"
                      variant="light"
                      onPress={() => setIdInstructor(c.id_competencia)}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.side}>
          <SearchPill value={busqueda} onChangeText={setBusqueda} placeholder="Encontrar competencia" />
          {!sinPrograma && idPrograma !== null ? (
            <Pressable style={styles.sideButton} onPress={() => setModalForm(true)} accessibilityRole="button">
              <Ionicons name="cloud-upload-outline" size={15} color={VictoriaColors.white} />
              <Text style={styles.sideButtonText}>Añadir Competencia</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <ExitButton />

      {idPrograma !== null ? (
        <CompetenciaFormModal
          visible={modalForm}
          onClose={() => setModalForm(false)}
          idFicha={idFichaNum}
          idPrograma={idPrograma}
          trimestreInicial={trimestre}
          onCreada={(nombre, conDocumento) => {
            cargar();
            mostrarExito(
              conDocumento
                ? `Competencia "${nombre}" creada y documento adjuntado`
                : `Competencia "${nombre}" creada con éxito`
            );
          }}
          onCambio={cargar}
        />
      ) : null}

      <CompetenciaActividadesModal
        visible={idActividades !== null}
        onClose={() => setIdActividades(null)}
        idFicha={idFichaNum}
        competencia={actividades}
        onCambio={refrescar}
      />

      <CompetenciaInstructorModal
        visible={idInstructor !== null}
        onClose={() => setIdInstructor(null)}
        competencia={instructor}
        onCambio={refrescar}
      />
    </VictoriaScreenShell>
  );
}