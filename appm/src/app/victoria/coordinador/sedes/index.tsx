import { Ionicons } from '@expo/vector-icons';
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

import { ArchivoCard } from '@/components/victoria/archivo-card';
import { HorarioEditor } from '@/components/victoria/horario-editor';
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
import { DocumentoElegido, elegirArchivoSede, MENSAJE_ARCHIVO_SEDE } from '@/lib/documentos';
import { useRoleGuard } from '@/lib/role-guard';
import {
  actualizarSede,
  crearSede,
  quitarArchivoSede,
  subirArchivoSede,
  type SedeInput,
} from '@/lib/sedes';
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
  const { mostrarExito, mostrarError } = useVictoriaToast();
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
  // Archivo elegido que se subirá al guardar (la sede puede tener además uno ya guardado).
  const [archivoNuevo, setArchivoNuevo] = useState<DocumentoElegido | null>(null);
  const [quitandoArchivo, setQuitandoArchivo] = useState(false);
  const [horarioError, setHorarioError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [leyendoArchivo, setLeyendoArchivo] = useState(false);
  const [exitoGuardado, setExitoGuardado] = useState(false);


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
    setArchivoNuevo(null);
    setHorarioError(null);
    setErrorModal(null);
    setModalVisible(true);
  }

  async function abrirModalAdministrar(idSede: number) {
    setExitoGuardado(false);
    setIdEditando(idSede);
    setArchivoNuevo(null);
    setHorarioError(null);
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
   * "Cargar archivo con información adicional": elige un PDF, Word, Excel,
   * etc. Se sube al guardar la sede y aparece en su tarjeta al desplegarla.
   */
  async function elegirArchivo() {
    setErrorModal(null);
    try {
      const elegido = await elegirArchivoSede();
      if (elegido) setArchivoNuevo(elegido);
    } catch (err) {
      setErrorModal(err instanceof Error ? err.message : 'No se pudo elegir el archivo.');
    }
  }

  async function quitarArchivoActual() {
    if (idEditando === null) return;
    setQuitandoArchivo(true);
    setErrorModal(null);
    try {
      const sede = await quitarArchivoSede(idEditando);
      setDetalles((prev) => (prev[idEditando] ? { ...prev, [idEditando]: { ...prev[idEditando], ...sede } } : prev));
      cargar();
    } catch (err) {
      setErrorModal(err instanceof Error ? err.message : 'No se pudo quitar el archivo.');
    } finally {
      setQuitandoArchivo(false);
    }
  }

  async function guardar() {
    if (!form.nombre.trim()) {
      setErrorModal('El nombre de la sede es obligatorio.');
      return;
    }
    if (horarioError) {
      setErrorModal(horarioError);
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
    let idGuardada: number | null = null;
    try {
      const guardada =
        idEditando === null ? await crearSede(datos) : await actualizarSede(idEditando, datos);
      idGuardada = guardada.id_sede;
      if (archivoNuevo) await subirArchivoSede(guardada.id_sede, archivoNuevo);
      // El detalle cacheado quedó viejo: se descarta y se pide de nuevo al expandir.
      setDetalles((prev) => {
        const { [guardada.id_sede]: _viejo, ...resto } = prev;
        return resto;
      });
      setExpandida((actual) => (actual === guardada.id_sede ? null : actual));
      setExitoGuardado(true);
      await new Promise((r) => setTimeout(r, 900));
      setExitoGuardado(false);
      cerrarModal();
      cargar();
      mostrarExito(
        archivoNuevo
          ? 'Sede guardada y archivo subido con éxito'
          : idEditando === null
            ? 'Sede creada con éxito'
            : 'Sede actualizada con éxito'
      );
    } catch (err: any) {
      setExitoGuardado(false);
      if (idGuardada !== null) {
        // La sede sí se guardó; solo falló el archivo. Se pasa a modo "Administrar"
        // para que reintentar NO cree la sede dos veces.
        const id = idGuardada;
        setIdEditando(id);
        setDetalles((prev) => {
          const { [id]: _viejo, ...resto } = prev;
          return resto;
        });
        cargar();
        setErrorModal(`La sede se guardó, pero el archivo no se pudo subir: ${err.message}`);
      } else {
        setErrorModal(err.message ?? 'No se pudo guardar la sede.');
      }
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

  const sedeEditada = idEditando !== null ? detalles[idEditando] : undefined;
  const archivoActual = sedeEditada?.archivo_url ? sedeEditada : null;

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
                        <View>
                          <Text style={styles.detailLine}>Horario de atención:</Text>
                          {detalle.horario_atencion
                            .split('\n')
                            .filter((linea) => linea.trim())
                            .map((linea, i) => (
                              <Text key={i} style={[styles.detailLine, styles.detailIndent]}>
                                • {linea}
                              </Text>
                            ))}
                        </View>
                      ) : null}
                      {detalle?.archivo_url ? (
                        <View style={styles.archivoBloque}>
                          <Text style={styles.detailLine}>Información adicional:</Text>
                          <ArchivoCard nombre={detalle.archivo_nombre} url={detalle.archivo_url} />
                        </View>
                      ) : null}
                      {detalle &&
                      !detalle.direccion_principal &&
                      !detalle.telefono_atencion &&
                      !detalle.horario_atencion &&
                      !detalle.archivo_url ? (
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
              <HorarioEditor
                key={idEditando ?? 'nueva'}
                value={form.horario}
                onChange={(t) => setForm((f) => ({ ...f, horario: t }))}
                onErrorChange={setHorarioError}
              />

              {archivoActual ? (
                <View style={styles.archivoModal}>
                  <ArchivoCard
                    nombre={archivoActual.archivo_nombre}
                    url={archivoActual.archivo_url}
                    onQuitar={quitarArchivoActual}
                    quitando={quitandoArchivo}
                  />
                  {archivoNuevo ? (
                    <Text style={styles.uploadHint}>El archivo nuevo reemplazará a este al guardar.</Text>
                  ) : null}
                </View>
              ) : null}



              <Pressable
                style={[styles.uploadBox, archivoNuevo && styles.uploadBoxListo]}
                onPress={elegirArchivo}
                disabled={guardando}
                accessibilityRole="button">
                {archivoNuevo ? (
                  <Ionicons name="checkmark-circle" size={28} color="#2e7d43" />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={26} color="#6b7d70" />
                )}
                <Text style={[styles.uploadText, archivoNuevo && styles.uploadTextListo]} numberOfLines={2}>
                  {archivoNuevo
                    ? archivoNuevo.name
                    : archivoActual
                      ? 'Reemplazar archivo de información adicional'
                      : 'Cargar archivo con información adicional de la sede'}
                </Text>
                <Text style={styles.uploadHint}>
                    {archivoNuevo
                      ? guardando
                        ? 'Subiendo archivo...'
                        : 'Archivo listo: se sube al guardar · toca para cambiarlo'
                      : MENSAJE_ARCHIVO_SEDE}
                </Text>
              </Pressable>

              <Pressable
                  style={[
                    styles.saveButton,
                    exitoGuardado && styles.saveButtonSuccess,
                    guardando && !exitoGuardado && styles.saveButtonDisabled,
                  ]}
                  onPress={guardar}
                  disabled={guardando || exitoGuardado}>
                  {exitoGuardado ? (
                    <View style={styles.saveButtonRow}>
                      <Ionicons name="checkmark-circle" size={20} color={VictoriaColors.white} />
                      <Text style={styles.saveButtonText}>
                        {idEditando === null ? '¡Sede creada!' : '¡Cambios guardados!'}
                      </Text>
                    </View>
                  ) : guardando ? (
                    <View style={styles.saveButtonRow}>
                        <ActivityIndicator color={VictoriaColors.white} size="small" />
                        <Text style={styles.saveButtonText}>
                          {archivoNuevo ? 'Guardando y subiendo archivo...' : 'Guardando...'}
                        </Text>
                    </View>
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {idEditando === null ? 'Crear SEDE' : 'Guardar cambios SEDE'}
                      </Text>
                  )}
              </Pressable>

            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </VictoriaScreenShell>
  );
}