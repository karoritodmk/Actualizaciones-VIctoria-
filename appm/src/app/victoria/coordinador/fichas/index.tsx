import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { type FichaItem, FichasLista, jornadaDeHorario } from '@/components/victoria/fichas-lista';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { VictoriaColors } from '@/constants/victoria-theme';
import { obtenerSedes, type SedeResumen } from '@/lib/coordinador';
import { type Ficha, obtenerFichas } from '@/lib/fichas';
import { obtenerProgramas, type Programa } from '@/lib/programas';
import { useRoleGuard } from '@/lib/role-guard';

/**
 * Pestaña "Fichas SENA": TODAS las fichas del sistema (de todas las sedes y
 * programas), clasificadas por jornada, con buscador global.
 */
export default function CoordinadorFichasGeneralScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const [items, setItems] = useState<FichaItem[] | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => {
    if (!perfil) return;
    setError(null);
    Promise.all([
      obtenerFichas(),
      obtenerProgramas(),
      obtenerSedes().catch(() => [] as SedeResumen[]), // sin nombres de sede igual se ve la lista
    ])
      .then(([fichas, progs, sedes]) => {
        const nombreSede = new Map(sedes.map((s) => [s.id_sede, s.nombre.replace(/^sede\s+/i, '').trim()]));
        const porId = new Map(progs.map((p) => [p.id_programa, p]));
        setProgramas(progs);
        setItems(
          fichas.map((f) => {
            const horario = (f as Ficha & { horario?: string | null }).horario ?? null;
            const programa = f.id_programa != null ? porId.get(f.id_programa) : undefined;
            return {
              id_ficha: f.id_ficha,
              id_programa: f.id_programa ?? null,
              programaNombre: programa?.nombre ?? 'Sin programa',
              sedeNombre: programa?.id_sede != null ? (nombreSede.get(programa.id_sede) ?? null) : null,
              trimestre: f.trimestre ? f.trimestre.replace(/^T/i, '') : null,
              estado: f.estado,
              horario,
              jornada: jornadaDeHorario(horario),
              fecha_inicio: f.fecha_inicio,
              fecha_fin: f.fecha_fin,
            };
          })
        );
      })
      .catch((err: any) => setError(err?.message ?? 'No se pudieron cargar las fichas.'));
  }, [perfil]);

  useFocusEffect(cargar);

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  return (
    <FichasLista
      eyebrow="VICTORIA > Fichas SENA"
      title="Fichas · SENA"
      subtitle="» Todas las fichas, clasificadas por jornada"
      items={items}
      error={error}
      programas={programas}
      onRecargar={cargar}
    />
  );
}