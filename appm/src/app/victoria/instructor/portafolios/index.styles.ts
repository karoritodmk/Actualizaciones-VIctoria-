/**
 * Estilos de app/victoria/instructor/portafolios/index.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  loader: { marginTop: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  empty: { color: 'rgba(255, 255, 255, 0.6)' },
  list: { gap: 12 },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
