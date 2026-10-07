import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton, PaneHeader } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import {
  AprendizResumen,
  crearAprendiz,
  InstructorApiError,
  NuevoAprendiz,
  obtenerAprendices,
  subirAdjunto,
} from '@/lib/instructor';
import { useRoleGuard } from '@/lib/role-guard';
import { styles, modalStyles } from './index.styles';

export default function InstructorAprendicesScreen() {
  const perfil = useRoleGuard(['instructor']);
  const { idFicha: idFichaParam } = useLocalSearchParams<{ idFicha: string }>();
  const idFicha = Number(idFichaParam);

  const [aprendices, setAprendices] = useState<AprendizResumen[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const cargar = useCallback(() => {
    if (!perfil || !idFicha) return;
    obtenerAprendices(idFicha)
      .then((res) => {
        setAprendices(res);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof InstructorApiError ? err.message : 'No se pudieron cargar los aprendices.')
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil, idFicha]);

  useFocusEffect(cargar);

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
      <View style={styles.headerRow}>
        <PaneHeader
          eyebrow="Volver a Fichas"
          title={`Ficha ${idFichaParam}`}
          backHref="/victoria/instructor/portafolios"
        />
        <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="person-add-outline" size={16} color={VictoriaColors.white} />
          <Text style={styles.addBtnText}>Añadir Aprendiz</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!aprendices && !error ? (
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      ) : null}
      {aprendices && aprendices.length === 0 ? (
        <Text style={styles.empty}>Todavía no hay aprendices en esta ficha.</Text>
      ) : null}

      <View style={styles.grid}>
        {aprendices?.map((a) => (
          <Pressable
            key={a.id_usuario}
            style={styles.aprendizRow}
            onPress={() =>
              router.push(`/victoria/instructor/portafolios/${idFicha}/${a.id_usuario}` as never)
            }>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{a.nombre_completo.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.aprendizInfo}>
              <Text style={styles.aprendizNombre}>{a.nombre_completo}</Text>
              <Text style={styles.aprendizEstado}>
                {a.estado_portafolio === 'con_portafolio' ? 'Con portafolio' : 'Sin portafolio'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#888888" />
          </Pressable>
        ))}
      </View>

      <ExitButton />

      <AñadirAprendizModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        idFicha={idFicha}
        onCreado={() => {
          setModalVisible(false);
          cargar();
        }}
      />
    </VictoriaScreenShell>
  );
}

function AñadirAprendizModal({
  visible,
  onClose,
  idFicha,
  onCreado,
}: {
  visible: boolean;
  onClose: () => void;
  idFicha: number;
  onCreado: () => void;
}) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    fechaNacimiento: '',
    correoPersonal: '',
    correoSena: '',
  });
  const [infoPrincipal, setInfoPrincipal] = useState('');
  const [archivoUrl, setArchivoUrl] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credenciales, setCredenciales] = useState<{ documento: string; temporal: string } | null>(
    null
  );

  function set<K extends keyof typeof form>(campo: K, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function limpiarYCerrar() {
    setForm({
      nombre: '',
      apellido: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      fechaNacimiento: '',
      correoPersonal: '',
      correoSena: '',
    });
    setInfoPrincipal('');
    setArchivoUrl(null);
    setNombreArchivo(null);
    setError(null);
    setCredenciales(null);
    onClose();
  }

  async function handleAdjuntar() {
    const resultado = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (resultado.canceled || !resultado.assets?.[0]) return;
    const archivo = resultado.assets[0];
    setSubiendo(true);
    setError(null);
    try {
      const url = await subirAdjunto({
        uri: archivo.uri,
        name: archivo.name,
        mimeType: archivo.mimeType,
      });
      setArchivoUrl(url);
      setNombreArchivo(archivo.name);
    } catch (err) {
      setError(err instanceof InstructorApiError ? err.message : 'No se pudo adjuntar el archivo.');
    } finally {
      setSubiendo(false);
    }
  }

  async function handleCrear() {
    if (!form.nombre.trim() || !form.numeroDocumento.trim() || !form.fechaNacimiento.trim()) {
      setError('Nombre, documento y fecha de nacimiento son obligatorios.');
      return;
    }
    if (!form.correoPersonal.trim() || !form.correoSena.trim()) {
      setError('El correo personal y el correo SENA son obligatorios para crear la cuenta.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const payload: NuevoAprendiz = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim() || undefined,
        tipo_documento: form.tipoDocumento.trim() || 'CC',
        numero_documento: form.numeroDocumento.trim(),
        fecha_nacimiento: form.fechaNacimiento.trim(),
        correo_personal: form.correoPersonal.trim(),
        correo_sena: form.correoSena.trim(),
        informacion_adicional: infoPrincipal.trim() || undefined,
        archivo_url: archivoUrl ?? undefined,
      };
      const creado = await crearAprendiz(idFicha, payload);
      if (creado.contrasena_temporal) {
        setCredenciales({ documento: creado.numero_documento, temporal: creado.contrasena_temporal });
      } else {
        onCreado();
      }
    } catch (err) {
      setError(err instanceof InstructorApiError ? err.message : 'No se pudo crear el aprendiz.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={limpiarYCerrar}>
      <Pressable style={modalStyles.backdrop} onPress={limpiarYCerrar}>
        <Pressable style={modalStyles.card} onPress={(e) => e.stopPropagation()}>
          <ScrollView contentContainerStyle={modalStyles.cardContent}>
            <View style={modalStyles.headerRow}>
              <View>
                <Text style={modalStyles.title}>Añadir Aprendiz</Text>
                <Text style={modalStyles.subtitle}>Ficha {idFicha}</Text>
              </View>
              <Pressable onPress={limpiarYCerrar} hitSlop={8}>
                <Ionicons name="close" size={20} color="#556b5c" />
              </Pressable>
            </View>

            {credenciales ? (
              <View style={modalStyles.successBox}>
                <Text style={modalStyles.successTitle}>Aprendiz creado ✅</Text>
                <Text style={modalStyles.successLine}>Documento: {credenciales.documento}</Text>
                <Text style={modalStyles.successLine}>Contraseña temporal: {credenciales.temporal}</Text>
                <Text style={modalStyles.successHint}>
                  Compártela con el aprendiz para su primer inicio de sesión.
                </Text>
                <Pressable
                  style={modalStyles.submitBtn}
                  onPress={() => {
                    onCreado();
                    limpiarYCerrar();
                  }}>
                  <Text style={modalStyles.submitText}>Listo</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <TextInput
                  value={form.nombre}
                  onChangeText={(v) => set('nombre', v)}
                  placeholder="Nombre del aprendiz"
                  placeholderTextColor="#8a8a8a"
                  style={modalStyles.input}
                />
                <TextInput
                  value={form.apellido}
                  onChangeText={(v) => set('apellido', v)}
                  placeholder="Apellido (opcional)"
                  placeholderTextColor="#8a8a8a"
                  style={modalStyles.input}
                />
                <View style={modalStyles.inline}>
                  <TextInput
                    value={form.tipoDocumento}
                    onChangeText={(v) => set('tipoDocumento', v)}
                    placeholder="Tipo doc. (CC)"
                    placeholderTextColor="#8a8a8a"
                    style={[modalStyles.input, modalStyles.inputSmall]}
                  />
                  <TextInput
                    value={form.numeroDocumento}
                    onChangeText={(v) => set('numeroDocumento', v)}
                    placeholder="Número de documento"
                    placeholderTextColor="#8a8a8a"
                    keyboardType="number-pad"
                    style={[modalStyles.input, modalStyles.inputGrow]}
                  />
                </View>
                <TextInput
                  value={form.fechaNacimiento}
                  onChangeText={(v) => set('fechaNacimiento', v)}
                  placeholder="Fecha de nacimiento (aaaa-mm-dd)"
                  placeholderTextColor="#8a8a8a"
                  style={modalStyles.input}
                />
                <TextInput
                  value={form.correoPersonal}
                  onChangeText={(v) => set('correoPersonal', v)}
                  placeholder="Correo personal"
                  placeholderTextColor="#8a8a8a"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={modalStyles.input}
                />
                <TextInput
                  value={form.correoSena}
                  onChangeText={(v) => set('correoSena', v)}
                  placeholder="Correo institucional SENA"
                  placeholderTextColor="#8a8a8a"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={modalStyles.input}
                />
                <TextInput
                  value={infoPrincipal}
                  onChangeText={setInfoPrincipal}
                  placeholder="Información Principal del Aprendiz"
                  placeholderTextColor="#8a8a8a"
                  multiline
                  style={[modalStyles.input, modalStyles.textarea]}
                />

                <Pressable style={modalStyles.attachBox} onPress={handleAdjuntar} disabled={subiendo}>
                  {subiendo ? (
                    <ActivityIndicator color="#556b5c" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={22} color="#556b5c" />
                      <Text style={modalStyles.attachText}>
                        {nombreArchivo ?? 'Cargar archivo/datos del aprendiz'}
                      </Text>
                    </>
                  )}
                </Pressable>

                {error ? <Text style={modalStyles.error}>{error}</Text> : null}

                <Pressable
                  style={[modalStyles.submitBtn, guardando && modalStyles.submitBtnDisabled]}
                  onPress={handleCrear}
                  disabled={guardando}>
                  {guardando ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={modalStyles.submitText}>Añadir Aprendiz</Text>
                  )}
                </Pressable>
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
