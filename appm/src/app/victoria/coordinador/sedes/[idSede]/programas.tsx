import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ArchivoCard } from '@/components/victoria/archivo-card';
import { ProgramaFormModal } from '@/components/victoria/programa-form-modal';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton, PaneHeader, PillButton } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import { obtenerSedeDetalle } from '@/lib/coordinador';
import { obtenerProgramasPorSede, type Programa } from '@/lib/programas';
import { useRoleGuard } from '@/lib/role-guard';
import { styles } from './programas.styles';

const extra = StyleSheet.create({
  subtitle: { color: 'rgba(255, 255, 255, 0.75)', fontSize: 12, marginBottom: 16 },
});

/**
 * Programas de una sede. Se abre con el botón "Programas" de cada tarjeta en
 * Sedes. Cada programa lleva a sus fichas (sedes/[idSede]/fichas/[idPrograma]).
 */
export default function CoordinadorProgramasSedeScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const { idSede } = useLocalSearchParams<{ idSede: string }>();
  const idSedeNum = Number(idSede);

  const [nombreSede, setNombreSede] = useState<string | null>(null);
  const [programas, setProgramas] = useState<Programa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<Programa | null>(null);

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
    obtenerProgramasPorSede(idSedeNum)
      .then((lista) =>
        setProgramas([...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')))
      )
      .catch((err: any) => setError(err?.message ?? 'No se pudieron cargar los programas.'));
  }, [perfil, idSedeNum]);

  useFocusEffect(cargar);

  function abrirNuevo() {
    setEditando(null);
    setModalVisible(true);
  }

  function abrirEditar(p: Programa) {
    setEditando(p);
    setModalVisible(true);
  }

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  return (
    <VictoriaScreenShell>
      <PaneHeader
        eyebrow={nombreSede ? `VICTORIA > Programas Sede ${nombreSede}` : 'VICTORIA > Programas'}
        title="Programas"
      />
      <Text style={extra.subtitle}>» Elige un programa para ver sus fichas</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.layout}>
        <View style={styles.main}>
          {!programas && !error ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}
          {programas && programas.length === 0 ? (
            <Text style={styles.empty}>Esta sede todavía no tiene programas registrados.</Text>
          ) : null}

          <View style={styles.list}>
            {programas?.map((p) => (
              <View key={p.id_programa} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="school-outline" size={20} color={VictoriaColors.white} />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle}>{p.nombre}</Text>
                    {p.nivel_formacion ? (
                      <Text style={styles.cardDescription}>{'• ' + p.nivel_formacion}</Text>
                    ) : null}
                    {p.descripcion ? <Text style={styles.cardDescription}>{p.descripcion}</Text> : null}
                  </View>
                </View>

                {p.archivo_url ? (
                  <ArchivoCard nombre={p.archivo_nombre} url={p.archivo_url} />
                ) : (
                  <Text style={styles.sinArchivo}>Sin documento adjunto</Text>
                )}

                <View style={styles.cardActions}>
                  <PillButton
                    label="Ver fichas"
                    icon="albums-outline"
                    variant="dark"
                    onPress={() =>
                      router.push(
                        `/victoria/coordinador/sedes/${idSedeNum}/fichas/${p.id_programa}` as never
                      )
                    }
                  />
                  <PillButton
                    label="Administrar programa"
                    icon="create-outline"
                    variant="light"
                    onPress={() => abrirEditar(p)}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.side}>
          <Pressable style={styles.addButton} onPress={abrirNuevo}>
            <Ionicons name="add-circle-outline" size={16} color={VictoriaColors.white} />
            <Text style={styles.addButtonText}>Añadir programa</Text>
          </Pressable>
        </View>
      </View>

      <ExitButton />

      <ProgramaFormModal
        visible={modalVisible}
        idSede={idSedeNum}
        programa={editando}
        subtitulo={nombreSede ? `Sede ${nombreSede}` : 'Servicio Nacional de Aprendizaje'}
        onClose={() => setModalVisible(false)}
        onGuardado={() => {
          setModalVisible(false);
          cargar();
        }}
      />
    </VictoriaScreenShell>
  );
}