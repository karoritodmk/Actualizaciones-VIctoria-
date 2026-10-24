/**
 * Estilos de components/victoria/portafolio-aprendiz-vista.tsx
 * (mismos valores de la tabla "tipo Drive" del portafolio del propio aprendiz).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  loader: { marginTop: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  crumb: { fontSize: 12, color: 'rgba(255, 255, 255, 0.5)', textDecorationLine: 'none' },
  crumbSep: { fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' },
  crumbActual: { fontSize: 12, fontWeight: '700', color: VictoriaColors.white },
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
  headerCell: { fontSize: 12, fontWeight: '600', color: '#666666' },
  headerNombre: { paddingLeft: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  folderIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: VictoriaColors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: VictoriaColors.mutedGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 14, fontWeight: '600', color: VictoriaColors.black, flexShrink: 1 },
  rowText: { fontSize: 13, color: '#555555' },
  colNombre: { flex: 3 },
  colDato: { flex: 1.2, textAlign: 'center' },
  vacio: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, gap: 6 },
  vacioTitulo: { fontSize: 18, color: VictoriaColors.black, marginTop: 16 },
  vacioTexto: { fontSize: 12, color: '#666666', textAlign: 'center', maxWidth: 320 },
});
