import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton, PaneHeader } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import {
  InstructorApiError,
  obtenerArbolCompetencias,
  TrimestreConMaterias,
} from '@/lib/instructor';
import { useRoleGuard } from '@/lib/role-guard';
import { styles } from './index.styles';

/** Doc22, imagen 2: acordeón Trimestre > Materia (competencia) > Fichas. */
export default function InstructorCompetenciasScreen() {
  const perfil = useRoleGuard(['instructor']);
  const [arbol, setArbol] = useState<TrimestreConMaterias[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trimestresAbiertos, setTrimestresAbiertos] = useState<Set<number>>(new Set());
  const [materiasAbiertas, setMateriasAbiertas] = useState<Set<number>>(new Set());

  const cargar = useCallback(() => {
    if (!perfil) return;
    obtenerArbolCompetencias()
      .then((res) => {
        setArbol(res);
        setError(null);
        // Por comodidad, el primer trimestre con datos arranca expandido.
        if (res.length > 0) setTrimestresAbiertos(new Set([res[0].trimestre]));
      })
      .catch((err) =>
        setError(err instanceof InstructorApiError ? err.message : 'No se pudieron cargar las competencias.')
      );
  }, [perfil]);

  useFocusEffect(cargar);

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  function toggleTrimestre(t: number) {
    setTrimestresAbiertos((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  function toggleMateria(idCompetencia: number) {
    setMateriasAbiertas((prev) => {
      const next = new Set(prev);
      next.has(idCompetencia) ? next.delete(idCompetencia) : next.add(idCompetencia);
      return next;
    });
  }

  const columnas: TrimestreConMaterias[][] = [[], []];
  (arbol ?? []).forEach((t, i) => columnas[i % 2].push(t));

  return (
    <VictoriaScreenShell>
      <PaneHeader eyebrow="VICTORIA > Competencias gestión de materias" title="Competencias" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!arbol && !error ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}

      {arbol && arbol.length === 0 ? (
        <Text style={styles.empty}>
          Todavía no tienes trimestres, materias ni fichas asignadas. Un administrador debe
          asignártelas desde POST /api/instructor/asignaciones.
        </Text>
      ) : null}

      <View style={styles.columnsRow}>
        {columnas.map((columna, colIdx) => (
          <View key={colIdx} style={styles.column}>
            {columna.map((t) => {
              const abierto = trimestresAbiertos.has(t.trimestre);
              return (
                <View key={t.trimestre} style={styles.trimestreBlock}>
                  <Pressable style={styles.trimestreHeader} onPress={() => toggleTrimestre(t.trimestre)}>
                    <View style={styles.trimestreHeaderLeft}>
                      <View style={styles.iconChip}>
                        <Ionicons name="layers-outline" size={16} color={VictoriaColors.textOnLight} />
                      </View>
                      <View>
                        <Text style={styles.trimestreTitle}>Trimestre {t.trimestre}</Text>
                        <Text style={styles.trimestreSubtitle}>
                          {t.materias.length} materia{t.materias.length === 1 ? '' : 's'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name={abierto ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#666666"
                    />
                  </Pressable>

                  {abierto ? (
                    <View style={styles.materiasWrap}>
                      {t.materias.map((materia) => {
                        const materiaAbierta = materiasAbiertas.has(materia.id_competencia);
                        return (
                          <View key={materia.id_competencia}>
                            <Pressable
                              style={styles.materiaRow}
                              onPress={() => toggleMateria(materia.id_competencia)}>
                              <View style={styles.trimestreHeaderLeft}>
                                <View style={[styles.iconChip, styles.iconChipSmall]}>
                                  <Ionicons
                                    name="diamond-outline"
                                    size={14}
                                    color={VictoriaColors.textOnLight}
                                  />
                                </View>
                                <Text style={styles.materiaTitle}>{materia.nombre}</Text>
                              </View>
                              <View style={styles.materiaRight}>
                                <View style={styles.badgeChip}>
                                  <Text style={styles.badgeChipText}>
                                    {materia.fichas.length} Ficha{materia.fichas.length === 1 ? '' : 's'}
                                  </Text>
                                </View>
                                <Ionicons
                                  name={materiaAbierta ? 'chevron-up' : 'chevron-down'}
                                  size={16}
                                  color="#666666"
                                />
                              </View>
                            </Pressable>

                            {materiaAbierta ? (
                              <View style={styles.fichasWrap}>
                                {materia.fichas.map((ficha) => (
                                  <Pressable
                                    key={ficha.id_ficha}
                                    style={styles.fichaRow}
                                    onPress={() =>
                                      router.push(
                                        `/victoria/instructor/competencias/${ficha.id_ficha}/${materia.id_competencia}` as never
                                      )
                                    }>
                                    <View style={styles.trimestreHeaderLeft}>
                                      <Ionicons
                                        name="albums-outline"
                                        size={14}
                                        color={VictoriaColors.textOnLight}
                                      />
                                      <Text style={styles.fichaTitle}>
                                        Ficha {ficha.numero_ficha ?? ficha.id_ficha}
                                      </Text>
                                    </View>
                                    <Text style={styles.fichaSubtitle}>
                                      {ficha.num_estudiantes} estudiantes
                                    </Text>
                                  </Pressable>
                                ))}
                                {materia.fichas.length === 0 ? (
                                  <Text style={styles.emptySmall}>Sin fichas en esta materia.</Text>
                                ) : null}
                              </View>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <ExitButton />
    </VictoriaScreenShell>
  );
}
