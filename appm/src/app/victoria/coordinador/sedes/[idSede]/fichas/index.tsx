import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { type FichaItem, FichasLista, jornadaDeHorario } from '@/components/victoria/fichas-lista';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { VictoriaColors } from '@/constants/victoria-theme';
import {
  obtenerFichasPrograma,
  obtenerProgramasSede,
  obtenerSedeDetalle,
  type ProgramaSede,
} from '@/lib/coordinador';
import { useRoleGuard } from '@/lib/role-guard';

/**
 * Fichas de una sede (todas sus programas juntos), clasificadas por jornada.
 * Se abre con el botón "Fichas" de cada tarjeta en Sedes.
 */
export default function CoordinadorFichasSedeScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const { idSede } = useLocalSearchParams<{ idSede: string }>();
  const idSedeNum = Number(idSede);

  const [nombreSede, setNombreSede] = useState<string | null>(null);
  const [programas, setProgramas] = useState<ProgramaSede[]>([]);
  const [items, setItems] = useState<FichaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(() => {
    if (!perfil) return;
    if (!idSedeNum || Number.isNaN(idSedeNum)) {
      setError('No se especificó una sede válida.');
      return;
    }
    setError(null);
    obtenerSedeDetalle(idSedeNum)
      .then((sede) => setNombreSede(sede.nombre))
      .catch(() => undefined);
    obtenerProgramasSede(idSedeNum)
      .then((progs) => {
        setProgramas(progs);
        return Promise.all(
          progs.map((p) =>
            obtenerFichasPrograma(idSedeNum, p.id_programa)
              .then((res) =>
                res.fichas.map(
                  (f): FichaItem => ({
                    id_ficha: f.id_ficha,
                    id_programa: p.id_programa,
                    programaNombre: p.nombre,
                    trimestre: f.trimestre != null ? String(f.trimestre) : null,
                    estado: f.estado,
                    horario: f.horario,
                    jornada: f.jornada ?? jornadaDeHorario(f.horario),
                    fecha_inicio: f.fecha_inicio,
                    fecha_fin: f.fecha_fin,
                    num_aprendices: f.num_aprendices,
                  })
                )
              )
              // Si un programa falla no se cae toda la lista.
              .catch(() => [] as FichaItem[])
          )
        );
      })
      .then((grupos) => setItems(grupos.flat()))
      .catch((err: any) => setError(err?.message ?? 'No se pudieron cargar las fichas.'));
  }, [perfil, idSedeNum]);

  useFocusEffect(cargar);

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  const sedeLimpia = (nombreSede ?? '').replace(/^sede\s+/i, '').trim();

  return (
    <FichasLista
      eyebrow={sedeLimpia ? `VICTORIA > Fichas Sede ${sedeLimpia}` : 'VICTORIA > Fichas'}
      title={sedeLimpia ? `Fichas · ${sedeLimpia}` : 'Fichas'}
      subtitle="» Todas las fichas de la sede, clasificadas por jornada"
      items={items}
      error={error}
      programas={programas}
      onRecargar={cargar}
      vacioMensaje="Esta sede todavía no tiene fichas."
    />
  );
}