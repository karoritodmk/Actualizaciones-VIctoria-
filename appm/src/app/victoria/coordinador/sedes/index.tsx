import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { useVictoriaToast } from '@/components/victoria/toast';
import { ExitButton, PaneHeader, PillButton, SearchPill } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import {
  CoordinadorApiError,
  obtenerSedeDetalle,
  obtenerSedes,
  SedeDetalle,
  SedeResumen,
} from '@/lib/coordinador';
import { useRoleGuard } from '@/lib/role-guard';
import { actualizarSede, crearSede, type SedeInput } from '@/lib/sedes';
import { styles } from './index.styles';

/** Estado del formulario del modal "Administrar SEDE" / "Añadir SEDE". */
type FormSede = {
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  horario: string;
};

const FORM_VACIO: FormSede = { nombre: '', descripcion: '', direccion: '', telefono: '', horario: '' };

function aForm(sede: SedeDetalle): FormSede {
  return {
    nombre: sede.nombre,
    descripcion: sede.descripcion ?? '',
    direccion: sede.direccion_principal ?? '',
    telefono: sede.telefono_atencion ?? '',
    horario: sede.horario_atencion ?? '',
  };
}

/** Campo vacío -> undefined, para que el backend lo guarde como NULL. */
function opcional(texto: string): string | undefined {
  const limpio = texto.trim();
  return limpio ? limpio : undefined;
}


export default function CoordinadorSedesScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const { mostrarExito } = useVictoriaToast();
  const [sedes, setSedes] = useState<SedeResumen[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [expandida, setExpandida] = useState<number | null>(null);
  // Caché de detalle por sede: se pide una sola vez, la primera vez que se expande.
  const [detalles, setDetalles] = useState<Record<number, SedeDetalle>>({});
  const [cargandoDetalle, setCargandoDetalle] = useState<number | null>(null);
  const [errorDetalle, setErrorDetalle] = useState<Record<number, string>>({});

  // Modal administrar / añadir. idEditando === null -> modo "Añadir".
  const [modalVisible, setModalVisible] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [form, setForm] = useState<FormSede>(FORM_VACIO);
  const [archivo, setArchivo] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const cargar = useCallback(() => {
    if (!perfil) return;
    setError(null);
    obtenerSedes()
      .then((res) => {
        setSedes(res);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof CoordinadorApiError ? err.message : 'No se pudieron cargar las sedes.')
      );
  }, [perfil]);

  useFocusEffect(cargar);

  const alternarSede = useCallback(
    (idSede: number) => {
      setExpandida((actual) => (actual === idSede ? null : idSede));
      if (detalles[idSede] || cargandoDetalle === idSede) return;
      setCargandoDetalle(idSede);
      obtenerSedeDetalle(idSede)
        .then((detalle) => {
          setDetalles((prev) => ({ ...prev, [idSede]: detalle }));
          setErrorDetalle((prev) => {
            const { [idSede]: _quitado, ...resto } = prev;
            return resto;
          });
        })
        .catch((err) =>
          setErrorDetalle((prev) => ({
            ...prev,
            [idSede]:
              err instanceof CoordinadorApiError ? err.message : 'No se pudo cargar la información de la sede.',
          }))
        )
        .finally(() => setCargandoDetalle((actual) => (actual === idSede ? null : actual)));
    },
    [detalles, cargandoDetalle]
  );

  function abrirModalAnadir() {
    setIdEditando(null);
    setForm(FORM_VACIO);
    setArchivo(null);
    setErrorModal(null);
    setModalVisible(true);
  }

  async function abrirModalAdministrar(idSede: number) {
    setIdEditando(idSede);
    setArchivo(null);
    setErrorModal(null);
    const enCache = detalles[idSede];
    if (enCache) {
      setForm(aForm(enCache));
      setModalVisible(true);
      return;
    }
    // Sin detalle en caché: se pide antes de abrir para no mostrar un formulario vacío.
    try {
      const detalle = await obtenerSedeDetalle(idSede);
      setDetalles((prev) => ({ ...prev, [idSede]: detalle }));
      setForm(aForm(detalle));
      setModalVisible(true);
    } catch (err) {
      setError(err instanceof CoordinadorApiError ? err.message : 'No se pudo cargar la sede.');
    }
  }

  function cerrarModal() {
    setModalVisible(false);
    setErrorModal(null);
  }

  /**
   * "Cargar archivo datos nuevos de la sede": lee un .json con las claves
   * nombre, descripcion, direccion_principal, telefono_atencion y
   * horario_atencion y rellena el formulario. NO guarda nada: el
   * coordinador revisa y confirma con "Guardar cambios SEDE".
   */
  async function cargarArchivo() {
    setErrorModal(null);
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (resultado.canceled || !resultado.assets?.length) return;
      const asset = resultado.assets[0];
      const texto = await (await fetch(asset.uri)).text();
      const datos = JSON.parse(texto);
      setForm((prev) => ({
        nombre: typeof datos.nombre === 'string' ? datos.nombre : prev.nombre,
        descripcion: typeof datos.descripcion === 'string' ? datos.descripcion : prev.descripcion,
        direccion:
          typeof datos.direccion_principal === 'string' ? datos.direccion_principal : prev.direccion,
        telefono:
          typeof datos.telefono_atencion === 'string' ? datos.telefono_atencion : prev.telefono,
        horario: typeof datos.horario_atencion === 'string' ? datos.horario_atencion : prev.horario,
      }));
      setArchivo(asset.name);
    } catch {
      setErrorModal('No se pudo leer el archivo. Debe ser un .json con los datos de la sede.');
    }
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      setErrorModal('El nombre de la sede es obligatorio.');
      return;
    }
    const datos: SedeInput = {
      nombre: form.nombre.trim(),
      descripcion: opcional(form.descripcion),
      direccion_principal: opcional(form.direccion),
      telefono_atencion: opcional(form.telefono),
      horario_atencion: opcional(form.horario),
    };
    setGuardando(true);
    setErrorModal(null);
    try {
      if (idEditando === null) {
        await crearSede(datos);
      } else {
        await actualizarSede(idEditando, datos);
        // El detalle cacheado quedó viejo: se descarta y se pide de nuevo al expandir.
        setDetalles((prev) => {
          const { [idEditando]: _viejo, ...resto } = prev;
          return resto;
        });
        setExpandida((actual) => (actual === idEditando ? null : actual));
      }
      cerrarModal();
      cargar();
      mostrarExito(idEditando === null ? 'Sede creada con éxito' : 'Sede actualizada con éxito');
    } catch (err: any) {
      setErrorModal(err.message ?? 'No se pudo guardar la sede.');
    } finally {
      setGuardando(false);
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

  const filtradas = (sedes ?? []).filter((s) =>
    s.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return (
    <VictoriaScreenShell>
      <PaneHeader eyebrow="VICTORIA > Sedes vigentes" title="Sedes · SENA" />
      <Text style={styles.subtitle}>» Servicio Nacional de Aprendizaje</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.layout}>
        <View style={styles.main}>
          {!sedes && !error ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}
          {sedes && filtradas.length === 0 ? (
            <Text style={styles.empty}>
              {sedes.length === 0 ? 'Todavía no hay sedes registradas.' : 'No se encontraron sedes con ese nombre.'}
            </Text>
          ) : null}

          <View style={styles.list}>
            {filtradas.map((sede) => {
              const abierta = expandida === sede.id_sede;
              const detalle = detalles[sede.id_sede];
              return (
                <View key={sede.id_sede} style={styles.card}>
                  <Pressable style={styles.cardHeader} onPress={() => alternarSede(sede.id_sede)}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="layers-outline" size={18} color={VictoriaColors.white} />
                    </View>
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.cardTitle}>{sede.nombre}</Text>
                      <Text style={styles.cardDescription} numberOfLines={abierta ? undefined : 2}>
                        {sede.descripcion ?? 'Sin descripción registrada.'}
                      </Text>
                    </View>
                    <Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={18} color="#555555" />
                  </Pressable>

                  {abierta ? (
                    <View style={styles.detailBlock}>
                      {cargandoDetalle === sede.id_sede && !detalle ? (
                        <ActivityIndicator color={VictoriaColors.darkGreen} style={styles.detailLoader} />
                      ) : null}
                      {errorDetalle[sede.id_sede] ? (
                        <Text style={styles.detailError}>{errorDetalle[sede.id_sede]}</Text>
                      ) : null}
                      {detalle?.direccion_principal ? (
                        <Text style={styles.detailLine}>
                          Dirección principal:{' '}
                          <Text
                            style={styles.detailLink}
                            onPress={() =>
                              Linking.openURL(
                                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  detalle.direccion_principal ?? ''
                                )}`
                              )
                            }>
                            {detalle.direccion_principal}
                          </Text>
                        </Text>
                      ) : null}
                      {detalle?.telefono_atencion ? (
                        <Text style={styles.detailLine}>
                          Teléfonos de atención: {detalle.telefono_atencion}
                        </Text>
                      ) : null}
                      {detalle?.horario_atencion ? (
                        <Text style={styles.detailLine}>Horario de atención: {detalle.horario_atencion}</Text>
                      ) : null}
                      {detalle &&
                      !detalle.direccion_principal &&
                      !detalle.telefono_atencion &&
                      !detalle.horario_atencion ? (
                        <Text style={styles.detailLine}>
                          Esta sede aún no tiene datos de contacto registrados.
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  <View style={styles.cardActions}>
                    <PillButton
                      label="Programas"
                      icon="school-outline"
                      variant="dark"
                      onPress={() =>
                        router.push(`/victoria/coordinador/sedes/${sede.id_sede}/programas` as never)
                      }
                    />
                    <PillButton
                      label="Administrar SEDE"
                      icon="create-outline"
                      variant="light"
                      onPress={() => abrirModalAdministrar(sede.id_sede)}
                    />
                    <PillButton
                      label="Instructores"
                      icon="people-outline"
                      variant="light"
                      onPress={() =>
                        router.push(`/victoria/coordinador/sedes/${sede.id_sede}/instructores` as never)
                      }
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.side}>
          <SearchPill value={busqueda} onChangeText={setBusqueda} placeholder="Encontrar sede" />
          <Pressable style={styles.addButton} onPress={abrirModalAnadir} accessibilityRole="button">
            <Ionicons name="cloud-upload-outline" size={15} color={VictoriaColors.white} />
            <Text style={styles.addButtonText}>Añadir SEDE</Text>
          </Pressable>
        </View>
      </View>

      <ExitButton />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={cerrarModal}>
        <Pressable style={styles.modalBackdrop} onPress={cerrarModal}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {idEditando === null ? 'Añadir SEDE' : 'Administrar SEDE'}
                  </Text>
                  <Text style={styles.modalSubtitle}>Servicio Nacional de Aprendizaje · SENA</Text>
                </View>
                <Pressable onPress={cerrarModal} hitSlop={8} accessibilityLabel="Cerrar">
                  <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
                </Pressable>
              </View>

              {errorModal ? <Text style={styles.modalError}>{errorModal}</Text> : null}

              <TextInput
                value={form.nombre}
                onChangeText={(t) => setForm((f) => ({ ...f, nombre: t }))}
                placeholder="Nombre de la sede"
                placeholderTextColor="#6b7d70"
                style={styles.inputPill}
              />
              <TextInput
                value={form.descripcion}
                onChangeText={(t) => setForm((f) => ({ ...f, descripcion: t }))}
                placeholder="Descripción de la sede"
                placeholderTextColor="#6b7d70"
                multiline
                style={styles.inputArea}
              />
              <TextInput
                value={form.direccion}
                onChangeText={(t) => setForm((f) => ({ ...f, direccion: t }))}
                placeholder="Dirección principal"
                placeholderTextColor="#6b7d70"
                style={styles.inputPill}
              />
              <TextInput
                value={form.telefono}
                onChangeText={(t) => setForm((f) => ({ ...f, telefono: t }))}
                placeholder="Teléfonos de atención"
                placeholderTextColor="#6b7d70"
                style={styles.inputPill}
              />
              <TextInput
                value={form.horario}
                onChangeText={(t) => setForm((f) => ({ ...f, horario: t }))}
                placeholder="Horario de atención"
                placeholderTextColor="#6b7d70"
                style={styles.inputPill}
              />

              <Pressable style={styles.uploadBox} onPress={cargarArchivo} accessibilityRole="button">
                <Ionicons name="cloud-upload-outline" size={26} color="#6b7d70" />
                <Text style={styles.uploadText}>
                  {archivo ?? 'Cargar archivo datos nuevos de la sede'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.saveButton, guardando && styles.saveButtonDisabled]}
                onPress={guardar}
                disabled={guardando}>
                <Text style={styles.saveButtonText}>
                  {guardando
                    ? 'Guardando...'
                    : idEditando === null
                      ? 'Crear SEDE'
                      : 'Guardar cambios SEDE'}
                </Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </VictoriaScreenShell>
  );
}