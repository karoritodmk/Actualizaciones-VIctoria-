import { Ionicons } from '@expo/vector-icons';
import { createElement, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { VictoriaColors } from '@/constants/victoria-theme';
import { type AprendizManualInput, crearAprendizManual } from '@/lib/aprendices';
import { styles } from './aprendiz-modales.styles';

const TIPOS_DOCUMENTO = ['CC', 'TI', 'CE', 'PPT', 'PEP'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Misma contraseña temporal que genera el backend en la carga por archivo. */
function passwordTemporal(documento: string): string {
  let clave = `Sena@${documento}`;
  if (!/\d/.test(clave)) clave += '1';
  return clave.padEnd(8, '0');
}

/** Mismas reglas que schemas/usuario.py::validar_password_segura. */
function problemaDePassword(clave: string): string | null {
  const faltas: string[] = [];
  if (clave.length < 8) faltas.push('mínimo 8 caracteres');
  if (!/[A-Z]/.test(clave)) faltas.push('una mayúscula');
  if (!/[a-z]/.test(clave)) faltas.push('una minúscula');
  if (!/[0-9]/.test(clave)) faltas.push('un número');
  if (!/[^A-Za-z0-9]/.test(clave)) faltas.push('un carácter especial');
  return faltas.length ? `La contraseña necesita: ${faltas.join(', ')}.` : null;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  idFicha: number;
  programaNombre?: string;
  onCreado: (nombreCompleto: string) => void;
};

/** Fecha: calendario del navegador en web; texto AAAA-MM-DD en móvil. */
function CampoFecha({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'date',
      value: valor,
      'aria-label': 'Fecha de nacimiento',
      title: 'Fecha de nacimiento',
      max: new Date().toISOString().slice(0, 10),
      onChange: (e: any) => onChange(e.target.value),
      style: {
        width: '100%',
        boxSizing: 'border-box',
        background: 'rgba(255, 255, 255, 0.55)',
        border: '1px solid rgba(28, 53, 45, 0.15)',
        borderRadius: 50,
        padding: '14px 22px',
        fontSize: 15,
        fontFamily: 'inherit',
        color: valor ? '#1c352d' : '#6b7d70',
        outline: 'none',
      },
    });
  }
  return (
    <TextInput
      value={valor}
      onChangeText={onChange}
      placeholder="Fecha de nacimiento (AAAA-MM-DD)"
      placeholderTextColor="#6b7d70"
      style={styles.input}
    />
  );
}

/**
 * "Añadir Aprendiz" manual. Pide exactamente lo que exige la tabla `usuario`
 * para un aprendiz: nombre, tipo y número de documento, fecha de nacimiento,
 * correo personal, correo SENA y contraseña (más apellido, teléfono e
 * información principal, que son opcionales). El rol y la ficha los fija el
 * código, no la persona.
 */
export function AprendizFormModal({ visible, onClose, idFicha, programaNombre, onCreado }: Props) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [tipoDoc, setTipoDoc] = useState('CC');
  const [numeroDoc, setNumeroDoc] = useState('');
  const [nacimiento, setNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correoPersonal, setCorreoPersonal] = useState('');
  const [correoSena, setCorreoSena] = useState('');
  const [usarTemporal, setUsarTemporal] = useState(true);
  const [clave, setClave] = useState('');
  const [informacion, setInformacion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setNombre('');
    setApellido('');
    setTipoDoc('CC');
    setNumeroDoc('');
    setNacimiento('');
    setTelefono('');
    setCorreoPersonal('');
    setCorreoSena('');
    setUsarTemporal(true);
    setClave('');
    setInformacion('');
    setError(null);
    setGuardando(false);
    setExito(false);
  }, [visible]);

  async function guardar() {
    setError(null);
    const doc = numeroDoc.trim();
    if (!nombre.trim()) return setError('El nombre es obligatorio.');
    if (!/^[A-Za-z0-9]{4,20}$/.test(doc))
      return setError('El número de documento debe tener entre 4 y 20 letras o números.');
    if (!nacimiento) return setError('La fecha de nacimiento es obligatoria.');
    if (nacimiento > new Date().toISOString().slice(0, 10))
      return setError('La fecha de nacimiento no puede ser futura.');
    if (telefono.trim() && !/^[0-9+\-\s()]{6,20}$/.test(telefono.trim()))
      return setError('El teléfono solo puede tener números, espacios, + y guiones (6 a 20).');
    if (!EMAIL.test(correoPersonal.trim())) return setError('El correo personal no es válido.');
    if (!EMAIL.test(correoSena.trim())) return setError('El correo SENA no es válido.');
    if (correoPersonal.trim().toLowerCase() === correoSena.trim().toLowerCase())
      return setError('El correo personal y el correo SENA deben ser distintos.');
    if (!usarTemporal) {
      const problema = problemaDePassword(clave);
      if (problema) return setError(problema);
    }

    const datos: AprendizManualInput & { informacion_adicional?: string } = {
      nombre: nombre.trim(),
      apellido: apellido.trim() || undefined,
      fecha_nacimiento: nacimiento,
      numero_documento: doc,
      tipo_documento: tipoDoc,
      telefono: telefono.trim() || undefined,
      correo_personal: correoPersonal.trim(),
      correo_sena: correoSena.trim(),
      contrasena: usarTemporal ? passwordTemporal(doc) : clave,
      id_ficha: idFicha,
      informacion_adicional: informacion.trim() || undefined,
    };

    setGuardando(true);
    try {
      await crearAprendizManual(datos);
      setExito(true); // botón verde con ✓
      await new Promise((r) => setTimeout(r, 900));
      onClose();
      onCreado(`${nombre.trim()} ${apellido.trim()}`.trim());
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo crear el aprendiz.');
    } finally {
      setGuardando(false);
    }
  }

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
                <Text style={styles.title}>Añadir Aprendiz</Text>
                <Text style={styles.subtitle}>
                  Fichas · Ficha {idFicha}
                  {programaNombre ? ` · ${programaNombre}` : ''}
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar">
                <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.fila}>
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombres *"
                placeholderTextColor="#6b7d70"
                maxLength={100}
                style={[styles.input, styles.mitad]}
              />
              <TextInput
                value={apellido}
                onChangeText={setApellido}
                placeholder="Apellidos"
                placeholderTextColor="#6b7d70"
                maxLength={100}
                style={[styles.input, styles.mitad]}
              />
            </View>

            <Text style={styles.etiqueta}>Tipo de documento *</Text>
            <View style={styles.chips}>
              {TIPOS_DOCUMENTO.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.chip, tipoDoc === t && styles.chipActivo]}
                  onPress={() => setTipoDoc(t)}>
                  <Text style={[styles.chipText, tipoDoc === t && styles.chipTextActivo]}>{t}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={numeroDoc}
              onChangeText={(t) => setNumeroDoc(t.replace(/[^A-Za-z0-9]/g, '').slice(0, 20))}
              placeholder="Número de documento *"
              placeholderTextColor="#6b7d70"
              style={styles.input}
            />

            <Text style={styles.etiqueta}>Fecha de nacimiento *</Text>
            <CampoFecha valor={nacimiento} onChange={setNacimiento} />

            <TextInput
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Teléfono (opcional)"
              placeholderTextColor="#6b7d70"
              keyboardType="phone-pad"
              maxLength={20}
              style={styles.input}
            />
            <TextInput
              value={correoPersonal}
              onChangeText={setCorreoPersonal}
              placeholder="Correo personal *"
              placeholderTextColor="#6b7d70"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              value={correoSena}
              onChangeText={setCorreoSena}
              placeholder="Correo SENA *"
              placeholderTextColor="#6b7d70"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Pressable style={styles.checkFila} onPress={() => setUsarTemporal(!usarTemporal)} accessibilityRole="checkbox">
              <Ionicons
                name={usarTemporal ? 'checkbox' : 'square-outline'}
                size={20}
                color={usarTemporal ? VictoriaColors.darkGreen : '#6b7d70'}
              />
              <Text style={styles.checkTexto}>
                Usar contraseña temporal: «Sena@» + número de documento. El aprendiz debe cambiarla al
                ingresar.
              </Text>
            </Pressable>
            {!usarTemporal ? (
              <>
                <TextInput
                  value={clave}
                  onChangeText={setClave}
                  placeholder="Contraseña *"
                  placeholderTextColor="#6b7d70"
                  secureTextEntry
                  autoCapitalize="none"
                  style={styles.input}
                />
                <Text style={styles.ayuda}>
                  Mínimo 8 caracteres, con mayúscula, minúscula, número y un carácter especial.
                </Text>
              </>
            ) : null}

            <TextInput
              value={informacion}
              onChangeText={setInformacion}
              placeholder="Información principal del aprendiz (opcional)"
              placeholderTextColor="#6b7d70"
              multiline
              maxLength={500}
              style={styles.area}
            />

            <Pressable
              style={[styles.submit, exito && styles.submitExito, guardando && !exito && styles.submitDisabled]}
              onPress={guardar}
              disabled={guardando || exito}>
              {exito ? (
                <View style={styles.submitRow}>
                  <Ionicons name="checkmark-circle" size={20} color={VictoriaColors.white} />
                  <Text style={styles.submitText}>¡Aprendiz añadido!</Text>
                </View>
              ) : guardando ? (
                <View style={styles.submitRow}>
                  <ActivityIndicator color={VictoriaColors.white} size="small" />
                  <Text style={styles.submitText}>Guardando aprendiz...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Añadir Aprendiz</Text>
              )}
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}