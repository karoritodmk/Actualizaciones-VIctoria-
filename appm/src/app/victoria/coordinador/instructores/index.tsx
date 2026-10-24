import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { InstructorFormModal } from '@/components/victoria/instructor-form-modal';
import { styles } from '@/components/victoria/instructores-lista.styles';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton, FilterChip, PaneHeader, SearchPill } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import type { Usuario } from '@/lib/aprendices';
import { obtenerInstructores } from '@/lib/instructores';
import { useRoleGuard } from '@/lib/role-guard';

type Tipo = 'planta' | 'tecnico' | 'transversal';

const FILTROS: { label: string; valor: Tipo | 'todos' }[] = [
  { label: 'Todos', valor: 'todos' },
  { label: 'De Planta', valor: 'planta' },
  { label: 'Tecnico', valor: 'tecnico' },
  { label: 'Transversal', valor: 'transversal' },
];

const nombreCompleto = (u: Usuario) => `${u.nombre} ${u.apellido ?? ''}`.trim();

// Se lee con un cast para no depender de que el tipo Usuario ya declare
// tipo_instructor. Un instructor sin tipo se cuenta como "de planta".
const tipoDe = (u: Usuario): Tipo =>
  ((u as { tipo_instructor?: string | null }).tipo_instructor as Tipo) || 'planta';

// Estilos de lo nuevo (filtros + botón). Los de las tarjetas siguen en
// instructores-lista.styles.ts, sin tocarlo.
const extra = StyleSheet.create({
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: VictoriaColors.darkerGreen,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginTop: 12,
  },
  addButtonText: { color: VictoriaColors.white, fontWeight: '600', fontSize: 13 },
});

/**
 * Pestaña "Instructores": todos los instructores, con filtros por tipo,
 * buscador y botón "Añadir Instructor" (abre InstructorFormModal).
 * Cada tarjeta abre el perfil del instructor.
 */
export default function CoordinadorInstructoresTodosScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const [instructores, setInstructores] = useState<Usuario[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Tipo | 'todos'>('todos');
  const [modalVisible, setModalVisible] = useState(false);

  const cargar = useCallback(() => {
    if (!perfil) return;
    setError(null);
    obtenerInstructores()
      .then((lista) =>
        setInstructores(
          [...lista].sort((a, b) => nombreCompleto(a).localeCompare(nombreCompleto(b), 'es'))
        )
      )
      .catch((err: any) => setError(err?.message ?? 'No se pudieron cargar los instructores.'));
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

  const termino = busqueda.trim().toLowerCase();
  const filtrados = (instructores ?? [])
    .filter((i) => filtro === 'todos' || tipoDe(i) === filtro)
    .filter(
      (i) =>
        !termino ||
        [nombreCompleto(i), i.numero_documento, i.correo_sena].some((t) =>
          t.toLowerCase().includes(termino)
        )
    );

  return (
    <VictoriaScreenShell>
      <PaneHeader eyebrow="VICTORIA > Instructores" title="Instructores · TODOS" />
      <Text style={styles.subtitle}>» Elige un instructor para ver su perfil</Text>

      <View style={extra.filtros}>
        {FILTROS.map((f) => (
          <FilterChip
            key={f.valor}
            label={f.label}
            active={filtro === f.valor}
            onPress={() => setFiltro(f.valor)}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.layout}>
        <View style={styles.main}>
          {!instructores && !error ? (
            <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
          ) : null}
          {instructores && filtrados.length === 0 ? (
            <Text style={styles.empty}>
              {instructores.length === 0
                ? 'Todavía no hay instructores registrados.'
                : 'No se encontraron instructores con ese filtro o búsqueda.'}
            </Text>
          ) : null}
          <View style={styles.grid}>
            {filtrados.map((i) => (
              <Pressable
                key={i.id_usuario}
                style={styles.card}
                onPress={() =>
                  router.push(
                    `/victoria/coordinador/instructores/${i.id_usuario}?tipo=${tipoDe(i)}` as never
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Ver perfil de ${nombreCompleto(i)}`}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(i.nombre.trim()[0] ?? '?').toUpperCase()}</Text>
                </View>
                <View style={styles.cardTexto}>
                  <Text style={styles.cardNombre} numberOfLines={1}>
                    {nombreCompleto(i)}
                  </Text>
                  <Text style={styles.cardVerPerfil}>- Ver perfil</Text>
                </View>
                <Ionicons name="person-outline" size={18} color="#556b5c" />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.side}>
          <SearchPill value={busqueda} onChangeText={setBusqueda} placeholder="Encontrar instructor" />
          <Pressable style={extra.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="cloud-upload-outline" size={14} color={VictoriaColors.white} />
            <Text style={extra.addButtonText}>Añadir Instructor</Text>
          </Pressable>
        </View>
      </View>

      <ExitButton />

      <InstructorFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreado={cargar}
      />
    </VictoriaScreenShell>
  );
}