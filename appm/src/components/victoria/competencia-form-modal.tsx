import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { VictoriaColors } from '@/constants/victoria-theme';
import {
  crearCompetencia,
  subirArchivoCompetencia,
  TRIMESTRES_COMPETENCIA,
  type TrimestreCompetencia,
} from '@/lib/competencias-ficha';
import {
  type DocumentoElegido,
  elegirDocumento,
  formatearTamano,
  tipoDeDocumento,
} from '@/lib/documentos';
import { styles } from './competencias-modales.styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  idFicha: number;
  idPrograma: number;
  /** Trimestre que aparece marcado al abrir (el filtro activo de la pantalla). */
  trimestreInicial?: TrimestreCompetencia | null;
  /** Se llama cuando la competencia quedó creada (con o sin documento). */
  onCreada: (nombre: string, conDocumento: boolean) => void;
  /** Se llama si la competencia se creó pero el documento falló, para refrescar la lista. */
  onCambio: () => void;
};

/**
 * "Añadir Competencia": nombre, información principal, trimestre y, si se
 * quiere, el documento de actividades (PDF o Word) que luego se previsualiza
 * con el botón "Actividades".
 */
export function CompetenciaFormModal({
  visible,
  onClose,
  idFicha,
  idPrograma,
  trimestreInicial,
  onCreada,
  onCambio,
}: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [trimestre, setTrimestre] = useState<TrimestreCompetencia | null>(null);
  const [archivo, setArchivo] = useState<DocumentoElegido | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  // Si la competencia se creó pero el documento falló: reintentar solo sube el documento.
  const [idCreado, setIdCreado] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setNombre('');
    setDescripcion('');
    setTrimestre(trimestreInicial ?? null);
    setArchivo(null);
    setError(null);
    setErrorArchivo(null);
    setGuardando(false);
    setExito(false);
    setIdCreado(null);
  }, [visible, trimestreInicial]);

  async function elegir() {
    setErrorArchivo(null);
    try {
      const elegido = await elegirDocumento();
      if (elegido) setArchivo(elegido);
    } catch (err: any) {
      setErrorArchivo(err?.message ?? 'Solo se permiten archivos PDF o Word.');
    }
  }

  async function guardar() {
    setError(null);
    setErrorArchivo(null);
    if (idCreado === null) {
      if (!nombre.trim()) return setError('El nombre de la competencia es obligatorio.');
      if (!trimestre) return setError('Elige el trimestre de la competencia.');
    }
    setGuardando(true);
    let id = idCreado;
    try {
      if (id === null) {
        const nueva = await crearCompetencia({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          trimestre: trimestre as TrimestreCompetencia,
          id_programa: idPrograma,
        });
        id = nueva.id_competencia;
        setIdCreado(id);
      }
      if (archivo) await subirArchivoCompetencia(id, archivo);
      setExito(true);
      await new Promise((r) => setTimeout(r, 900));
      onClose();
      onCreada(nombre.trim(), !!archivo);
    } catch (err: any) {
      if (id !== null) {
        onCambio();
        setErrorArchivo(`La competencia se creó, pero el documento NO se subió: ${err?.message ?? 'error desconocido'}`);
      } else {
        setError(err?.message ?? 'No se pudo crear la competencia.');
      }
    } finally {
      setGuardando(false);
    }
  }

  const bloqueado = idCreado !== null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Añadir Competencia</Text>
                <Text style={styles.subtitle}>Competencias · Ficha {idFicha}</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar">
                <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre de la competencia *"
              placeholderTextColor="#6b7d70"
              maxLength={120}
              editable={!bloqueado}
              style={styles.input}
            />
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Información principal de la competencia"
              placeholderTextColor="#6b7d70"
              multiline
              maxLength={300}
              editable={!bloqueado}
              style={styles.area}
            />
            <Text style={styles.ayuda}>{descripcion.length}/300 caracteres</Text>

            <Text style={styles.etiqueta}>Trimestre *</Text>
            <View style={styles.chips}>
              {TRIMESTRES_COMPETENCIA.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.chip, trimestre === t && styles.chipActivo]}
                  onPress={() => !bloqueado && setTrimestre(t)}>
                  <Text style={[styles.chipText, trimestre === t && styles.chipTextActivo]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.uploadBox, archivo && styles.uploadBoxListo]}
              onPress={elegir}
              disabled={guardando}
              accessibilityRole="button">
              <Ionicons
                name={archivo ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={archivo ? 28 : 26}
                color={archivo ? '#2e7d43' : '#6b7d70'}
              />
              <Text style={[styles.uploadText, archivo && styles.uploadTextListo]} numberOfLines={2}>
                {archivo ? archivo.name : 'Cargar archivo de actividades de la competencia (PDF o Word)'}
              </Text>
              <Text style={styles.uploadHint}>
                {archivo
                  ? `${tipoDeDocumento(archivo.name)}${archivo.size ? ` · ${formatearTamano(archivo.size)}` : ''} · listo: se sube al guardar · toca para cambiarlo`
                  : 'Opcional · .pdf, .doc o .docx · máximo 15 MB'}
              </Text>
            </Pressable>
            {errorArchivo ? <Text style={styles.error}>{errorArchivo}</Text> : null}

            <Pressable
              style={[styles.submit, exito && styles.submitExito, guardando && !exito && styles.submitDisabled]}
              onPress={guardar}
              disabled={guardando || exito}>
              {exito ? (
                <View style={styles.submitRow}>
                  <Ionicons name="checkmark-circle" size={20} color={VictoriaColors.white} />
                  <Text style={styles.submitText}>¡Competencia añadida!</Text>
                </View>
              ) : guardando ? (
                <View style={styles.submitRow}>
                  <ActivityIndicator color={VictoriaColors.white} size="small" />
                  <Text style={styles.submitText}>{archivo ? 'Guardando y subiendo documento...' : 'Guardando...'}</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>
                  {bloqueado ? 'Reintentar subir documento' : 'Añadir competencia'}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}