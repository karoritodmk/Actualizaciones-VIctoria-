/**
 * Estilos de app/victoria/instructor/portafolios/[idFicha]/[idAprendiz].tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  loader: { marginTop: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  empty: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 },
  metaLine: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 20,
  },
  competencias: { gap: 24 },
  competenciaBlock: { gap: 10 },
  competenciaNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: VictoriaColors.white,
  },
  list: { gap: 10 },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
