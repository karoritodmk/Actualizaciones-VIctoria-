import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, TextInput, View } from 'react-native';

import { styles } from '@/components/victoria/instructor-perfil.styles';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { useVictoriaToast } from '@/components/victoria/toast';
import { ExitButton, FloatingActionPill } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import { urlAbsoluta } from '@/lib/documentos';
import {
  actualizarContratoInstructor,
  type ComentarioInstructor,
  enviarComentarioInstructor,
  ESTADOS_CONTRATO,
  type InstructorPerfil,
  obtenerComentariosInstructor,
  obtenerPerfilInstructor,
  TIPOS_CONTRATO,
} from '@/lib/instructor-perfil';
import { useRoleGuard } from '@/lib/role-guard';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "7 de octubre, 2026". El backend guarda la hora en UTC sin zona. */
function formatearFecha(valor: string): string {
  const d = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(valor) ? valor : `${valor}Z`);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} de ${MESES[d.getMonth()]}, ${d.getFullYear()}`;
}

/** Desplegable en línea: la lista de opciones aparece justo debajo del campo. */
function Selector({
  etiqueta,
  valor,
  opciones,
  abierto,
  onToggle,
  onElegir,
}: {
  etiqueta: string;
  valor: string;
  opciones: readonly string[];
  abierto: boolean;
  onToggle: () => void;
  onElegir: (v: string) => void;
}) {
  // Si hay un valor antiguo escrito a mano que no está en la lista, se muestra igual.
  const lista = ['', ...opciones, ...(valor && !opciones.includes(valor) ? [valor] : [])];
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Pressable style={styles.select} onPress={onToggle} accessibilityRole="button">
        <Text style={styles.selectTexto}>{valor || 'Sin asignar'}</Text>
        <Ionicons name={abierto ? 'chevron-up' : 'chevron-down'} size={16} color="#556b5c" />
      </Pressable>
      {abierto ? (
        <View style={styles.opciones}>
          {lista.map((o) => (
            <Pressable
              key={o || 'sin'}
              style={[styles.opcion, valor === o && styles.opcionActiva]}
              onPress={() => onElegir(o)}>
              <Text style={[styles.opcionTexto, valor === o && styles.opcionTextoActiva]}>{o || 'Sin asignar'}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Perfil del instructor visto por el coordinador: datos personales,
 * información contractual (tipo y estado del contrato) y comentarios.
 * Se abre desde "Instructor jefe" de una ficha o desde la pestaña Instructores.
 */
export default function CoordinadorInstructorPerfilScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const { idInstructor, idSede, desde } = useLocalSearchParams<{
    idInstructor: string;
    idSede?: string;
    desde?: string;
  }>();
  const idNum = Number(idInstructor);
  const { mostrarExito, mostrarError } = useVictoriaToast();

  const [instructor, setInstructor] = useState<InstructorPerfil | null>(null);
  const [comentarios, setComentarios] = useState<ComentarioInstructor[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Contrato
  const [tipo, setTipo] = useState('');
  const [estado, setEstado] = useState('');
  const [abierto, setAbierto] = useState<'tipo' | 'estado' | null>(null);
  const [guardandoContrato, setGuardandoContrato] = useState(false);
  const [exitoContrato, setExitoContrato] = useState(false);
  const [errorContrato, setErrorContrato] = useState<string | null>(null);

  // Comentarios
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [exitoComentario, setExitoComentario] = useState(false);
  const [errorComentario, setErrorComentario] = useState<string | null>(null);

  const cargar = useCallback(() => {
    if (!perfil) return;
    if (!idNum || Number.isNaN(idNum)) {
      setError('No se especificó un instructor válido.');
      return;
    }
    setError(null);
    obtenerPerfilInstructor(idNum)
      .then((p) => {
        setInstructor(p);
        setTipo(p.tipo_contrato ?? '');
        setEstado(p.estado_contrato ?? '');
      })
      .catch((err: any) => setError(err?.message ?? 'No se pudo cargar el instructor.'));
    obtenerComentariosInstructor(idNum)
      .then(setComentarios)
      .catch(() => setComentarios([]));
  }, [perfil, idNum]);

  useFocusEffect(cargar);

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  const [backHref, backTexto] =
    desde === 'fichas'
      ? ['/victoria/coordinador/fichas', 'Fichas']
      : idSede
        ? [`/victoria/coordinador/sedes/${idSede}/instructores`, 'Instructores de la sede']
        : ['/victoria/coordinador/instructores', 'Instructores TODOS'];

  const cambioTipo = (instructor?.tipo_contrato ?? '') !== tipo;
  const cambioEstado = (instructor?.estado_contrato ?? '') !== estado;
  const hayCambios = cambioTipo || cambioEstado;

  async function actualizarContrato() {
    if (!instructor || !hayCambios) return;
    setErrorContrato(null);
    setGuardandoContrato(true);
    try {
      // Solo viaja lo que cambió, para no tocar el otro campo.
      const cambios: { tipo_contrato?: string | null; estado_contrato?: string | null } = {};
      if (cambioTipo) cambios.tipo_contrato = tipo || null;
      if (cambioEstado) cambios.estado_contrato = estado || null;
      const actualizado = await actualizarContratoInstructor(idNum, cambios);
      setInstructor(actualizado);
      setTipo(actualizado.tipo_contrato ?? '');
      setEstado(actualizado.estado_contrato ?? '');
      setAbierto(null);
      setExitoContrato(true);
      mostrarExito(`Contrato de ${actualizado.nombre_completo} actualizado con éxito`);
      setTimeout(() => setExitoContrato(false), 1800);
    } catch (err: any) {
      const mensaje = err?.message ?? 'No se pudo actualizar el contrato.';
      setErrorContrato(mensaje);
      mostrarError(mensaje);
    } finally {
      setGuardandoContrato(false);
    }
  }

  async function enviarComentario() {
    const limpio = texto.trim();
    if (!limpio) {
      setErrorComentario('Escribe un comentario antes de enviarlo.');
      return;
    }
    setErrorComentario(null);
    setEnviando(true);
    try {
      const nuevo = await enviarComentarioInstructor(idNum, limpio);
      setComentarios((prev) => [nuevo, ...(prev ?? [])]);
      setTexto('');
      setExitoComentario(true);
      mostrarExito('Comentario enviado');
      setTimeout(() => setExitoComentario(false), 1800);
    } catch (err: any) {
      const mensaje = err?.message ?? 'No se pudo enviar el comentario.';
      setErrorComentario(mensaje);
      mostrarError(mensaje);
    } finally {
      setEnviando(false);
    }
  }

  const total = comentarios?.length ?? 0;

  return (
    <VictoriaScreenShell>
      <Pressable onPress={() => router.push(backHref as never)} accessibilityRole="link">
        <Text style={styles.volver}>← Volver a {backTexto}</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!instructor && !error ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}

      {instructor ? (
        <View style={styles.layout}>
          <View style={styles.main}>
            {/* ---------- Perfil ---------- */}
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Ionicons name="layers-outline" size={18} color={VictoriaColors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombre}>{instructor.nombre_completo}</Text>
                  <Text style={styles.subLinea}>Perfil del instructor</Text>
                </View>
              </View>

              <Text style={styles.seccion}>DATOS PERSONALES</Text>
              <View style={styles.dato}>
                <Ionicons name="mail-outline" size={18} color="#556b5c" />
                <Text style={styles.datoEtiqueta}>Correo:</Text>
                <Text
                  style={[styles.datoValor, styles.datoLink]}
                  onPress={() => Linking.openURL(`mailto:${instructor.correo_sena}`)}>
                  {instructor.correo_sena}
                </Text>
              </View>
              <View style={styles.dato}>
                <Ionicons name="call-outline" size={18} color="#556b5c" />
                <Text style={styles.datoEtiqueta}>Teléfono:</Text>
                <Text style={styles.datoValor}>{instructor.telefono || 'No registrado'}</Text>
              </View>
              <View style={styles.dato}>
                <Ionicons name="ribbon-outline" size={18} color="#556b5c" />
                <Text style={styles.datoEtiqueta}>Especialidad:</Text>
                <Text style={styles.datoValor}>{instructor.especialidad || 'No registrada'}</Text>
              </View>
              {instructor.hoja_vida_url ? (
                <View style={styles.dato}>
                  <Ionicons name="document-text-outline" size={18} color="#556b5c" />
                  <Text style={styles.datoEtiqueta}>Hoja de vida:</Text>
                  <View style={styles.hojaVida}>
                    <Pressable
                      style={styles.chipLink}
                      onPress={() => Linking.openURL(urlAbsoluta(instructor.hoja_vida_url as string))}>
                      <Ionicons name="eye-outline" size={13} color={VictoriaColors.white} />
                      <Text style={styles.chipLinkTexto}>Ver</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}

              <View style={styles.divider} />

              <Text style={styles.seccion}>INFORMACION CONTRACTUAL</Text>
              <Selector
                etiqueta="Tipo de contrato"
                valor={tipo}
                opciones={TIPOS_CONTRATO}
                abierto={abierto === 'tipo'}
                onToggle={() => setAbierto(abierto === 'tipo' ? null : 'tipo')}
                onElegir={(v) => {
                  setTipo(v);
                  setAbierto(null);
                }}
              />
              <Selector
                etiqueta="Estado del contrato"
                valor={estado}
                opciones={ESTADOS_CONTRATO}
                abierto={abierto === 'estado'}
                onToggle={() => setAbierto(abierto === 'estado' ? null : 'estado')}
                onElegir={(v) => {
                  setEstado(v);
                  setAbierto(null);
                }}
              />
              {errorContrato ? <Text style={styles.errorForm}>{errorContrato}</Text> : null}
              <Pressable
                style={[
                  styles.boton,
                  exitoContrato && styles.botonExito,
                  (!hayCambios || guardandoContrato) && !exitoContrato && styles.botonDeshabilitado,
                ]}
                onPress={actualizarContrato}
                disabled={!hayCambios || guardandoContrato}>
                {exitoContrato ? (
                  <View style={styles.botonFila}>
                    <Ionicons name="checkmark-circle" size={18} color={VictoriaColors.white} />
                    <Text style={styles.botonTexto}>¡Contrato actualizado!</Text>
                  </View>
                ) : guardandoContrato ? (
                  <View style={styles.botonFila}>
                    <ActivityIndicator color={VictoriaColors.white} size="small" />
                    <Text style={styles.botonTexto}>Actualizando...</Text>
                  </View>
                ) : (
                  <View style={styles.botonFila}>
                    <Ionicons name="document-text-outline" size={16} color={VictoriaColors.white} />
                    <Text style={styles.botonTexto}>Actualizar estado</Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* ---------- Comentarios ---------- */}
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Ionicons name="chatbox-outline" size={16} color={VictoriaColors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.comentTitulo}>Comentarios</Text>
                  <Text style={styles.subLinea}>
                    {comentarios ? `${total} comentario${total === 1 ? '' : 's'}` : 'Cargando...'}
                  </Text>
                </View>
              </View>

              <TextInput
                value={texto}
                onChangeText={setTexto}
                placeholder="Escribe un comentario para el instructor"
                placeholderTextColor="#6b7d70"
                multiline
                maxLength={1000}
                style={styles.comentInput}
              />
              <Text style={styles.contador}>{texto.length}/1000</Text>
              {errorComentario ? <Text style={styles.errorForm}>{errorComentario}</Text> : null}
              <Pressable
                style={[
                  styles.boton,
                  exitoComentario && styles.botonExito,
                  enviando && !exitoComentario && styles.botonDeshabilitado,
                ]}
                onPress={enviarComentario}
                disabled={enviando}>
                {exitoComentario ? (
                  <View style={styles.botonFila}>
                    <Ionicons name="checkmark-circle" size={18} color={VictoriaColors.white} />
                    <Text style={styles.botonTexto}>¡Comentario enviado!</Text>
                  </View>
                ) : enviando ? (
                  <View style={styles.botonFila}>
                    <ActivityIndicator color={VictoriaColors.white} size="small" />
                    <Text style={styles.botonTexto}>Enviando...</Text>
                  </View>
                ) : (
                  <View style={styles.botonFila}>
                    <Ionicons name="paper-plane-outline" size={16} color={VictoriaColors.white} />
                    <Text style={styles.botonTexto}>Enviar comentario</Text>
                  </View>
                )}
              </Pressable>

              {comentarios && comentarios.length === 0 ? (
                <Text style={styles.sinComentarios}>Todavía no hay comentarios sobre este instructor.</Text>
              ) : null}
              {(comentarios ?? []).map((c) => (
                <View key={c.id_comentario} style={styles.comentario}>
                  <View style={styles.comentCabecera}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarTexto}>{(c.nombre_autor.trim()[0] ?? '?').toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.comentAutor}>{c.nombre_autor}</Text>
                      <Text style={styles.comentFecha}>{formatearFecha(c.fecha_creacion)}</Text>
                    </View>
                  </View>
                  <Text style={styles.comentTexto}>{c.texto}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.side}>
            {instructor.tipo_instructor === 'transversal' ? (
              // Los transversales no manejan portafolio: el botón queda apagado.
              <FloatingActionPill label="Portafolio no disponible" disabled />
            ) : (
              <FloatingActionPill
                label="Ir a Portafolio"
                href={`/victoria/coordinador/instructores/${idNum}/portafolio`}
              />
            )}
          </View>
        </View>
      ) : null}

      <ExitButton />
    </VictoriaScreenShell>
  );
}