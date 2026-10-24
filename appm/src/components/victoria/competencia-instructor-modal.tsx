import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { VictoriaColors } from '@/constants/victoria-theme';
import type { Usuario } from '@/lib/aprendices';
import { asignarInstructorCompetencia, type CompetenciaFicha } from '@/lib/competencias-ficha';
import { obtenerInstructores } from '@/lib/instructores';
import { styles } from './competencias-modales.styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  competencia: CompetenciaFicha | null;
  onCambio: (mensaje?: string) => void;
};

/** "Instructor": muestra quién dicta la competencia y permite asignar o quitar a otro. */
export function CompetenciaInstructorModal({ visible, onClose, competencia, onCambio }: Props) {
  const [instructores, setInstructores] = useState<Usuario[] | null>(null);
  const [actual, setActual] = useState<number | null>(null);
  const [guardandoId, setGuardandoId] = useState<number | 'ninguno' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !competencia) return;
    setActual(competencia.id_instructor);
    setError(null);
    setGuardandoId(null);
    setInstructores(null);
    obtenerInstructores()
      .then(setInstructores)
      .catch((err: any) => {
        setInstructores([]);
        setError(err?.message ?? 'No se pudieron cargar los instructores.');
      });
  }, [visible, competencia?.id_competencia]);

  async function asignar(idInstructor: number | null, nombre: string) {
    if (!competencia) return;
    setError(null);
    setGuardandoId(idInstructor ?? 'ninguno');
    try {
      await asignarInstructorCompetencia(competencia, idInstructor);
      setActual(idInstructor);
      onCambio(idInstructor === null ? 'Instructor quitado de la competencia' : `${nombre} asignado a la competencia`);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo asignar el instructor.');
    } finally {
      setGuardandoId(null);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Instructor</Text>
                <Text style={styles.subtitle}>{competencia?.nombre ?? 'Competencia'}</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar">
                <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
              </Pressable>
            </View>

            <Text style={styles.etiqueta}>
              Actual:{' '}
              <Text style={styles.nombreDoc}>
                {competencia?.id_instructor === actual
                  ? (competencia?.nombre_instructor ?? 'Sin instructor asignado')
                  : (instructores?.find((i) => i.id_usuario === actual)?.nombre ?? 'Sin instructor asignado')}
              </Text>
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {!instructores ? <ActivityIndicator color={VictoriaColors.darkGreen} /> : null}
            {instructores && instructores.length === 0 && !error ? (
              <Text style={styles.ayuda}>No hay instructores registrados todavía.</Text>
            ) : null}

            <View style={styles.lista}>
              {(instructores ?? []).map((i) => {
                const nombre = `${i.nombre} ${i.apellido ?? ''}`.trim();
                return (
                  <Pressable
                    key={i.id_usuario}
                    style={[styles.opcion, actual === i.id_usuario && styles.opcionActiva]}
                    onPress={() => asignar(i.id_usuario, nombre)}
                    disabled={guardandoId !== null}>
                    <Text style={styles.opcionTexto}>{nombre}</Text>
                    {guardandoId === i.id_usuario ? (
                      <ActivityIndicator color={VictoriaColors.darkGreen} size="small" />
                    ) : actual === i.id_usuario ? (
                      <Ionicons name="checkmark-circle" size={18} color="#2e7d43" />
                    ) : null}
                  </Pressable>
                );
              })}
              {actual !== null ? (
                <Pressable
                  style={[styles.opcion]}
                  onPress={() => asignar(null, '')}
                  disabled={guardandoId !== null}>
                  <Text style={styles.opcionTexto}>Quitar instructor</Text>
                  {guardandoId === 'ninguno' ? (
                    <ActivityIndicator color={VictoriaColors.darkGreen} size="small" />
                  ) : (
                    <Ionicons name="close-circle-outline" size={18} color="#b3261e" />
                  )}
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}