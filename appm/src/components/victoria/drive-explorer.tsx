import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { useVictoriaToast } from '@/components/victoria/toast';
import { VictoriaColors } from '@/constants/victoria-theme';
import { abrirDocumento, formatearTamano } from '@/lib/documentos';
import {
  crearCarpetaPortafolio,
  elegirArchivoPortafolio,
  eliminarNodoPortafolio,
  ExploradorPortafolio,
  NodoPortafolio,
  obtenerExplorador,
  subirArchivoPortafolio,
} from '@/lib/portafolio-instructor';
import { styles } from './drive-explorer.styles';

type Orden = 'nombre' | 'fecha' | 'por';

function fechaCorta(iso: string): string {
  const f = new Date(iso);
  if (Number.isNaN(f.getTime())) return '';
  return f.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
}

/**
 * Explorador de portafolio "tipo Drive" (vistas del diseño: Portafolio -
 * <instructor> > carpeta > subcarpeta ...). Una sola pantalla sirve para
 * cualquier nivel: la carpeta abierta viene en `idCarpeta` y, al tocar una
 * carpeta, se navega a la misma ruta con ?carpeta=<id>. En TODOS los
 * niveles se puede crear una carpeta o subir un archivo.
 *
 * `baseHref` es la ruta de la pantalla que lo usa (sin query); `puedeEditar`
 * oculta los botones de crear/subir/borrar si hiciera falta una vista de
 * solo lectura.
 */
export function DriveExplorer({
  idInstructor,
  idCarpeta,
  baseHref,
  puedeEditar = true,
}: {
  idInstructor: number;
  idCarpeta?: number | null;
  baseHref: string;
  puedeEditar?: boolean;
}) {
  const router = useRouter();
  const { mostrarExito, mostrarError } = useVictoriaToast();

  const [datos, setDatos] = useState<ExploradorPortafolio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orden, setOrden] = useState<Orden>('nombre');
  const [asc, setAsc] = useState(true);
  const [ocupado, setOcupado] = useState(false);

  const [modalCarpeta, setModalCarpeta] = useState(false);
  const [nombreCarpeta, setNombreCarpeta] = useState('');
  const [errorCarpeta, setErrorCarpeta] = useState<string | null>(null);
  const [aBorrar, setABorrar] = useState<NodoPortafolio | null>(null);

  const cargar = useCallback(() => {
    setError(null);
    return obtenerExplorador(idInstructor, idCarpeta)
      .then(setDatos)
      .catch((e: Error) => setError(e.message));
  }, [idInstructor, idCarpeta]);

  // Al entrar a otra carpeta se muestra el cargando en vez de la lista anterior.
  useEffect(() => {
    setDatos(null);
  }, [idInstructor, idCarpeta]);

  // Carga al abrir, al cambiar de carpeta y al volver a enfocar la pantalla.
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const items = useMemo(() => {
    const lista = [...(datos?.items ?? [])];
    lista.sort((a, b) => {
      // Carpetas siempre primero, como en un Drive.
      if (a.tipo !== b.tipo) return a.tipo === 'carpeta' ? -1 : 1;
      let c = 0;
      if (orden === 'nombre') c = a.nombre.localeCompare(b.nombre, 'es');
      if (orden === 'fecha') c = a.fecha_modificacion.localeCompare(b.fecha_modificacion);
      if (orden === 'por') c = (a.modificado_por ?? '').localeCompare(b.modificado_por ?? '', 'es');
      return asc ? c : -c;
    });
    return lista;
  }, [datos, orden, asc]);

  function ordenarPor(o: Orden) {
    if (o === orden) setAsc(!asc);
    else {
      setOrden(o);
      setAsc(true);
    }
  }

  function abrir(n: NodoPortafolio) {
    if (n.tipo === 'carpeta') router.push(`${baseHref}?carpeta=${n.id_nodo}` as never);
    else abrirDocumento(n.archivo_url);
  }

  function irA(idNodo: number | null) {
    router.push((idNodo ? `${baseHref}?carpeta=${idNodo}` : baseHref) as never);
  }

  async function crearCarpeta() {
    const nombre = nombreCarpeta.trim();
    if (!nombre) {
      setErrorCarpeta('Escribe un nombre para la carpeta.');
      return;
    }
    setOcupado(true);
    setErrorCarpeta(null);
    try {
      await crearCarpetaPortafolio(idInstructor, nombre, idCarpeta);
      setModalCarpeta(false);
      setNombreCarpeta('');
      mostrarExito('Carpeta creada.');
      await cargar();
    } catch (e) {
      setErrorCarpeta(e instanceof Error ? e.message : 'No se pudo crear la carpeta.');
    } finally {
      setOcupado(false);
    }
  }

  async function subirArchivo() {
    try {
      const asset = await elegirArchivoPortafolio();
      if (!asset) return;
      setOcupado(true);
      await subirArchivoPortafolio(idInstructor, asset, idCarpeta);
      mostrarExito('Archivo subido.');
      await cargar();
    } catch (e) {
      mostrarError(e instanceof Error ? e.message : 'No se pudo subir el archivo.');
    } finally {
      setOcupado(false);
    }
  }

  async function borrar() {
    if (!aBorrar) return;
    setOcupado(true);
    try {
      await eliminarNodoPortafolio(aBorrar.id_nodo);
      setABorrar(null);
      mostrarExito(aBorrar.tipo === 'carpeta' ? 'Carpeta eliminada.' : 'Archivo eliminado.');
      await cargar();
    } catch (e) {
      setABorrar(null);
      mostrarError(e instanceof Error ? e.message : 'No se pudo eliminar.');
    } finally {
      setOcupado(false);
    }
  }

  const nombreInstructor = datos?.nombre_instructor ?? '';
  const raiz = `Portafolio - ${nombreInstructor}`;

  function th(o: Orden, label: string) {
    return (
      <Pressable style={styles.thBtn} onPress={() => ordenarPor(o)}>
        <Text style={styles.thText}>{label}</Text>
        <Ionicons
          name={orden === o && !asc ? 'chevron-up' : 'chevron-down'}
          size={11}
          color={VictoriaColors.textOnLight}
        />
      </Pressable>
    );
  }

  return (
    <View>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Portafolio {new Date().getFullYear()}</Text>
          <Text style={styles.title}>{`Portafolio  - ${nombreInstructor}`}</Text>
        </View>
        {puedeEditar ? (
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionBtn, ocupado && styles.actionDisabled]}
              disabled={ocupado}
              onPress={() => {
                setErrorCarpeta(null);
                setNombreCarpeta('');
                setModalCarpeta(true);
              }}>
              <Ionicons name="folder-open-outline" size={15} color={VictoriaColors.white} />
              <Text style={styles.actionText}>Nueva carpeta</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, ocupado && styles.actionDisabled]}
              disabled={ocupado}
              onPress={subirArchivo}>
              <Ionicons name="cloud-upload-outline" size={15} color={VictoriaColors.white} />
              <Text style={styles.actionText}>Subir archivo</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.crumbs}>
        <Pressable onPress={() => irA(null)} disabled={!datos?.ruta.length}>
          <Text style={[styles.crumb, !datos?.ruta.length && styles.crumbActive]}>{raiz}</Text>
        </Pressable>
        {datos?.ruta.map((m, i) => {
          const ultimo = i === datos.ruta.length - 1;
          return (
            <View key={m.id_nodo} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="chevron-forward" size={11} color={VictoriaColors.white} />
              <Pressable onPress={() => irA(m.id_nodo)} disabled={ultimo}>
                <Text style={[styles.crumb, ultimo && styles.crumbActive]}>{m.nombre}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {error ? <Text style={styles.aviso}>{error}</Text> : null}

      <View style={styles.table}>
        <View style={[styles.tr, styles.th]}>
          <View style={styles.cellNombre}>
            <Ionicons name="folder-outline" size={18} color={VictoriaColors.textOnLight} />
            {th('nombre', 'Nombre')}
          </View>
          <View style={styles.cellFecha}>
            {th('fecha', 'Modificado')}
          </View>
          <View style={styles.cellPor}>
            {th('por', 'Modificado Por')}
          </View>
          <View style={styles.cellArch}>
            <Text style={styles.thText}>Archivos</Text>
          </View>
          {puedeEditar ? <View style={styles.cellDel} /> : null}
        </View>

        {!datos && !error ? (
          <ActivityIndicator color={VictoriaColors.darkGreen} style={styles.loader} />
        ) : null}
        {datos && items.length === 0 ? (
          <Text style={styles.vacio}>
            Esta carpeta está vacía.{puedeEditar ? ' Crea una carpeta o sube un archivo.' : ''}
          </Text>
        ) : null}

        {items.map((n) => (
          <Pressable key={n.id_nodo} style={styles.tr} onPress={() => abrir(n)}>
            <View style={styles.cellNombre}>
              <View style={styles.icono}>
                <Ionicons
                  name={n.tipo === 'carpeta' ? 'folder-outline' : 'document-outline'}
                  size={16}
                  color={VictoriaColors.white}
                />
              </View>
              <Text style={styles.nombre} numberOfLines={1}>
                {n.nombre}
              </Text>
            </View>
            <View style={styles.cellFecha}>
              <Text style={styles.celda}>{fechaCorta(n.fecha_modificacion)}</Text>
            </View>
            <View style={styles.cellPor}>
              <Text style={styles.celda}>{n.modificado_por ?? ''}</Text>
            </View>
            <View style={styles.cellArch}>
              <Text style={styles.celda}>
                {n.tipo === 'carpeta'
                  ? n.total_archivos > 0
                    ? `${n.total_archivos} docs`
                    : ''
                  : formatearTamano(n.tamano_bytes)}
              </Text>
            </View>
            {puedeEditar ? (
              <View style={styles.cellDel}>
                <Pressable hitSlop={8} onPress={() => setABorrar(n)} accessibilityLabel="Eliminar">
                  <Ionicons name="trash-outline" size={15} color="#7a3b3b" />
                </Pressable>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>

      {/* Nueva carpeta */}
      <Modal visible={modalCarpeta} transparent animationType="fade" onRequestClose={() => setModalCarpeta(false)}>
        <Pressable style={styles.backdrop} onPress={() => setModalCarpeta(false)}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Nueva carpeta</Text>
            {errorCarpeta ? <Text style={styles.modalError}>{errorCarpeta}</Text> : null}
            <TextInput
              value={nombreCarpeta}
              onChangeText={setNombreCarpeta}
              placeholder="Nombre de la carpeta"
              placeholderTextColor="rgba(28, 53, 45, 0.6)"
              style={styles.input}
              autoFocus
              maxLength={100}
              onSubmitEditing={crearCarpeta}
            />
            <View style={styles.modalRow}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => setModalCarpeta(false)}>
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, ocupado && styles.actionDisabled]} disabled={ocupado} onPress={crearCarpeta}>
                {ocupado ? (
                  <ActivityIndicator color={VictoriaColors.white} />
                ) : (
                  <Text style={styles.btnText}>Crear</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirmar borrado */}
      <Modal visible={!!aBorrar} transparent animationType="fade" onRequestClose={() => setABorrar(null)}>
        <Pressable style={styles.backdrop} onPress={() => setABorrar(null)}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {aBorrar?.tipo === 'carpeta' ? 'Eliminar carpeta' : 'Eliminar archivo'}
            </Text>
            <Text style={styles.modalText}>
              {aBorrar?.tipo === 'carpeta'
                ? `Se eliminará "${aBorrar?.nombre}" con todo lo que contiene.`
                : `Se eliminará "${aBorrar?.nombre}".`}{' '}
              Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalRow}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => setABorrar(null)}>
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnDanger]} disabled={ocupado} onPress={borrar}>
                <Text style={styles.btnText}>Eliminar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}