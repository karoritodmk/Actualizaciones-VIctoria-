import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { styles } from '@/components/victoria/instructores-lista.styles';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { useVictoriaToast } from '@/components/victoria/toast';
import { ExitButton, PaneHeader, SearchPill } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import type { Usuario } from '@/lib/aprendices';
import { actualizarFicha, type Ficha, obtenerFicha } from '@/lib/fichas';
import { obtenerInstructores } from '@/lib/instructores';
import { useRoleGuard } from '@/lib/role-guard';

const nombreCompleto = (u: Usuario) => `${u.nombre} ${u.apellido ?? ''}`.trim();

/**
 * "Instructor jefe" de una ficha.
 *  - Si la ficha YA tiene instructor jefe (id_director): abre directo su perfil.
 *  - Si no tiene: muestra la lista de instructores para asignarle uno; al
 *    asignarlo avisa con un mensaje de éxito y abre su perfil.
 */
export default function CoordinadorInstructorJefeScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const { idFicha } = useLocalSearchParams<{ idFicha: string }>();
  const idFichaNum = Number(idFicha);
  const { mostrarExito, mostrarError } = useVictoriaToast();

  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [instructores, setInstructores] = useState<Usuario[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [asignandoId, setAsignandoId] = useState<number | null>(null);

  const irAlPerfil = (id: number) =>
    router.replace(`/victoria/coordinador/instructores/${id}?desde=fichas` as never);

  const cargar = useCallback(() => {
    if (!perfil) return;
    if (!idFichaNum || Number.isNaN(idFichaNum)) {
      setError('No se especificó una ficha válida.');
      return;
    }
    setError(null);
    obtenerFicha(idFichaNum)
      .then((f) => {
        if (f.id_director != null) {
          irAlPerfil(f.id_director);
          return;
        }
        setFicha(f);
        return obtenerInstructores().then((lista) =>
          setInstructores([...lista].sort((a, b) => nombreCompleto(a).localeCompare(nombreCompleto(b), 'es')))
        );
      })
      .catch((err: any) => setError(err?.message ?? 'No se pudo cargar la ficha.'));
  }, [perfil, idFichaNum]);

  useFocusEffect(cargar);

  async function asignar(instructor: Usuario) {
    if (!ficha) return;
    setAsignandoId(instructor.id_usuario);
    try {
      // PUT reemplaza la ficha completa: se reenvían sus datos tal cual y solo cambia el director.
      const datos = {
        id_ficha: ficha.id_ficha,
        estado: ficha.estado,
        fecha_inicio: ficha.fecha_inicio,
        fecha_fin: ficha.fecha_fin,
        id_programa: ficha.id_programa,
        trimestre: ficha.trimestre ?? undefined,
        horario: (ficha as Ficha & { horario?: string | null }).horario ?? undefined,
        id_director: instructor.id_usuario,
      };
      await actualizarFicha(ficha.id_ficha, datos as any);
      mostrarExito(`${nombreCompleto(instructor)} fue asignado como instructor jefe de la ficha ${ficha.id_ficha}`);
      irAlPerfil(instructor.id_usuario);
    } catch (err: any) {
      mostrarError(err?.message ?? 'No se pudo asignar el instructor jefe.');
      setAsignandoId(null);
    }
  }

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  const termino = busqueda.trim().toLowerCase();
  const filtrados = (instructores ?? []).filter(
    (i) => !termino || [nombreCompleto(i), i.numero_documento, i.correo_sena].some((t) => t.toLowerCase().includes(termino))
  );

  return (
    <VictoriaScreenShell>
      <PaneHeader eyebrow="Fichas" title={`Instructor jefe - Ficha ${idFichaNum}`} backHref="/victoria/coordinador/fichas" />
      <Text style={styles.subtitle}>Esta ficha todavía no tiene instructor jefe. Elige uno de la lista.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.layout}>
        <View style={styles.main}>
          {!error && (!ficha || !instructores) ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}
          {instructores && filtrados.length === 0 ? (
            <Text style={styles.empty}>
              {instructores.length === 0 ? 'Todavía no hay instructores registrados.' : 'No se encontraron instructores con esa búsqueda.'}
            </Text>
          ) : null}
          <View style={styles.grid}>
            {filtrados.map((i) => (
              <View key={i.id_usuario} style={styles.card}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(i.nombre.trim()[0] ?? '?').toUpperCase()}</Text>
                </View>
                <View style={styles.cardTexto}>
                  <Text style={styles.cardNombre} numberOfLines={1}>{nombreCompleto(i)}</Text>
                  <Text style={styles.cardSub} numberOfLines={1}>{i.correo_sena}</Text>
                </View>
                <Pressable
                  style={styles.asignar}
                  onPress={() => asignar(i)}
                  disabled={asignandoId !== null}
                  accessibilityRole="button">
                  {asignandoId === i.id_usuario ? (
                    <ActivityIndicator color={VictoriaColors.white} size="small" />
                  ) : (
                    <Text style={styles.asignarTexto}>Asignar</Text>
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.side}>
          <SearchPill value={busqueda} onChangeText={setBusqueda} placeholder="Encontrar instructor" />
        </View>
      </View>

      <ExitButton />
    </VictoriaScreenShell>
  );
}