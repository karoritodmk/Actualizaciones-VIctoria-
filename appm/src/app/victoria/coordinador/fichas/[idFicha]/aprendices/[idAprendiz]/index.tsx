import { Redirect, useLocalSearchParams } from 'expo-router';

/**
 * /fichas/[idFicha]/aprendices/[idAprendiz] no tiene pantalla propia: el
 * perfil se ve en la ventana de la lista, y el portafolio vive en
 * ./portafolio. Esta ruta solo devuelve a la lista de aprendices.
 */
export default function AprendizRedirigeALista() {
  const { idFicha } = useLocalSearchParams<{ idFicha: string }>();
  return <Redirect href={`/victoria/coordinador/fichas/${idFicha}/aprendices` as never} />;
}