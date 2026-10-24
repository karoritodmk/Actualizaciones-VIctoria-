import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { AprendicesCargaModal } from '@/components/victoria/aprendices-carga-modal';
import { styles } from '@/components/victoria/aprendices-ficha.styles';
import { AprendizFormModal } from '@/components/victoria/aprendiz-form-modal';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { useVictoriaToast } from '@/components/victoria/toast';
import { ExitButton, PaneHeader, SearchPill } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import { obtenerAprendicesDeFicha, type Usuario } from '@/lib/aprendices';
import { type Ficha, obtenerFicha } from '@/lib/fichas';
import { obtenerProgramas } from '@/lib/programas';
import { useRoleGuard } from '@/lib/role-guard';

type Aprendiz = Usuario & { informacion_adicional?: string | null };

function nombreCompleto(a: Usuario) {
  return `${a.nombre} ${a.apellido ?? ''}`.trim();
}

/**
 * Aprendices de una ficha. Se abre con el botón "Aprendices" de cada ficha.
 * Permite buscar, abrir el perfil (pantalla propia, con su portafolio), añadir un
 * aprendiz con el formulario completo y cargar un listado desde un archivo plano.
 */
export default function CoordinadorAprendicesFichaScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const { idFicha } = useLocalSearchParams<{ idFicha: string }>();
  const idFichaNum = Number(idFicha);
  const { mostrarExito } = useVictoriaToast();

  const [aprendices, setAprendices] = useState<Aprendiz[] | null>(null);
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [programaNombre, setProgramaNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [modalForm, setModalForm] = useState(false);
  const [modalCarga, setModalCarga] = useState(false);

  const cargar = useCallback(() => {
    if (!perfil) return;
    if (!idFichaNum || Number.isNaN(idFichaNum)) {
      setError('No se especificó una ficha válida.');
      return;
    }
    setError(null);
    obtenerFicha(idFichaNum)
      .then(async (f) => {
        setFicha(f);
        if (f.id_programa != null) {
          try {
            const programas = await obtenerProgramas();
            setProgramaNombre(programas.find((p) => p.id_programa === f.id_programa)?.nombre ?? '');
          } catch {
            /* sin nombre de programa igual se ve la lista */
          }
        }
      })
      .catch((err: any) => setError(err?.message ?? 'No se pudo cargar la ficha.'));
    obtenerAprendicesDeFicha(idFichaNum)
      .then((lista) =>
        setAprendices([...lista].sort((a, b) => nombreCompleto(a).localeCompare(nombreCompleto(b), 'es')))
      )
      .catch((err: any) => setError(err?.message ?? 'No se pudieron cargar los aprendices.'));
  }, [perfil, idFichaNum]);

  useFocusEffect(cargar);

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  const termino = busqueda.trim().toLowerCase();
  const filtrados = (aprendices ?? []).filter(
    (a) =>
      !termino ||
      [nombreCompleto(a), a.numero_documento, a.correo_personal, a.correo_sena].some((t) =>
        t.toLowerCase().includes(termino)
      )
  );

  const trimestre = ficha?.trimestre ? ` - trimestre ${ficha.trimestre.replace(/^T/i, '')}` : '';
  const cantidad = aprendices ? ` · ${aprendices.length} aprendiz${aprendices.length === 1 ? '' : 'es'}` : '';

  return (
    <VictoriaScreenShell>
      <PaneHeader
        eyebrow="Fichas"
        title={`Ficha ${idFichaNum} - Aprendices`}
        backHref="/victoria/coordinador/fichas"
      />
      <Text style={styles.subtitle}>
        {programaNombre || 'Programa sin nombre'}
        {trimestre}
        {cantidad}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.layout}>
        <View style={styles.main}>
          {!aprendices && !error ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}
          {aprendices && filtrados.length === 0 ? (
            <Text style={styles.empty}>
              {aprendices.length === 0
                ? 'Esta ficha todavía no tiene aprendices. Usa "Añadir Aprendiz" o "Cargar listado".'
                : 'No se encontraron aprendices con esa búsqueda.'}
            </Text>
          ) : null}

          <View style={styles.grid}>
            {filtrados.map((a) => (
              <Pressable
                key={a.id_usuario}
                style={styles.card}
                onPress={() =>
                  router.push(`/victoria/coordinador/fichas/${idFichaNum}/aprendices/${a.id_usuario}` as never)
                }
                accessibilityRole="button"
                accessibilityLabel={`Ver perfil de ${nombreCompleto(a)}`}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(a.nombre.trim()[0] ?? '?').toUpperCase()}</Text>
                </View>
                <View style={styles.cardTexto}>
                  <Text style={styles.cardNombre} numberOfLines={1}>
                    {nombreCompleto(a)}
                  </Text>
                  <Text style={styles.cardVerPerfil}>- Ver perfil</Text>
                </View>
                <Ionicons name="person-outline" size={18} color="#556b5c" />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.side}>
          <SearchPill value={busqueda} onChangeText={setBusqueda} placeholder="Encontrar aprendiz" />
          <Pressable style={styles.sideButton} onPress={() => setModalForm(true)} accessibilityRole="button">
            <Ionicons name="person-add-outline" size={15} color={VictoriaColors.white} />
            <Text style={styles.sideButtonText}>Añadir Aprendiz</Text>
          </Pressable>
          <Pressable style={styles.sideButton} onPress={() => setModalCarga(true)} accessibilityRole="button">
            <Ionicons name="document-text-outline" size={15} color={VictoriaColors.white} />
            <Text style={styles.sideButtonText}>Cargar listado</Text>
          </Pressable>
        </View>
      </View>

      <ExitButton />

      <AprendizFormModal
        visible={modalForm}
        onClose={() => setModalForm(false)}
        idFicha={idFichaNum}
        programaNombre={programaNombre}
        onCreado={(nombre) => {
          cargar();
          mostrarExito(`${nombre || 'Aprendiz'} añadido a la ficha ${idFichaNum}`);
        }}
      />

      <AprendicesCargaModal
        visible={modalCarga}
        onClose={() => setModalCarga(false)}
        idFicha={idFichaNum}
        onProcesado={() => cargar()}
      />
    </VictoriaScreenShell>
  );
}