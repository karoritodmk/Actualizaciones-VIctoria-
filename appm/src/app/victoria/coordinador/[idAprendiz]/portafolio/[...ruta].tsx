import { useLocalSearchParams } from 'expo-router';

import { PortafolioAprendizVista } from '@/components/victoria/portafolio-aprendiz-vista';

/**
 * Portafolio de un aprendiz, niveles interiores. Un solo archivo para los tres:
 *   /portafolio/{categoria}                       -> trimestres
 *   /portafolio/{categoria}/{subcarpeta}          -> carpetas y archivos del trimestre
 *   /portafolio/{categoria}/{subcarpeta}/{id}     -> archivos de una carpeta
 */
export default function CoordinadorPortafolioAprendizScreen() {
  const { idFicha, idAprendiz, ruta } = useLocalSearchParams<{
    idFicha: string;
    idAprendiz: string;
    ruta: string | string[];
  }>();
  const segmentos = Array.isArray(ruta) ? ruta : ruta ? [ruta] : [];
  return <PortafolioAprendizVista idFicha={idFicha} idAprendiz={idAprendiz} ruta={segmentos} />;
}
