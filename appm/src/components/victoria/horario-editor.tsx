import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import {
  DIAS,
  DIAS_CORTOS,
  Franja,
  franjaNueva,
  franjasATexto,
  normalizarHora,
  textoAFranjas,
  validarFranjas,
} from '@/lib/horario';
import { styles } from './horario-editor.styles';

/**
 * Editor del horario de atención de una sede: varias franjas, cada una con
 * sus días (L-V, fines de semana, un solo día...) y su hora de apertura y
 * cierre, o "Cerrado". Emite el horario como texto (ver lib/horario.ts) y el
 * mensaje de error (o null) para que la pantalla bloquee el guardado.
 *
 * Si la sede trae un horario viejo en texto libre que no se puede leer por
 * franjas, se muestra en modo "texto libre" para no perderlo.
 */
export function HorarioEditor({
  value,
  onChange,
  onErrorChange,
}: {
  value: string;
  onChange: (texto: string) => void;
  onErrorChange?: (error: string | null) => void;
}) {
  // El valor inicial solo se interpreta una vez: después manda lo que el usuario edita.
  const inicial = useRef(textoAFranjas(value)).current;
  const [modo, setModo] = useState<'franjas' | 'libre'>(inicial === null ? 'libre' : 'franjas');
  const [franjas, setFranjas] = useState<Franja[]>(inicial ?? []);

  const error = modo === 'franjas' ? validarFranjas(franjas) : null;
  useEffect(() => onErrorChange?.(error), [error, onErrorChange]);

  function actualizar(siguientes: Franja[]) {
    setFranjas(siguientes);
    onChange(franjasATexto(siguientes));
  }
  const cambiar = (n: number, parche: Partial<Franja>) =>
    actualizar(franjas.map((f, i) => (i === n ? { ...f, ...parche } : f)));
  const alternarDia = (n: number, d: number) =>
    cambiar(n, { dias: franjas[n].dias.map((on, i) => (i === d ? !on : on)) });

  const hayLunVie = franjas.some((f) => f.dias.slice(0, 5).every(Boolean));
  const hayFinde = franjas.some((f) => f.dias[5] && f.dias[6]);

  if (modo === 'libre') {
    return (
      <View style={styles.wrap}>
        <View style={styles.headerRow}>
          <Text style={styles.titulo}>Horario de atención</Text>
          <Pressable
            onPress={() => {
              setFranjas([]);
              onChange('');
              setModo('franjas');
            }}>
            <Text style={styles.modoLink}>Usar horario por días</Text>
          </Pressable>
        </View>
        <TextInput
          value={value}
          onChangeText={onChange}
          multiline
          placeholder="Ej.: Lunes a viernes de 7 a. m. a 5 p. m."
          placeholderTextColor="#6b7d70"
          style={styles.libre}
        />
        <Text style={styles.ayuda}>
          Este horario está en texto libre. Al cambiar a “horario por días” se reemplaza.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.titulo}>Horario de atención</Text>
        <Pressable onPress={() => setModo('libre')}>
          <Text style={styles.modoLink}>Escribir como texto</Text>
        </Pressable>
      </View>

      {franjas.length === 0 ? (
        <Text style={styles.ayuda}>
          Sin horario. Añade una franja, por ejemplo “Lunes a viernes” y otra para los fines de semana.
        </Text>
      ) : null}

      {franjas.map((f, n) => (
        <View key={n} style={styles.franja}>
          <View style={styles.dias}>
            {DIAS_CORTOS.map((corto, d) => (
              <Pressable
                key={corto}
                onPress={() => alternarDia(n, d)}
                accessibilityRole="button"
                accessibilityLabel={DIAS[d]}
                accessibilityState={{ selected: f.dias[d] }}
                style={[styles.dia, f.dias[d] && styles.diaOn]}>
                <Text style={[styles.diaTexto, f.dias[d] && styles.diaTextoOn]}>{corto}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.horas}>
            <TextInput
              value={f.abre}
              onChangeText={(t) => cambiar(n, { abre: t })}
              onBlur={() => cambiar(n, { abre: normalizarHora(f.abre) })}
              editable={!f.cerrado}
              maxLength={5}
              placeholder="07:00"
              placeholderTextColor="#6b7d70"
              accessibilityLabel="Hora de apertura"
              style={[styles.horaInput, f.cerrado && styles.horaInputOff]}
            />
            <Text style={styles.separador}>a</Text>
            <TextInput
              value={f.cierra}
              onChangeText={(t) => cambiar(n, { cierra: t })}
              onBlur={() => cambiar(n, { cierra: normalizarHora(f.cierra) })}
              editable={!f.cerrado}
              maxLength={5}
              placeholder="17:00"
              placeholderTextColor="#6b7d70"
              accessibilityLabel="Hora de cierre"
              style={[styles.horaInput, f.cerrado && styles.horaInputOff]}
            />
            <Pressable
              onPress={() => cambiar(n, { cerrado: !f.cerrado })}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: f.cerrado }}
              style={[styles.chip, f.cerrado && styles.chipOn]}>
              <Text style={[styles.chipTexto, f.cerrado && styles.chipTextoOn]}>Cerrado</Text>
            </Pressable>
            <Pressable
              onPress={() => actualizar(franjas.filter((_, i) => i !== n))}
              accessibilityLabel="Quitar franja"
              style={styles.quitar}>
              <Ionicons name="trash-outline" size={14} color="#b3261e" />
              <Text style={styles.quitarTexto}>Quitar</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.acciones}>
        {!hayLunVie ? (
          <Pressable style={styles.accion} onPress={() => actualizar([...franjas, franjaNueva([0, 1, 2, 3, 4])])}>
            <Ionicons name="add" size={14} color="#ffffff" />
            <Text style={styles.accionTexto}>Lunes a viernes</Text>
          </Pressable>
        ) : null}
        {!hayFinde ? (
          <Pressable
            style={styles.accion}
            onPress={() => actualizar([...franjas, franjaNueva([5, 6], '08:00', '12:00')])}>
            <Ionicons name="add" size={14} color="#ffffff" />
            <Text style={styles.accionTexto}>Fines de semana</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.accion} onPress={() => actualizar([...franjas, franjaNueva()])}>
          <Ionicons name="add" size={14} color="#ffffff" />
          <Text style={styles.accionTexto}>Otra franja</Text>
        </Pressable>
      </View>
    </View>
  );
}
