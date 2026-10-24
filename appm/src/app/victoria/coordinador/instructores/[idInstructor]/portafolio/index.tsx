import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { DriveExplorer } from '@/components/victoria/drive-explorer';
import { VictoriaScreenShell } from '@/components/victoria/screen-shell';
import { ExitButton } from '@/components/victoria/ui';
import { VictoriaColors } from '@/constants/victoria-theme';
import { useRoleGuard } from '@/lib/role-guard';

/**
 * Portafolio del instructor visto por el coordinador, estilo Drive:
 * /portafolio                -> raíz (COMPETENCIAS COMPORTAMENTALES / FUNCIONALES)
 * /portafolio?carpeta=<id>   -> cualquier carpeta, a cualquier profundidad.
 * En todos los niveles se puede crear una carpeta o subir un archivo.
 *
 * (Antes esta ruta redirigía a /portafolio/1, la vista por trimestres; esas
 * pantallas ([trimestre]/...) siguen en el proyecto pero ya no se enlazan.)
 */
export default function CoordinadorPortafolioInstructorScreen() {
  const perfil = useRoleGuard(['coordinador']);
  const { idInstructor, carpeta } = useLocalSearchParams<{ idInstructor: string; carpeta?: string }>();
  const idInstructorNum = Number(idInstructor);
  const idCarpeta = carpeta ? Number(carpeta) : null;

  if (perfil === undefined) {
    return (
      <VictoriaScreenShell>
        <ActivityIndicator color={VictoriaColors.white} style={{ marginTop: 20 }} />
      </VictoriaScreenShell>
    );
  }
  if (!perfil) return null;

  return (
    <VictoriaScreenShell>
      <DriveExplorer
        idInstructor={idInstructorNum}
        idCarpeta={idCarpeta && !Number.isNaN(idCarpeta) ? idCarpeta : null}
        baseHref={`/victoria/coordinador/instructores/${idInstructorNum}/portafolio`}
      />
      <ExitButton />
    </VictoriaScreenShell>
  );
}