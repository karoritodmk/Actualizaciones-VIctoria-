import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { useVictoriaToast } from '@/components/victoria/toast';
import { VictoriaColors } from '@/constants/victoria-theme';
import { crearSede } from '@/lib/sedes';
import { styles } from './sede-form-modal.styles';

/**
 * Modal "Añadir SEDE" (Doc: imagen 2 del módulo Sedes). Crea una sede con
 * POST /api/sedes/ (lib/sedes.ts::crearSede). "Información principal" se
 * guarda en el campo `descripcion` de la sede.
 *
 * El modal es autónomo: valida, llama a la API, muestra el toast de éxito y
 * avisa a la pantalla con onCreada() para que recargue su lista.
 */
export function SedeFormModal({
  visible,
  onClose,
  onCreada,
}: {
  visible: boolean;
  onClose: () => void;
  onCreada: () => void;
}) {
  const { mostrarExito } = useVictoriaToast();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [foco, setFoco] = useState<'nombre' | 'descripcion' | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cerrar() {
    setNombre('');
    setDescripcion('');
    setArchivo(null);
    setError(null);
    onClose();
  }

  async function elegirArchivo() {
    const resultado = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (resultado.canceled) return;
    setArchivo(resultado.assets[0]);
  }

  async function guardar() {
    if (!nombre.trim()) {
      setError('El nombre de la sede es obligatorio.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      // TODO: `archivo` aún no se envía -- el backend no tiene un endpoint
      // para el archivo de datos de la sede. Cuando exista, súbelo aquí.
      await crearSede({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
      });
      mostrarExito('Sede creada correctamente.');
      cerrar();
      onCreada();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la sede.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cerrar}>
      <Pressable
        style={[
          styles.backdrop,
          { backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } as object,
        ]}
        onPress={cerrar}>
        <Pressable
          style={[
            styles.card,
            { backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' } as object,
          ]}
          onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Añadir SEDE</Text>
              <Text style={styles.subtitle}>Servicio Nacional de Aprendizaje · SENA</Text>
            </View>
            <Pressable onPress={cerrar} hitSlop={10} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            value={nombre}
            onChangeText={setNombre}
            onFocus={() => setFoco('nombre')}
            onBlur={() => setFoco(null)}
            placeholder="Nombre de la sede"
            placeholderTextColor="rgba(28, 53, 45, 0.6)"
            style={[styles.input, foco === 'nombre' && styles.inputFocused]}
          />

          <TextInput
            value={descripcion}
            onChangeText={setDescripcion}
            onFocus={() => setFoco('descripcion')}
            onBlur={() => setFoco(null)}
            placeholder="Información principal de la sede"
            placeholderTextColor="rgba(28, 53, 45, 0.6)"
            multiline
            style={[styles.input, styles.textArea, foco === 'descripcion' && styles.inputFocused]}
          />

          <Pressable style={styles.dropzone} onPress={elegirArchivo}>
            <Ionicons name="cloud-upload-outline" size={26} color={VictoriaColors.mutedGreen} />
            <Text style={styles.dropzoneText} numberOfLines={1}>
              {archivo ? archivo.name : 'Cargar archivo datos de la sede'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.submit, (guardando || !nombre.trim()) && styles.submitDisabled]}
            onPress={guardar}
            disabled={guardando || !nombre.trim()}>
            {guardando ? (
              <ActivityIndicator color={VictoriaColors.white} />
            ) : (
              <Text style={styles.submitText}>Añadir SEDE</Text>
            )}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
