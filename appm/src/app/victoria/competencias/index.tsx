import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton, PaneHeader, SubCard } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import { agruparPorTrimestre, Competencia, obtenerMisCompetencias, slugificar } from '@/lib/competencias';
import { styles } from './index.styles';


const NOMBRE_TRIMESTRE: Record<string, string> = {
  T1: 'Trimestre 1',
  T2: 'Trimestre 2',
  T3: 'Trimestre 3',
  T4: 'Trimestre 4',
};

export default function CompetenciasScreen() {
  const [competencias, setCompetencias] = useState<Competencia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());

  useEffect(() => {
    obtenerMisCompetencias()
      .then((datos) => {
        setCompetencias(datos);
        const grupos = agruparPorTrimestre(datos);
        // Arranca abierto solo el primer trimestre con datos, igual que
        // el diseño (Trimestre 1 aparece desplegado de entrada).
        if (grupos.length > 0) setAbiertos(new Set([grupos[0].trimestre]));
      })
      .catch((err) => setError(err.message));
  }, []);

  function alternar(trimestre: string) {
    setAbiertos((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(trimestre)) {
        siguiente.delete(trimestre);
      } else {
        siguiente.add(trimestre);
      }
      return siguiente;
    });
  }

  const grupos = competencias ? agruparPorTrimestre(competencias) : [];

  return (
    <VictoriaScreenShell>
      <PaneHeader eyebrow="VICTORIA > Competencias" title="Competencias" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!competencias && !error ? (
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      ) : null}

      {competencias && grupos.length === 0 ? (
        <Text style={styles.empty}>
          Todavía no hay competencias asignadas a tu programa de formación.
        </Text>
      ) : null}

      <View style={styles.grid}>
        {grupos.map((grupo) => {
          const abierto = abiertos.has(grupo.trimestre);
          return (
            <View key={grupo.trimestre} style={styles.column}>
              <Pressable style={styles.header} onPress={() => alternar(grupo.trimestre)}>
                <View style={styles.headerIcon}>
                  <Ionicons name="layers-outline" size={18} color={VictoriaColors.textOnLight} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>
                    {NOMBRE_TRIMESTRE[grupo.trimestre] ?? grupo.trimestre}
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    {grupo.competencias.length}{' '}
                    {grupo.competencias.length === 1 ? 'competencia' : 'competencias'}
                  </Text>
                </View>
                <Ionicons
                  name={abierto ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={VictoriaColors.textOnLight}
                />
              </Pressable>

              {abierto ? (
                <View style={styles.subList}>
                  {grupo.competencias.map((c) => (
                    <SubCard
                      key={c.id_competencia}
                      icon="layers-outline"
                      title={c.nombre}
                      subtitle={c.nombre_instructor ? `- ${c.nombre_instructor}` : 'Sin instructor asignado'}
                      actionLabel="Ver tareas"
                      actionHref={`/victoria/competencias/${grupo.trimestre}/${slugificar(c.nombre)}`}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <ExitButton />
    </VictoriaScreenShell>
  );
}
