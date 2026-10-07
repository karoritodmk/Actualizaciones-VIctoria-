/**
 * Estilos de app/victoria/portafolio/[categoria]/index.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  loader: { marginTop: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  breadcrumb: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 14,
  },
  table: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  headerNombre: { paddingLeft: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  folderIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: VictoriaColors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: VictoriaColors.black,
    flexShrink: 1,
  },
  rowText: {
    fontSize: 13,
    color: '#555555',
  },
  colNombre: { flex: 3 },
  colDato: { flex: 1.2, textAlign: 'center' },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
