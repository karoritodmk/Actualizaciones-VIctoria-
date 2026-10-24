import { useLocalSearchParams } from 'expo-router';

import { PortafolioAprendizVista } from '@/components/victoria/portafolio-aprendiz-vista';

/** Portafolio de un aprendiz, nivel raíz: las 5 carpetas fijas. */
export default function CoordinadorPortafolioAprendizRaizScreen() {
  const { idFicha, idAprendiz } = useLocalSearchParams<{ idFicha: string; idAprendiz: string }>();
  return <PortafolioAprendizVista idFicha={idFicha} idAprendiz={idAprendiz} ruta={[]} />;
}
