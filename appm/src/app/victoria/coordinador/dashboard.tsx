import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { DataCard, ExitButton, ListRow, PaneHeader } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import {
  CoordinadorApiError,
  DashboardCoordinador,
  obtenerDashboardCoordinador,
} from '@/lib/coordinador';
import { useRoleGuard } from '@/lib/role-guard';
import { styles } from './dashboard.styles';

/** "1 ficha" / "2 fichas" */
function plural(n: number, singular: string, plural: string) {
  return n === 1 ? singular : plural;
}

/** "3 sin ficha" cuando hay pendientes; si no hay ninguno, el texto en positivo. */
function textoPendiente(n: number, conPendientes: string, sinPendientes: string) {
  return n > 0 ? `${n} ${conPendientes}` : sinPendientes;
}

/**
 * Dashboard exclusivo del rol coordinador. Vista GENERAL del sistema:
 * tres tarjetas tocables (Fichas, Instructores, Aprendices) con su total y
 * el pendiente más importante de cada una, y la lista "Fichas recientes".
 * Mismo patrón que victoria/instructor/dashboard.tsx: useRoleGuard bloquea
 * la pantalla a quien no sea coordinador, y GET /api/coordinador/dashboard
 * trae los datos reales.
 */
export default function CoordinadorDashboardScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const [datos, setDatos] = useState<DashboardCoordinador | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(() => {
    if (!perfil) return;
    setCargando(true);
    obtenerDashboardCoordinador()
      .then((res) => {
        setDatos(res);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof CoordinadorApiError ? err.message : 'No se pudo cargar el dashboard.')
      )
      .finally(() => setCargando(false));
  }, [perfil]);

  useFocusEffect(cargar);

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={VictoriaColors.white} />
        </View>
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  return (
    <VictoriaScreenShell>
      <PaneHeader eyebrow="VICTORIA > Inicio" title={`Bienvenido, ${perfil.nombre}`} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {cargando && !datos ? (
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      ) : null}

      {datos ? (
        <>
          <View style={styles.cardsRow}>
            <DataCard
              icon="folder-outline"
              title={`${datos.total_fichas} ${plural(datos.total_fichas, 'ficha', 'fichas')}`}
              subtitle={`${datos.fichas_activas} ${plural(datos.fichas_activas, 'activa', 'activas')}\n${textoPendiente(datos.fichas_sin_instructor, 'sin instructor asignado', 'Todas con instructor')}`}
              style={styles.card}
              onPress={() => router.push('/victoria/coordinador/gestion/fichas' as never)}
            />
            <DataCard
              icon="person-outline"
              title={`${datos.total_instructores} ${plural(datos.total_instructores, 'instructor', 'instructores')}`}
              subtitle={`Equipo docente\n${textoPendiente(datos.instructores_sin_asignacion, 'sin asignaciones', 'Todos con asignaciones')}`}
              style={styles.card}
              onPress={() => router.push('/victoria/coordinador/gestion/instructores' as never)}
            />
            <DataCard
              icon="people-outline"
              title={`${datos.total_aprendices} ${plural(datos.total_aprendices, 'aprendiz', 'aprendices')}`}
              subtitle={`Matriculados\n${textoPendiente(datos.aprendices_sin_ficha, 'sin ficha', 'Todos con ficha')}`}
              style={styles.card}
              onPress={() => router.push('/victoria/coordinador/gestion/fichas' as never)}
            />
          </View>

          <Text style={styles.sectionLabel}>Fichas recientes</Text>
          {datos.fichas_recientes.length === 0 ? (
            <Text style={styles.empty}>Todavía no hay fichas para mostrar.</Text>
          ) : (
            <View style={styles.list}>
              {datos.fichas_recientes.map((ficha) => (
                <ListRow
                  key={ficha.id_ficha}
                  icon="folder-outline"
                  title={`Ficha ${ficha.numero_ficha ?? ficha.id_ficha}`}
                  subtitle={`${ficha.nombre_programa ?? 'Programa'} · ${ficha.num_estudiantes} estudiantes`}
                  actionLabel="Ver"
                  onPressAction={() => router.push('/victoria/coordinador/gestion/fichas' as never)}
                />
              ))}
            </View>
          )}
        </>
      ) : null}

      <ExitButton />
    </VictoriaScreenShell>
  );
}
