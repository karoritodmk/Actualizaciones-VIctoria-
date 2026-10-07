/**
 * Estilos de app/victoria/tarea/[id].tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  loader: { marginTop: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  empty: { color: 'rgba(255, 255, 255, 0.5)' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' },
  mainCol: {
    flex: 1,
    minWidth: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#000000' },
  meta: { fontSize: 12, color: '#666666' },
  desc: { fontSize: 13, color: '#444444', marginTop: 6 },
  filesRow: { flexDirection: 'row', gap: 12, marginTop: 6, flexWrap: 'wrap' },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
