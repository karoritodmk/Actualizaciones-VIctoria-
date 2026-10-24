/**
 * Estilos de components/victoria/fichas-lista.tsx
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors, VictoriaRadius } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  subtitle: { fontSize: 12, color: 'rgba(255, 255, 255, 0.45)', marginTop: -22, marginBottom: 24 },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  layout: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 20 },
  main: { flex: 1, flexBasis: 360, minWidth: 300 },
  side: { width: 220, gap: 14 },
  sideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: VictoriaColors.darkGreen,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: VictoriaRadius.pill,
  },
  sideButtonText: { color: VictoriaColors.white, fontSize: 13, fontWeight: '600' },
  loader: { marginTop: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  empty: { color: 'rgba(255, 255, 255, 0.6)' },
  list: { gap: 14 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: VictoriaRadius.card,
    padding: 18,
    gap: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: VictoriaColors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 20, fontWeight: '500', color: VictoriaColors.textOnLight },
  cardSubtitle: { fontSize: 12, color: '#555555' },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailBlock: {
    gap: 6,
    paddingTop: 2,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  detailLine: { fontSize: 12, color: '#333333', lineHeight: 18 },
});