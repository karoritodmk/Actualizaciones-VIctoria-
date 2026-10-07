import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton, PaneHeader } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import { obtenerPerfil, type Perfil } from '@/lib/auth';
import { Carpeta, obtenerCarpetas } from '@/lib/portafolio';
import { styles } from './index.styles';

export default function PortafolioIndex() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carpetas, setCarpetas] = useState<Carpeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerPerfil().then(setPerfil);
    obtenerCarpetas()
      .then(setCarpetas)
      .catch((err) => setError(err.message));
  }, []);

  const nombreCompleto = perfil ? [perfil.nombre, perfil.apellido].filter(Boolean).join(' ') : '';

  return (
    <VictoriaScreenShell>
      <PaneHeader
        eyebrow="Portafolio 2026"
        title={nombreCompleto ? `Portafolio - ${nombreCompleto}` : 'Portafolio'}
      />

      <Text style={styles.breadcrumb}>
        Portafolio{nombreCompleto ? ` - ${nombreCompleto}` : ''}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!carpetas && !error ? <ActivityIndicator color={VictoriaColors.white} style={styles.loader} /> : null}

      {carpetas ? (
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.colNombre, styles.headerNombre]}>Nombre</Text>
            <Text style={[styles.headerCell, styles.colDato]}>Modificado</Text>
            <Text style={[styles.headerCell, styles.colDato]}>Modificado Por</Text>
            <Text style={[styles.headerCell, styles.colDato]}>Archivos</Text>
          </View>

          {carpetas.map((carpeta) => (
            <Link key={carpeta.categoria} href={`/victoria/portafolio/${carpeta.categoria}` as never} asChild>
              <Pressable style={styles.row}>
                <View style={[styles.rowMain, styles.colNombre]}>
                  <View style={styles.folderIcon}>
                    <Ionicons name="folder" size={16} color={VictoriaColors.white} />
                  </View>
                  <Text style={styles.rowTitle}>{carpeta.nombre}</Text>
                </View>
                <Text style={[styles.rowText, styles.colDato]}>
                  {carpeta.ultima_modificacion
                    ? new Date(carpeta.ultima_modificacion).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                      })
                    : '—'}
                </Text>
                <Text style={[styles.rowText, styles.colDato]}>
                  {carpeta.total_archivos > 0 ? nombreCompleto : '—'}
                </Text>
                <Text style={[styles.rowText, styles.colDato]}>
                  {carpeta.total_archivos} {carpeta.total_archivos === 1 ? 'doc' : 'docs'}
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
