import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton, PaneHeader } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import { obtenerPerfil, type Perfil } from '@/lib/auth';
import { Subcarpeta, obtenerSubcarpetas } from '@/lib/portafolio';
import { styles } from './index.styles';

const NOMBRES_CARPETA: Record<string, string> = {
  planes_mejoramiento: 'Planes de mejoramiento',
  etapa_productiva: 'Formato etapa productiva',
  evidencias_aprendizaje: 'Evidencias de aprendizaje',
  plan_trabajo_concertado: 'Plan de trabajo concertado',
  otros: 'Otros',
};

export default function SubcarpetasPortafolioScreen() {
  const { categoria } = useLocalSearchParams<{ categoria: string }>();
  const clave = categoria ?? 'otros';

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [subcarpetas, setSubcarpetas] = useState<Subcarpeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerPerfil().then(setPerfil);
    obtenerSubcarpetas(clave)
      .then(setSubcarpetas)
      .catch((err) => setError(err.message));
  }, [clave]);

  const nombreCompleto = perfil ? [perfil.nombre, perfil.apellido].filter(Boolean).join(' ') : '';

  return (
    <VictoriaScreenShell>
      <PaneHeader
        eyebrow="Portafolio"
        title={NOMBRES_CARPETA[clave] ?? clave}
        backHref="/victoria/portafolio"
      />

      <Text style={styles.breadcrumb}>
        Portafolio &gt; {(NOMBRES_CARPETA[clave] ?? clave).toUpperCase()}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!subcarpetas && !error ? (
        <ActivityIndicator color={VictoriaColors.white} style={styles.loader} />
      ) : null}

      {subcarpetas ? (
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.colNombre, styles.headerNombre]}>Nombre</Text>
            <Text style={[styles.headerCell, styles.colDato]}>Modificado</Text>
            <Text style={[styles.headerCell, styles.colDato]}>Modificado Por</Text>
            <Text style={[styles.headerCell, styles.colDato]}>Archivos</Text>
          </View>

          {subcarpetas.map((sub) => (
            <Link key={sub.subcarpeta} href={`/victoria/portafolio/${clave}/${sub.subcarpeta}` as never} asChild>
              <Pressable style={styles.row}>
                <View style={[styles.rowMain, styles.colNombre]}>
                  <View style={styles.folderIcon}>
                    <Ionicons name="folder" size={16} color={VictoriaColors.white} />
                  </View>
                  <Text style={styles.rowTitle}>{sub.nombre}</Text>
                </View>
                <Text style={[styles.rowText, styles.colDato]}>
                  {sub.ultima_modificacion
                    ? new Date(sub.ultima_modificacion).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                      })
                    : '—'}
                </Text>
                <Text style={[styles.rowText, styles.colDato]}>
                  {sub.total_archivos > 0 ? nombreCompleto : '—'}
                </Text>
                <Text style={[styles.rowText, styles.colDato]}>
                  {sub.total_archivos} {sub.total_archivos === 1 ? 'doc' : 'docs'}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      ) : null}

      <ExitButton />
    </VictoriaScreenShell>
  );
}
