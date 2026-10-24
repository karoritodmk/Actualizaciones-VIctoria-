import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { VictoriaColors } from '@/constants/victoria-theme';
import {
  elegirListado,
  formatearTamanoListado,
  type ListadoElegido,
  MENSAJE_FORMATOS_LISTADO,
  type ResultadoListado,
  subirListadoAprendices,
} from '@/lib/aprendices-carga';
import { styles } from './aprendiz-modales.styles';

type Props = {
  visible: boolean;
  onClose: () => void;
  idFicha: number;
  /** Se llama en cuanto termina la carga, para que la lista se actualice detrás del modal. */
  onProcesado: (resultado: ResultadoListado) => void;
};

/**
 * "Cargar listado": sube un archivo plano (.csv, .tsv, .txt o .xlsx) con
 * varios aprendices de la ficha. Al terminar muestra cuántos se crearon y, de
 * los que fallaron, la fila y el motivo.
 */
export function AprendicesCargaModal({ visible, onClose, idFicha, onProcesado }: Props) {
  const [archivo, setArchivo] = useState<ListadoElegido | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [resultado, setResultado] = useState<ResultadoListado | null>(null);

  useEffect(() => {
    if (!visible) return;
    setArchivo(null);
    setError(null);
    setSubiendo(false);
    setResultado(null);
  }, [visible]);

  async function elegir() {
    setError(null);
    try {
      const elegido = await elegirListado();
      if (elegido) {
        setArchivo(elegido);
        setResultado(null);
      }
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo elegir el archivo.');
    }
  }

  async function subir() {
    if (!archivo) return setError('Primero elige el archivo con el listado.');
    setError(null);
    setSubiendo(true);
    try {
      const res = await subirListadoAprendices(idFicha, archivo);
      setResultado(res);
      onProcesado(res);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo procesar el archivo.');
    } finally {
      setSubiendo(false);
    }
  }

  const todoBien = resultado && resultado.errores.length === 0 && resultado.creados.length > 0;

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
                <Text style={styles.title}>Cargar listado</Text>
                <Text style={styles.subtitle}>Aprendices · Ficha {idFicha}</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Cerrar">
                <Ionicons name="close" size={22} color={VictoriaColors.textOnLight} />
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitulo}>Cómo debe ser el archivo</Text>
              <Text style={styles.infoLinea}>{MENSAJE_FORMATOS_LISTADO}</Text>
              <Text style={styles.infoLinea}>
                La primera fila son los encabezados. En texto plano el separador puede ser coma, punto y
                coma, tabulador o barra vertical (|).
              </Text>
              <Text style={styles.infoLinea}>
                Columnas: nombre*, apellido, tipo_documento (si falta, CC), numero_documento*,
                fecha_nacimiento* (AAAA-MM-DD o DD/MM/AAAA), correo_personal*, correo_sena*, telefono.
              </Text>
              <Text style={styles.infoLinea}>
                Cada aprendiz queda en esta ficha con la contraseña temporal «Sena@» + su documento.
              </Text>
            </View>

            <Pressable
              style={[styles.uploadBox, archivo && styles.uploadBoxListo]}
              onPress={elegir}
              disabled={subiendo}
              accessibilityRole="button">
              <Ionicons
                name={archivo ? 'checkmark-circle' : 'cloud-upload-outline'}
                size={archivo ? 28 : 26}
                color={archivo ? '#2e7d43' : '#6b7d70'}
              />
              <Text style={[styles.uploadText, archivo && styles.uploadTextListo]} numberOfLines={2}>
                {archivo ? archivo.name : 'Elegir archivo con el listado de aprendices'}
              </Text>
              <Text style={styles.uploadHint}>
                {archivo
                  ? `${formatearTamanoListado(archivo.size)} · listo para subir · toca para cambiarlo`
                  : '.csv · .tsv · .txt · .xlsx'}
              </Text>
            </Pressable>

            {resultado ? (
              <View style={[styles.resultado, todoBien ? styles.resultadoOk : styles.resultadoMixto]}>
                <Text style={styles.resultadoTitulo}>
                  {resultado.creados.length > 0
                    ? `✓ ${resultado.creados.length} aprendiz${resultado.creados.length === 1 ? '' : 'es'} creado${resultado.creados.length === 1 ? '' : 's'}`
                    : 'No se creó ningún aprendiz'}
                  {resultado.errores.length > 0
                    ? ` · ${resultado.errores.length} fila${resultado.errores.length === 1 ? '' : 's'} con error`
                    : ''}
                </Text>
                {resultado.errores.length > 0 ? (
                  <ScrollView style={styles.resultadoErrores} nestedScrollEnabled>
                    {resultado.errores.map((e, i) => (
                      <Text key={i} style={styles.resultadoLinea}>
                        Fila {e.fila}: {e.error}
                      </Text>
                    ))}
                  </ScrollView>
                ) : null}
                {resultado.errores.length > 0 ? (
                  <Text style={styles.resultadoLinea}>
                    Corrige esas filas en tu archivo y vuelve a subirlo: los aprendices ya creados se
                    omitirán como «ya existe».
                  </Text>
                ) : null}
              </View>
            ) : null}

            <Pressable
              style={[styles.submit, todoBien && styles.submitExito, subiendo && styles.submitDisabled]}
              onPress={resultado ? onClose : subir}
              disabled={subiendo}>
              {subiendo ? (
                <View style={styles.submitRow}>
                  <ActivityIndicator color={VictoriaColors.white} size="small" />
                  <Text style={styles.submitText}>Procesando listado...</Text>
                </View>
              ) : resultado ? (
                <Text style={styles.submitText}>Listo</Text>
              ) : (
                <Text style={styles.submitText}>Subir listado</Text>
              )}
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}