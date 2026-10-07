import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ArchivoCard } from '@/components/victoria/archivo-card';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { useVictoriaToast } from '@/components/victoria/toast';
import { ExitButton, PaneHeader, PillButton, SearchPill } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import { obtenerSedeDetalle, type SedeDetalle } from '@/lib/coordinador';
import { type DocumentoElegido, elegirDocumento, formatearTamano, tipoDeDocumento } from '@/lib/documentos';
import {
  crearPrograma,
  obtenerProgramasPorSede,
  type Programa,
  quitarArchivoPrograma,
  subirArchivoPrograma,
} from '@/lib/programas';
import { useRoleGuard } from '@/lib/role-guard';
import { styles } from './programas.styles';

/**
 * Programas de una sede. "Añadir Programa" pide nombre, descripción y, si se
 * quiere, un documento PDF/Word. Cada programa muestra un recuadro de acceso
 * rápido a su documento (o un botón para adjuntarlo después).
 */
export default function CoordinadorProgramasSedeScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const { idSede } = useLocalSearchParams<{ idSede: string }>();
  const idSedeNum = Number(idSede);
  const { mostrarExito, mostrarError } = useVictoriaToast();

  const [sede, setSede] = useState<SedeDetalle | null>(null);
  const [programas, setProgramas] = useState<Programa[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [adjuntandoId, setAdjuntandoId] = useState<number | null>(null);
  const [quitandoId, setQuitandoId] = useState<number | null>(null);

  // Modal "Añadir Programa"
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState<DocumentoElegido | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  // Si el programa se creó pero el documento falló, se recuerda su id para que
  // "reintentar" solo suba el documento y no cree el programa dos veces.
  const [idCreado, setIdCreado] = useState<number | null>(null);

  const cargar = useCallback(() => {
    if (!perfil) return;
    if (!idSedeNum || Number.isNaN(idSedeNum)) {
      setError('No se especificó una sede válida.');
      return;
    }
    setError(null);
    obtenerSedeDetalle(idSedeNum)
      .then(setSede)
      .catch((err: any) => setError(err.message ?? 'No se pudo cargar la sede.'));
    obtenerProgramasPorSede(idSedeNum)
      .then((res) => {
        setProgramas(res);
        setError(null);
      })
      .catch((err: any) => setError(err.message ?? 'No se pudieron cargar los programas.'));
  }, [perfil, idSedeNum]);

  useFocusEffect(cargar);

  function abrirModal() {
    setNombre('');
    setDescripcion('');
    setArchivo(null);
    setErrorModal(null);
    setErrorArchivo(null);
    setIdCreado(null);
    setModalVisible(true);
  }

  function cerrarModal() {
    setModalVisible(false);
    setErrorModal(null);
    setErrorArchivo(null);
  }

  async function elegirArchivo() {
    setErrorArchivo(null);
    try {
      const elegido = await elegirDocumento();
      if (elegido) setArchivo(elegido);
    } catch (err: any) {
      setErrorArchivo(err.message ?? 'Solo se permiten archivos PDF o Word.');
      mostrarError('Archivo no válido: solo PDF o Word');
    }
  }

  async function guardar() {
    if (!nombre.trim()) {
      setErrorModal('El nombre del programa es obligatorio.');
      return;
    }
    setGuardando(true);
    setErrorModal(null);
    setErrorArchivo(null);
    let id = idCreado;
    let creado = id !== null;
    try {
      if (id === null) {
        const nuevo = await crearPrograma({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          id_sede: idSedeNum,
        });
        id = nuevo.id_programa;
        creado = true;
        setIdCreado(id);
      }
      if (archivo) await subirArchivoPrograma(id, archivo);
      cerrarModal();
      cargar();
      mostrarExito(archivo ? 'Programa añadido y documento adjuntado' : 'Programa añadido con éxito');
    } catch (err: any) {
      if (creado) {
        cargar();
        setErrorArchivo(`El programa se añadió, pero el documento NO se subió: ${err.message}`);
        mostrarError('El programa se añadió, pero el documento no se subió');
      } else {
        setErrorModal(err.message ?? 'No se pudo añadir el programa.');
      }
    } finally {
      setGuardando(false);
    }
  }

  async function adjuntarAPrograma(programa: Programa) {
    setAviso(null);
    setAdjuntandoId(programa.id_programa);
    try {
      const elegido = await elegirDocumento();
      if (!elegido) return;
      await subirArchivoPrograma(programa.id_programa, elegido);
      cargar();
      mostrarExito('Documento adjuntado al programa');
    } catch (err: any) {
      setAviso(err.message ?? 'No se pudo adjuntar el documento.');
      mostrarError('No se pudo adjuntar el documento');
    } finally {
      setAdjuntandoId(null);
    }
  }

  async function quitarDePrograma(programa: Programa) {
    setAviso(null);
    setQuitandoId(programa.id_programa);
    try {
      await quitarArchivoPrograma(programa.id_programa);
      cargar();
      mostrarExito('Documento quitado del programa');
    } catch (err: any) {
      setAviso(err.message ?? 'No se pudo quitar el documento.');
    } finally {
      setQuitandoId(null);
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

  const filtrados = (programas ?? []).filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );
  const nombreSede = sede?.nombre ?? '';
  const subtituloModal = sede
    ? `SEDE ${sede.nombre}${sede.descripcion ? ` - ${sede.descripcion}` : ''}`
    : 'SEDE';

  return (
    <VictoriaScreenShell>
      <PaneHeader
        eyebrow={`VICTORIA > Sede ${nombreSede} > Programas`}
        title={`Programas · ${nombreSede}`}
        backHref="/victoria/coordinador/sedes"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {aviso ? (
        <View style={styles.aviso}>
          <Ionicons name="warning-outline" size={16} color="#b3261e" />
          <Text style={styles.avisoTexto}>{aviso}</Text>
        </View>
      ) : null}

      <View style={styles.layout}>
        <View style={styles.main}>
          {!programas && !error ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}
          {programas && filtrados.length === 0 ? (
            <Text style={styles.empty}>
              {programas.length === 0
                ? 'Esta sede todavía no tiene programas. Usa "Añadir Programa".'
                : 'No se encontraron programas con ese nombre.'}
            </Text>
          ) : null}

          <View style={styles.list}>
            {filtrados.map((p) => (
              <View key={p.id_programa} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="school-outline" size={18} color={VictoriaColors.white} />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.cardTitle}>{p.nombre}</Text>
                    <Text style={styles.cardDescription}>{p.descripcion ?? 'Sin descripción registrada.'}</Text>
                    {p.url_programa && /^https?:\/\//i.test(p.url_programa) ? (
                      <Text style={styles.cardLink} onPress={() => Linking.openURL(p.url_programa as string)}>
                        Enlace del programa
                      </Text>
                    ) : null}
                  </View>
                </View>

                {p.archivo_url ? (
                  <ArchivoCard
                    nombre={p.archivo_nombre}
                    url={p.archivo_url}
                    onQuitar={() => quitarDePrograma(p)}
                    quitando={quitandoId === p.id_programa}
                  />
                ) : (
                  <View style={styles.cardActions}>
                    <Text style={styles.sinArchivo}>Sin documento adjunto</Text>
                    <PillButton
                      label={adjuntandoId === p.id_programa ? 'Subiendo…' : 'Adjuntar documento'}
                      icon="cloud-upload-outline"
                      variant="light"
                      onPress={() => adjuntandoId === null && adjuntarAPrograma(p)}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.side}>
          <SearchPill value={busqueda} onChangeText={setBusqueda} placeholder="Encontrar programa" />
          <Pressable style={styles.addButton} onPress={abrirModal} accessibilityRole="button">
            <Ionicons name="add-circle-outline" size={15} color={VictoriaColors.white} />
            <Text style={styles.addButtonText}>Añadir Programa</Text>
          </Pressable>
        </View>
      </View>

      <ExitButton />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={cerrarModal}>
        <Pressable style={styles.modalBackdrop} onPress={cerrarModal}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Añadir Programa</Text>
                  <Text style={styles.modalSubtitle}>{subtituloModal}</Text>
                </View>
                <Pressable onPress={cerrarModal} hitSlop={8} accessibilityLabel="Cerrar">
                  <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
                </Pressable>
              </View>

              {errorModal ? <Text style={styles.modalError}>{errorModal}</Text> : null}

              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del programa"
                placeholderTextColor="#6b7d70"
                editable={idCreado === null}
                style={styles.inputPill}
              />
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción del programa"
                placeholderTextColor="#6b7d70"
                multiline
                editable={idCreado === null}
                style={styles.inputArea}
              />

              <Pressable
                style={[styles.uploadBox, archivo && styles.uploadBoxListo]}
                onPress={elegirArchivo}
                accessibilityRole="button">
                <Ionicons
                  name={archivo ? 'checkmark-circle' : 'cloud-upload-outline'}
                  size={26}
                  color={archivo ? '#2f6b3d' : '#6b7d70'}
                />
                <Text style={styles.uploadText} numberOfLines={2}>
                  {archivo ? archivo.name : 'Adjuntar documento del programa (PDF o Word)'}
                </Text>
                <Text style={styles.uploadHint}>
                  {archivo
                    ? `${tipoDeDocumento(archivo.name)}${archivo.size ? ` · ${formatearTamano(archivo.size)}` : ''} · listo: se sube al guardar. Toca para cambiarlo.`
                    : 'Opcional · solo .pdf, .doc o .docx · máximo 15 MB'}
                </Text>
              </Pressable>
              {errorArchivo ? (
                <View style={styles.avisoArchivo}>
                  <Ionicons name="warning-outline" size={16} color="#b3261e" />
                  <Text style={styles.avisoArchivoTexto}>{errorArchivo}</Text>
                </View>
              ) : null}

              <Pressable
                style={[styles.saveButton, guardando && styles.saveButtonDisabled]}
                onPress={guardar}
                disabled={guardando}>
                <Text style={styles.saveButtonText}>
                  {guardando ? 'Guardando...' : idCreado !== null ? 'Reintentar subir documento' : 'Añadir Programa'}
                </Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </VictoriaScreenShell>
  );
}
