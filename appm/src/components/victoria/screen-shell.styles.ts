/**
 * Estilos de components/victoria/screen-shell.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet, Platform } from 'react-native';
import { VictoriaRadius } from '@/constants/victoria-theme';

/** Medidas del "notch" del panel de cristal; también las usa la lógica de screen-shell.tsx. */
export const NOTCH_WIDTH = 130;
export const NOTCH_HEIGHT = 50;

export const styles = StyleSheet.create({
  // Alto EXACTO de la ventana: nada se estira con el contenido.
  body: {
    flex: 1,
    backgroundColor: '#030705',
    ...(Platform.OS === 'web'
      ? ({ height: '100vh', overflow: 'hidden' } as object)
      : null),
  },
  // Capa fija al tamaño de la ventana (web) o de la pantalla (nativo).
  bgLayer: {
    ...(Platform.OS === 'web'
      ? ({
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
        } as object)
      : { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }),
  },
  bgImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // Zona bajo el navbar: ocupa todo el alto restante.
  main: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 44, // espacio para la lengüeta (notch)
    paddingBottom: 30,
    minHeight: 0,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    maxWidth: 1280,
    // Margen lateral simétrico para que el botón de cerrar sesión
    // (esquina inferior izquierda) quede afuera del panel de cristal.
    paddingHorizontal: 76,
    minHeight: 0,
  },
  viewportWrap: {
    flex: 1,
    minHeight: 0,
    ...(Platform.OS === 'web' ? ({ position: 'relative' } as object) : null),
  },
  // Trapecio ancho y alto (no un triángulo flaco): flat-top que se une
  // al borde superior del panel, imitando la "lengüeta" que sale del tab
  // activo del navbar. "left" se calcula dinámicamente arriba según qué
  // tab esté activo.
  notch: {
    position: 'absolute',
    top: -NOTCH_HEIGHT + 8,
    width: NOTCH_WIDTH,
    height: NOTCH_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.41)',
    zIndex: 2,
    ...({
      clipPath: 'polygon(50% 0%, 85% 100%, 15% 100%)',
      backdropFilter: 'blur(25px)',
      WebkitBackdropFilter: 'blur(25px)',
    } as object),
  },
  // Panel de cristal: llena todo el alto disponible, tamaño fijo.
  viewport: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.41)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: VictoriaRadius.viewport,
    overflow: 'hidden',
  },
  logoutBtn: {
    position: 'absolute',
    left: 20,
    bottom: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 5,
  },
  // El scroll vive DENTRO del panel.
  innerScroll: {
    flex: 1,
    minHeight: 0,
  },
  innerScrollContent: {
    flexGrow: 1,
    padding: 28,
  },
});
