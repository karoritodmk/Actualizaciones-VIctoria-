/**
 * Estilos de app/victoria/competencias/[trimestre]/[materia].tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  loader: { marginTop: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  empty: { color: 'rgba(255, 255, 255, 0.5)' },
  list: { gap: 16 },
  mainCol: {
    flex: 2,
    minWidth: 260,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#000000' },
  taskDesc: { fontSize: 13, color: '#555555' },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginBottom: 4,
  },
  link: {
    width: '100%',
    textDecorationLine: 'none',
    ...({ outlineStyle: 'none' } as object), // quita el contorno negro de foco en web
  },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
