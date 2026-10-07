import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton, ListRow, PaneHeader } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import { Usuario } from '@/lib/aprendices';
import { crearFicha, Ficha, obtenerFichas } from '@/lib/fichas';
import { obtenerInstructores } from '@/lib/instructores';
import { obtenerProgramas, Programa } from '@/lib/programas';
import { useRoleGuard } from '@/lib/role-guard';
import { styles } from './index.styles';

const TRIMESTRES = ['T1', 'T2', 'T3', 'T4'] as const;

/**
 * Alta de fichas. El número de ficha (id_ficha) lo escribe el
 * coordinador a mano -- es el número real del SENA, no un id
 * autoincremental (ver backend/models/ficha.py).
 */
export default function FichasGestionScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const [fichas, setFichas] = useState<Ficha[] | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [instructores, setInstructores] = useState<Usuario[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [numeroFicha, setNumeroFicha] = useState('');
  const [estado, setEstado] = useState('activa');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [trimestre, setTrimestre] = useState<typeof TRIMESTRES[number]>('T1');
  const [horario, setHorario] = useState('');
  const [idPrograma, setIdPrograma] = useState<number | null>(null);
  const [idDirector, setIdDirector] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  function cargar() {
    if (!perfil) return;
    obtenerFichas()
      .then(setFichas)
      .catch((err: any) => setError(err.message));
    obtenerProgramas().then(setProgramas).catch(() => {});
    obtenerInstructores().then(setInstructores).catch(() => {});
  }

  useEffect(cargar, [perfil]);

  function cerrarYLimpiar() {
    setModalVisible(false);
    setNumeroFicha('');
    setEstado('activa');
    setFechaInicio('');
    setFechaFin('');
    setTrimestre('T1');
    setHorario('');
    setIdPrograma(null);
    setIdDirector(null);
    setErrorGuardar(null);
  }

  async function guardar() {
    const numero = Number(numeroFicha);
    if (!numero || !fechaInicio.trim() || !fechaFin.trim()) {
      setErrorGuardar('Número de ficha, fecha de inicio y fecha de fin son obligatorios.');
      return;
    }
    setGuardando(true);
    setErrorGuardar(null);
    try {
      await crearFicha({
        id_ficha: numero,
        estado,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        trimestre,
        horario: horario || undefined,
        id_programa: idPrograma ?? undefined,
        id_director: idDirector ?? undefined,
      } as any);
      cerrarYLimpiar();
      cargar();
    } catch (err: any) {
      setErrorGuardar(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  return (
    <VictoriaScreenShell>
      <PaneHeader eyebrow="VICTORIA > Coordinador > Gestión" title="Fichas" />

      <Pressable style={styles.newButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle-outline" size={16} color={VictoriaColors.white} />
        <Text style={styles.newButtonText}>Nueva ficha</Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!fichas && !error ? <ActivityIndicator color={VictoriaColors.white} /> : null}
      {fichas && fichas.length === 0 ? <Text style={styles.empty}>Todavía no hay fichas registradas.</Text> : null}

      <View style={styles.list}>
        {fichas?.map((f) => {
          const programa = programas.find((p) => p.id_programa === f.id_programa);
          return (
            <ListRow
              key={f.id_ficha}
              icon="folder-outline"
              title={`Ficha ${f.id_ficha}`}
              subtitle={`${programa?.nombre ?? 'Sin programa'} · ${f.estado}${f.trimestre ? ' · ' + f.trimestre : ''}`}
            />
          );
        })}
      </View>

      <ExitButton />

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={cerrarYLimpiar}>
        <Pressable style={styles.modalBackdrop} onPress={cerrarYLimpiar}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nueva ficha</Text>
                <Pressable onPress={cerrarYLimpiar} hitSlop={8}>
                  <Ionicons name="close" size={20} color="#556b5c" />
                </Pressable>
              </View>

              {errorGuardar ? <Text style={styles.errorText}>{errorGuardar}</Text> : null}

              <TextInput
                value={numeroFicha}
                onChangeText={setNumeroFicha}
                placeholder="Número de ficha (ej. 3000045)"
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                value={fechaInicio}
                onChangeText={setFechaInicio}
                placeholder="Fecha de inicio (AAAA-MM-DD)"
                style={styles.input}
              />
              <TextInput
                value={fechaFin}
                onChangeText={setFechaFin}
                placeholder="Fecha de fin (AAAA-MM-DD)"
                style={styles.input}
              />
              <TextInput
                value={horario}
                onChangeText={setHorario}
                placeholder="Horario (ej. Diurna, Lun-Vie 7am-1pm)"
                style={styles.input}
              />

              <Text style={styles.hint}>Trimestre:</Text>
              <View style={styles.chipRow}>
                {TRIMESTRES.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTrimestre(t)}
                    style={[styles.chip, trimestre === t && styles.chipActive]}>
                    <Text style={[styles.chipText, trimestre === t && styles.chipTextActive]}>{t}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.hint}>Programa de formación:</Text>
              <View style={styles.chipRow}>
                {programas.map((p) => (
                  <Pressable
                    key={p.id_programa}
                    onPress={() => setIdPrograma(p.id_programa)}
                    style={[styles.chip, idPrograma === p.id_programa && styles.chipActive]}>
                    <Text style={[styles.chipText, idPrograma === p.id_programa && styles.chipTextActive]}>
                      {p.nombre}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.hint}>Director de ficha (opcional, es solo una etiqueta):</Text>
              <Text style={styles.hintNote}>
                Esto NO le da acceso al instructor. Para que la ficha le aparezca a un instructor,
                ve a Gestión &gt; Asignar instructor a ficha.
              </Text>
              <View style={styles.chipRow}>
                {instructores.map((i) => (
                  <Pressable
                    key={i.id_usuario}
                    onPress={() => setIdDirector(i.id_usuario)}
                    style={[styles.chip, idDirector === i.id_usuario && styles.chipActive]}>
                    <Text style={[styles.chipText, idDirector === i.id_usuario && styles.chipTextActive]}>
                      {i.nombre} {i.apellido ?? ''}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={[styles.saveButton, guardando && { opacity: 0.6 }]}
                onPress={guardar}
                disabled={guardando}>
                <Text style={styles.saveButtonText}>{guardando ? 'Guardando...' : 'Guardar'}</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </VictoriaScreenShell>
  );
}
