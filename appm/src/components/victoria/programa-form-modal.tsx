import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { useVictoriaToast } from '@/components/victoria/toast';
import { VictoriaColors } from '@/constants/victoria-theme';
import { actualizarProgramaSede, crearProgramaSede, type ProgramaSede } from '@/lib/coordinador';
import { styles } from './programa-form-modal.styles';

type Extras = { nivel_formacion?: string; url_programa?: string };


export function ProgramaFormModal({
  visible,
  idSede,
  programa,
  subtitulo,
  onClose,
  onGuardado,
}: {
  visible: boolean;
  idSede: number;
  programa?: ProgramaSede | null;
  subtitulo: string;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const editando = !!programa;
  const { mostrarExito } = useVictoriaToast();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  // Campos que vienen del .json pero que el formulario no muestra.
  const [extras, setExtras] = useState<Extras>({});
  const [archivo, setArchivo] = useState<string | null>(null);
  const [foco, setFoco] = useState<'nombre' | 'descripcion' | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cada vez que se ABRE el modal el formulario arranca limpio (modo añadir)
  // o con los datos del programa (modo administrar). Se hace al abrir y no al
  // cerrar para que no se vea vacío durante la animación de salida.
  useEffect(() => {
    if (!visible) return;
    setNombre(programa?.nombre ?? '');
    setDescripcion(programa?.descripcion ?? '');
    setExtras({});
    setArchivo(null);
    setError(null);
  }, [visible, programa]);

  async function elegirArchivo() {
    setError(null);
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (resultado.canceled || !resultado.assets?.length) return;
      const asset = resultado.assets[0];
      const datos = JSON.parse(await (await fetch(asset.uri)).text());

      if (typeof datos.nombre === 'string') setNombre(datos.nombre);
      if (typeof datos.descripcion === 'string') setDescripcion(datos.descripcion);
      setExtras({
        nivel_formacion: typeof datos.nivel_formacion === 'string' ? datos.nivel_formacion : undefined,
        url_programa: typeof datos.url_programa === 'string' ? datos.url_programa : undefined,
      });
      setArchivo(asset.name);
    } catch {
      setError(
        'No se pudo leer el archivo. Debe ser un .json con las claves nombre, descripcion, nivel_formacion y url_programa.'
      );
    }
  }

  async function guardar() {
    if (!nombre.trim()) {
      setError('El nombre del programa es obligatorio.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const comunes = {
        nombre: nombre.trim(),
        nivel_formacion: extras.nivel_formacion?.trim() || undefined,
        url_programa: extras.url_programa?.trim() || undefined,
      };
      if (programa) {
        // Se envía siempre (incluso vacía) para que se pueda borrar la descripción.
        await actualizarProgramaSede(idSede, programa.id_programa, {
          ...comunes,
          descripcion: descripcion.trim(),
        });
        mostrarExito('Programa actualizado con éxito');
      } else {
        await crearProgramaSede(idSede, {
          ...comunes,
          descripcion: descripcion.trim() || undefined,
        });
        mostrarExito('Programa creado con éxito');
      }
      onClose();
      onGuardado();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editando
            ? 'No se pudo actualizar el programa.'
            : 'No se pudo crear el programa.'
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[
          styles.backdrop,
          { backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' } as object,
        ]}
        onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            { backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' } as object,
          ]}
          onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{editando ? 'Administrar Programa' : 'Añadir Programa'}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitulo}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            value={nombre}
            onChangeText={setNombre}
            onFocus={() => setFoco('nombre')}
            onBlur={() => setFoco(null)}
            placeholder="Nombre del Programa"
            placeholderTextColor="rgba(28, 53, 45, 0.6)"
            maxLength={120}
            style={[styles.input, foco === 'nombre' && styles.inputFocused]}
          />

          <TextInput
            value={descripcion}
            onChangeText={setDescripcion}
            onFocus={() => setFoco('descripcion')}
            onBlur={() => setFoco(null)}
            placeholder="Información principal del Programa"
            placeholderTextColor="rgba(28, 53, 45, 0.6)"
            maxLength={300}
            multiline
            style={[styles.input, styles.textArea, foco === 'descripcion' && styles.inputFocused]}
          />

          <Pressable style={styles.dropzone} onPress={elegirArchivo} accessibilityRole="button">
            <Ionicons name="cloud-upload-outline" size={26} color={VictoriaColors.mutedGreen} />
            <Text style={styles.dropzoneText} numberOfLines={1}>
              {archivo ??
                (editando
                  ? 'Cargar archivo datos nuevos del programa'
                  : 'Cargar archivo datos del Programa')}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.submit, (guardando || !nombre.trim()) && styles.submitDisabled]}
            onPress={guardar}
            disabled={guardando || !nombre.trim()}>
            {guardando ? (
              <ActivityIndicator color={VictoriaColors.white} />
            ) : (
              <Text style={styles.submitText}>
                {editando ? 'Guardar cambios Programa' : 'Añadir Programa'}
              </Text>
            )}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
