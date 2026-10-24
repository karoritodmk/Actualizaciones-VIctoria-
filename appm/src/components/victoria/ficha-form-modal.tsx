import { Ionicons } from '@expo/vector-icons';
import { createElement, type ReactNode, useEffect, useState } from 'react';
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
import type { Usuario } from '@/lib/aprendices';
import { crearFicha } from '@/lib/fichas';
import { obtenerInstructores } from '@/lib/instructores';
import { styles } from './ficha-form-modal.styles';

const TRIMESTRES = ['T1', 'T2', 'T3', 'T4'] as const;
type Trimestre = (typeof TRIMESTRES)[number];

/**
 * Horarios que ofrece el desplegable. IMPORTANTE: el backend deduce la jornada
 * (Diurna / Nocturna / Mixta) buscando esa palabra dentro del texto del
 * horario, así que cada opción debe empezar por su jornada. Puedes editar o
 * agregar opciones libremente mientras conserven esa palabra.
 */
const HORARIOS = [
  'Diurna, Lun-Vie 6:00 am - 12:00 pm',
  'Diurna, Lun-Vie 7:00 am - 1:00 pm',
  'Nocturna, Lun-Vie 6:00 pm - 10:00 pm',
  'Mixta, Lun-Vie 12:00 pm - 6:00 pm',
];

type Abierto = 'horario' | 'director' | 'programa' | null;

type Props = {
  visible: boolean;
  onClose: () => void;
  /**
   * Si la pantalla ya está dentro de un programa, pásalo (idPrograma +
   * programaNombre) y el campo queda fijo con candado. Si NO se pasa, el
   * campo "Programa de formación" es un desplegable con `programas`.
   */
  idPrograma?: number;
  programaNombre?: string;
  programas?: { id_programa: number; nombre: string }[];
  /** Se llama cuando la ficha quedó creada, con su número. */
  onCreada: (numeroFicha: number) => void;
};

/** Campo de fecha: calendario nativo del navegador en web; texto AAAA-MM-DD en móvil. */
function CampoFecha({
  valor,
  onChange,
  etiqueta,
}: {
  valor: string;
  onChange: (v: string) => void;
  etiqueta: string;
}) {
  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'date',
      value: valor,
      'aria-label': etiqueta,
      title: etiqueta,
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
      placeholder={`${etiqueta} (AAAA-MM-DD)`}
      placeholderTextColor="#6b7d70"
      style={styles.input}
    />
  );
}

/** Píldora desplegable: al tocarla muestra sus opciones justo debajo. */
function Selector({
  texto,
  placeholder,
  abierto,
  bloqueado,
  onToggle,
  children,
}: {
  texto: string | null;
  placeholder: string;
  abierto: boolean;
  bloqueado?: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Pressable
        style={[styles.select, bloqueado && styles.selectBloqueado]}
        onPress={bloqueado ? undefined : onToggle}
        accessibilityRole="button">
        <Text style={[styles.selectText, !texto && styles.selectPlaceholder]} numberOfLines={1}>
          {texto ?? placeholder}
        </Text>
        <Ionicons
          name={bloqueado ? 'lock-closed-outline' : abierto ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#556b5c"
        />
      </Pressable>
      {abierto && !bloqueado ? <View style={styles.opciones}>{children}</View> : null}
    </View>
  );
}

export function FichaFormModal({
  visible,
  onClose,
  idPrograma,
  programaNombre,
  programas = [],
  onCreada,
}: Props) {
  const programaFijo = idPrograma !== undefined;
  const [numero, setNumero] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [horario, setHorario] = useState<string | null>(null);
  const [trimestre, setTrimestre] = useState<Trimestre | null>(null);
  const [idDirector, setIdDirector] = useState<number | null>(null);
  const [idProgramaSel, setIdProgramaSel] = useState<number | null>(null);
  const [instructores, setInstructores] = useState<Usuario[]>([]);
  const [abierto, setAbierto] = useState<Abierto>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  // Cada vez que se abre: formulario limpio y lista de instructores al día.
  useEffect(() => {
    if (!visible) return;
    setNumero('');
    setInicio('');
    setFin('');
    setHorario(null);
    setTrimestre(null);
    setIdDirector(null);
    setIdProgramaSel(null);
    setAbierto(null);
    setError(null);
    setGuardando(false);
    setExito(false);
    obtenerInstructores()
      .then(setInstructores)
      .catch(() => setInstructores([]));
  }, [visible]);

  const director = instructores.find((i) => i.id_usuario === idDirector);
  const programaElegido = programas.find((p) => p.id_programa === idProgramaSel);
  const idProgramaFinal = programaFijo ? idPrograma : idProgramaSel;

  async function guardar() {
    setError(null);
    const num = numero.trim();
    if (!/^\d{7}$/.test(num)) {
      setError('El número de la ficha debe tener exactamente 7 dígitos.');
      return;
    }
    if (idProgramaFinal === null || idProgramaFinal === undefined) {
      setError('Selecciona el programa de formación.');
      return;
    }
    if (!inicio || !fin) {
      setError('Selecciona la fecha de inicio y la fecha de fin.');
      return;
    }
    if (fin < inicio) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
      return;
    }
    setGuardando(true);
    try {
      await crearFicha({
        id_ficha: Number(num),
        estado: 'activa',
        fecha_inicio: inicio,
        fecha_fin: fin,
        trimestre: trimestre ?? undefined,
        horario: horario ?? undefined,
        id_programa: idProgramaFinal,
        id_director: idDirector ?? undefined,
      } as any); // `horario` existe en el backend; si tu FichaInput aún no lo declara, el cast evita el error de tipos.
      setExito(true); // el botón se pone verde con ✓
      await new Promise((r) => setTimeout(r, 900));
      onClose();
      onCreada(Number(num));
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo crear la ficha.');
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
                <Text style={styles.title}>Añadir Ficha</Text>
                <Text style={styles.subtitle}>Fichas · {programaFijo ? programaNombre : 'SENA'}</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar">
                <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
              value={numero}
              onChangeText={(t) => setNumero(t.replace(/\D/g, '').slice(0, 7))}
              placeholder="Número de la ficha (ej. 3407169)"
              placeholderTextColor="#6b7d70"
              keyboardType="numeric"
              maxLength={7}
              style={styles.input}
            />

            <CampoFecha valor={inicio} onChange={setInicio} etiqueta="Fecha de inicio" />
            <CampoFecha valor={fin} onChange={setFin} etiqueta="Fecha de fin" />

            <Selector
              texto={horario}
              placeholder="Horario"
              abierto={abierto === 'horario'}
              onToggle={() => setAbierto(abierto === 'horario' ? null : 'horario')}>
              <ScrollView nestedScrollEnabled>
                {HORARIOS.map((h) => (
                  <Pressable
                    key={h}
                    style={[styles.opcion, horario === h && styles.opcionActiva]}
                    onPress={() => {
                      setHorario(h);
                      setAbierto(null);
                    }}>
                    <Text style={[styles.opcionText, horario === h && styles.opcionTextActiva]}>{h}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Selector>

            <Text style={styles.etiqueta}>Trimestre:</Text>
            <View style={styles.circulos}>
              {TRIMESTRES.map((t, i) => (
                <Pressable
                  key={t}
                  style={[styles.circulo, trimestre === t && styles.circuloActivo]}
                  onPress={() => setTrimestre(trimestre === t ? null : t)}
                  accessibilityLabel={`Trimestre ${i + 1}`}>
                  <Text style={[styles.circuloText, trimestre === t && styles.circuloTextActivo]}>{i + 1}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.etiqueta}>Programa de formación:</Text>
            {programaFijo ? (
              <Selector
                texto={programaNombre ?? null}
                placeholder="Programa"
                abierto={false}
                bloqueado
                onToggle={() => {}}
              />
            ) : (
              <Selector
                texto={programaElegido?.nombre ?? null}
                placeholder="Seleccionar programa de formación"
                abierto={abierto === 'programa'}
                onToggle={() => setAbierto(abierto === 'programa' ? null : 'programa')}>
                <ScrollView nestedScrollEnabled>
                  {programas.length === 0 ? (
                    <Text style={styles.opcionVacia}>No hay programas registrados.</Text>
                  ) : null}
                  {programas.map((p) => (
                    <Pressable
                      key={p.id_programa}
                      style={[styles.opcion, idProgramaSel === p.id_programa && styles.opcionActiva]}
                      onPress={() => {
                        setIdProgramaSel(p.id_programa);
                        setAbierto(null);
                      }}>
                      <Text
                        style={[styles.opcionText, idProgramaSel === p.id_programa && styles.opcionTextActiva]}>
                        {p.nombre}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </Selector>
            )}

            <Text style={styles.etiqueta}>Director de ficha (opcional):</Text>
            <Selector
              texto={director ? `${director.nombre} ${director.apellido ?? ''}`.trim() : null}
              placeholder="Seleccionar director de ficha"
              abierto={abierto === 'director'}
              onToggle={() => setAbierto(abierto === 'director' ? null : 'director')}>
              <ScrollView nestedScrollEnabled>
                <Pressable
                  style={[styles.opcion, idDirector === null && styles.opcionActiva]}
                  onPress={() => {
                    setIdDirector(null);
                    setAbierto(null);
                  }}>
                  <Text style={styles.opcionText}>Sin director</Text>
                </Pressable>
                {instructores.length === 0 ? <Text style={styles.opcionVacia}>No hay instructores registrados.</Text> : null}
                {instructores.map((i) => (
                  <Pressable
                    key={i.id_usuario}
                    style={[styles.opcion, idDirector === i.id_usuario && styles.opcionActiva]}
                    onPress={() => {
                      setIdDirector(i.id_usuario);
                      setAbierto(null);
                    }}>
                    <Text style={[styles.opcionText, idDirector === i.id_usuario && styles.opcionTextActiva]}>
                      {i.nombre} {i.apellido ?? ''}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Selector>

            <Pressable
              style={[
                styles.submit,
                exito && styles.submitExito,
                guardando && !exito && styles.submitDisabled,
              ]}
              onPress={guardar}
              disabled={guardando || exito}>
              {exito ? (
                <View style={styles.submitRow}>
                  <Ionicons name="checkmark-circle" size={20} color={VictoriaColors.white} />
                  <Text style={styles.submitText}>¡Ficha creada!</Text>
                </View>
              ) : guardando ? (
                <View style={styles.submitRow}>
                  <ActivityIndicator color={VictoriaColors.white} size="small" />
                  <Text style={styles.submitText}>Creando ficha...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Añadir Ficha</Text>
              )}
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}