import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useVictoriaToast } from '@/components/victoria/toast';
import { VictoriaColors } from '@/constants/victoria-theme';
import { Coordinacion, obtenerCoordinaciones } from '@/lib/coordinaciones';
import { crearInstructor } from '@/lib/instructores';
import { styles } from './instructor-form-modal.styles';

type Tipo = 'planta' | 'tecnico' | 'transversal';

const TIPOS: { label: string; valor: Tipo }[] = [
  { label: 'De Planta', valor: 'planta' },
  { label: 'Técnico', valor: 'tecnico' },
  { label: 'Transversal', valor: 'transversal' },
];

const PLACEHOLDER = 'rgba(28, 53, 45, 0.6)';

/**
 * Modal "Añadir Instructor". Crea la cuenta con POST /api/usuarios/
 * (lib/instructores.ts::crearInstructor) y la vincula a una Coordinación.
 * Es autónomo: valida, guarda, muestra el toast y avisa con onCreado()
 * para que la pantalla recargue su lista.
 */
export function InstructorFormModal({
  visible,
  onClose,
  onCreado,
}: {
  visible: boolean;
  onClose: () => void;
  onCreado: () => void;
}) {
  const { mostrarExito } = useVictoriaToast();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('CC');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [correoPersonal, setCorreoPersonal] = useState('');
  const [correoSena, setCorreoSena] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [tipo, setTipo] = useState<Tipo>('planta');
  const [idCoordinacion, setIdCoordinacion] = useState<number | null>(null);
  const [coordinaciones, setCoordinaciones] = useState<Coordinacion[]>([]);
  const [foco, setFoco] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargandoCoord, setCargandoCoord] = useState(false);
  const [errorCoord, setErrorCoord] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setCargandoCoord(true);
    setErrorCoord(null);
    obtenerCoordinaciones()
      .then(setCoordinaciones)
      .catch((err) => {
        setCoordinaciones([]);
        setErrorCoord(err instanceof Error ? err.message : 'No se pudieron cargar las coordinaciones.');
      })
      .finally(() => setCargandoCoord(false));
  }, [visible]);

  function cerrar() {
    setNombre('');
    setApellido('');
    setTipoDocumento('CC');
    setNumeroDocumento('');
    setFechaNacimiento('');
    setCorreoPersonal('');
    setCorreoSena('');
    setContrasena('');
    setTipo('planta');
    setIdCoordinacion(null);
    setError(null);
    onClose();
  }

  /** Devuelve el primer problema del formulario, o null si todo está bien. */
  function validar(): string | null {
    const faltan: string[] = [];
    if (!nombre.trim()) faltan.push('nombre');
    if (!numeroDocumento.trim()) faltan.push('número de documento');
    if (!fechaNacimiento.trim()) faltan.push('fecha de nacimiento');
    if (!correoPersonal.trim()) faltan.push('correo personal');
    if (!correoSena.trim()) faltan.push('correo SENA');
    if (!contrasena) faltan.push('contraseña');
    // La coordinación solo se exige si hay alguna para elegir (el backend la acepta vacía).
    if (coordinaciones.length > 0 && !idCoordinacion) faltan.push('coordinación');
    if (faltan.length > 0) return `Falta completar: ${faltan.join(', ')}.`;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento.trim())) {
      return 'La fecha de nacimiento debe tener el formato AAAA-MM-DD (ej. 1990-05-23).';
    }
    const correoOk = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.trim());
    if (!correoOk(correoPersonal)) return 'El correo personal no es válido.';
    if (!correoOk(correoSena)) return 'El correo SENA no es válido (ej. nombre@sena.edu.co).';

    const pw: string[] = [];
    if (contrasena.length < 8) pw.push('mínimo 8 caracteres');
    if (!/[A-Z]/.test(contrasena)) pw.push('una mayúscula');
    if (!/[a-z]/.test(contrasena)) pw.push('una minúscula');
    if (!/[0-9]/.test(contrasena)) pw.push('un número');
    if (!/[^A-Za-z0-9]/.test(contrasena)) pw.push('un carácter especial');
    if (pw.length > 0) return `La contraseña necesita: ${pw.join(', ')}.`;
    return null;
  }

  async function guardar() {
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await crearInstructor({
        nombre: nombre.trim(),
        apellido: apellido.trim() || undefined,
        fecha_nacimiento: fechaNacimiento.trim(),
        numero_documento: numeroDocumento.trim(),
        tipo_documento: tipoDocumento,
        correo_personal: correoPersonal.trim(),
        correo_sena: correoSena.trim(),
        contrasena,
        id_coordinacion: idCoordinacion ?? undefined,
        tipo_instructor: tipo,
      });
      mostrarExito('Instructor creado correctamente.');
      cerrar();
      onCreado();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el instructor.');
    } finally {
      setGuardando(false);
    }
  }

  function campo(
    clave: string,
    valor: string,
    set: (t: string) => void,
    placeholder: string,
    extra: object = {}
  ) {
    return (
      <TextInput
        value={valor}
        onChangeText={set}
        onFocus={() => setFoco(clave)}
        onBlur={() => setFoco(null)}
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER}
        style={[styles.input, foco === clave && styles.inputFocused]}
        {...extra}
      />
    );
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
              <Text style={styles.title}>Añadir Instructor</Text>
              <Text style={styles.subtitle}>Servicio Nacional de Aprendizaje · SENA</Text>
            </View>
            <Pressable onPress={cerrar} hitSlop={10} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>NOMBRE</Text>
            <View style={styles.row}>
              <View style={styles.flex1}>{campo('nombre', nombre, setNombre, 'Nombre')}</View>
              <View style={styles.flex1}>{campo('apellido', apellido, setApellido, 'Apellido')}</View>
            </View>

            <Text style={styles.label}>DOCUMENTO</Text>
            <View style={styles.chipRow}>
              {['CC', 'CE', 'TI', 'PPT'].map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTipoDocumento(t)}
                  style={[styles.chip, tipoDocumento === t && styles.chipActive]}>
                  <Text style={[styles.chipText, tipoDocumento === t && styles.chipTextActive]}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
            {campo('doc', numeroDocumento, setNumeroDocumento, 'Número de documento', {
              keyboardType: 'numeric',
            })}

            <Text style={styles.label}>FECHA DE NACIMIENTO</Text>
            {campo('fecha', fechaNacimiento, setFechaNacimiento, 'AAAA-MM-DD')}

            <Text style={styles.label}>CORREOS</Text>
            {campo('cp', correoPersonal, setCorreoPersonal, 'Correo personal', {
              autoCapitalize: 'none',
              keyboardType: 'email-address',
            })}
            {campo('cs', correoSena, setCorreoSena, 'Correo SENA', {
              autoCapitalize: 'none',
              keyboardType: 'email-address',
              autoComplete: 'off',
            })}

            <Text style={styles.label}>TIPO DE INSTRUCTOR</Text>
            <View style={styles.chipRow}>
              {TIPOS.map((t) => (
                <Pressable
                  key={t.valor}
                  onPress={() => setTipo(t.valor)}
                  style={[styles.chip, tipo === t.valor && styles.chipActive]}>
                  <Ionicons
                    name={tipo === t.valor ? 'checkmark-circle-outline' : 'ellipse-outline'}
                    size={15}
                    color={VictoriaColors.darkGreen}
                  />
                  <Text style={[styles.chipText, tipo === t.valor && styles.chipTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>ASIGNAR A COORDINACIÓN</Text>
            <View style={styles.chipRow}>
              {coordinaciones.map((c) => (
                <Pressable
                  key={c.id_coordinacion}
                  onPress={() => setIdCoordinacion(c.id_coordinacion)}
                  style={[styles.chip, idCoordinacion === c.id_coordinacion && styles.chipActive]}>
                  <Ionicons
                    name={
                      idCoordinacion === c.id_coordinacion
                        ? 'checkmark-circle-outline'
                        : 'ellipse-outline'
                    }
                    size={15}
                    color={VictoriaColors.darkGreen}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      idCoordinacion === c.id_coordinacion && styles.chipTextActive,
                    ]}>
                    {c.nombre_coordinacion}
                  </Text>
                </Pressable>
              ))}
            </View>
            {cargandoCoord ? <ActivityIndicator color={VictoriaColors.darkGreen} /> : null}
            {errorCoord ? <Text style={styles.hint}>{errorCoord}</Text> : null}
            {!cargandoCoord && !errorCoord && coordinaciones.length === 0 ? (
              <Text style={styles.hint}>
                Aún no hay coordinaciones registradas. Puedes crear el instructor sin coordinación y asignarla después.
              </Text>
            ) : null}

            <Text style={styles.label}>CONTRASEÑA INICIAL</Text>
            {campo('pw', contrasena, setContrasena, 'Contraseña temporal', {
              secureTextEntry: true,
              autoCapitalize: 'none',
              autoComplete: 'new-password',
            })}
            <Text style={styles.hint}>
              Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial.
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.submit, guardando && styles.submitDisabled]}
              onPress={guardar}
              disabled={guardando}>
              {guardando ? (
                <ActivityIndicator color={VictoriaColors.white} />
              ) : (
                <Text style={styles.submitText}>Añadir Instructor</Text>
              )}
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}