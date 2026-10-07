import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { useVictoriaToast } from '@/components/victoria/toast';
import { VictoriaColors } from '@/constants/victoria-theme';
import { crearNota, eliminarNota, Nota, obtenerNotas } from '@/lib/notas';
import { styles } from './notas.styles';

export default function NotasScreen() {
  const { mostrarExito, mostrarError } = useVictoriaToast();
  const [notas, setNotas] = useState<Nota[] | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [materia, setMateria] = useState('');
  const [contenido, setContenido] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  function cargar() {
    obtenerNotas()
      .then(setNotas)
      .catch((err) => setErrorCarga(err.message));
  }

  useEffect(cargar, []);

  function cerrarYLimpiar() {
    setModalVisible(false);
    setTitulo('');
    setMateria('');
    setContenido('');
    setErrorGuardar(null);
  }

  async function guardar() {
    if (!titulo.trim() || !contenido.trim()) {
      setErrorGuardar('Título y contenido son obligatorios.');
      return;
    }
    setGuardando(true);
    setErrorGuardar(null);
    try {
      await crearNota({ titulo, materia: materia || undefined, contenido });
      cerrarYLimpiar();
      cargar();
      mostrarExito('Nota guardada correctamente');
    } catch (err: any) {
      setErrorGuardar(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(idNota: number) {
    try {
      await eliminarNota(idNota);
      cargar();
      mostrarExito('Nota eliminada');
    } catch {
      mostrarError('No se pudo eliminar la nota');
    }
  }

  return (
    <VictoriaScreenShell>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Mis notas virtuales</Text>
          <Text style={styles.title}>Notas Personales</Text>
        </View>
        <Pressable style={styles.newButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="cloud-upload-outline" size={16} color={VictoriaColors.white} />
          <Text style={styles.newButtonText}>Nueva Nota</Text>
        </Pressable>
      </View>

      {errorCarga ? <Text style={styles.errorText}>{errorCarga}</Text> : null}
      {!notas && !errorCarga ? <ActivityIndicator color={VictoriaColors.white} /> : null}
      {notas && notas.length === 0 ? (
        <Text style={styles.empty}>Todavía no tienes notas. Crea la primera con "Nueva Nota".</Text>
      ) : null}

      <View style={styles.grid}>
        {notas?.map((nota) => (
          <View key={nota.id_nota} style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{nota.titulo}</Text>
              <Pressable onPress={() => borrar(nota.id_nota)} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color="#7a3b3b" />
              </Pressable>
            </View>
            {nota.materia ? <Text style={styles.cardSubject}>{nota.materia}</Text> : null}
            <Text style={styles.cardText}>{nota.contenido}</Text>
            <Text style={styles.cardDate}>
              {new Date(nota.fecha_creacion).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={cerrarYLimpiar}>
        <Pressable style={styles.modalBackdrop} onPress={cerrarYLimpiar}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Nueva Nota <Text style={styles.modalTitleMuted}>- mis notas virtuales</Text>
                </Text>
                <Pressable onPress={cerrarYLimpiar} hitSlop={8}>
                  <Ionicons name="close" size={20} color="#556b5c" />
                </Pressable>
              </View>

              {errorGuardar ? <Text style={styles.errorText}>{errorGuardar}</Text> : null}

              <TextInput
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Titulo de la nota"
                placeholderTextColor="#3a4a3f"
                style={[styles.input, { backgroundColor: '#a9ba9d' }]}
              />
              <TextInput
                value={materia}
                onChangeText={setMateria}
                placeholder="Materia (opcional)"
                placeholderTextColor="#3a4a3f"
                style={[styles.input, { backgroundColor: '#cbd6c5' }]}
              />
              <TextInput
                value={contenido}
                onChangeText={setContenido}
                placeholder="Escribe tu nota aquí..."
                placeholderTextColor="#3a4a3f"
                multiline
                numberOfLines={5}
                style={[styles.input, styles.textArea, { backgroundColor: '#cbd6c5' }]}
              />

              <Pressable
                style={[styles.saveButton, guardando && { opacity: 0.6 }]}
                onPress={guardar}
                disabled={guardando}>
                <Text style={styles.saveButtonText}>
                  {guardando ? 'Guardando...' : 'Guardar nota'}
                </Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </VictoriaScreenShell>
  );
}
