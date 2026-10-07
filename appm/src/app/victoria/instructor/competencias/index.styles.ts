/**
 * Estilos de app/victoria/instructor/competencias/index.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaRadius, VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  loader: { marginTop: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  empty: { color: 'rgba(255, 255, 255, 0.6)' },
  emptySmall: { color: '#777777', fontSize: 12, paddingVertical: 6 },
  columnsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  column: {
    flex: 1,
    minWidth: 280,
    gap: 12,
  },
  trimestreBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: VictoriaRadius.card,
    padding: 14,
  },
  trimestreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trimestreHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(28, 53, 45, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipSmall: {
    width: 26,
    height: 26,
    borderRadius: 8,
  },
  trimestreTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: VictoriaColors.black,
  },
  trimestreSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  materiasWrap: {
    marginTop: 12,
    gap: 8,
  },
  materiaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(28, 53, 45, 0.04)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  materiaTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: VictoriaColors.black,
    flexShrink: 1,
  },
  materiaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeChip: {
    backgroundColor: VictoriaColors.darkGreen,
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeChipText: {
    color: VictoriaColors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  fichasWrap: {
    marginTop: 6,
    marginLeft: 14,
    gap: 6,
  },
  fichaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  fichaTitle: {
    fontSize: 13,
    color: VictoriaColors.black,
  },
  fichaSubtitle: {
    fontSize: 11,
    color: '#777777',
  },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
