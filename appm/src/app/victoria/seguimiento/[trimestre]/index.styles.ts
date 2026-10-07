/**
 * Estilos de app/victoria/seguimiento/[trimestre]/index.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  loader: { marginVertical: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  summaryRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(28, 53, 45, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBadgeText: {
    fontWeight: '700',
    color: '#146c43',
    fontSize: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: VictoriaColors.black,
  },
  summarySubtitle: {
    fontSize: 12,
    color: '#555555',
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statBlock: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '300',
    color: VictoriaColors.textOnLight,
  },
  statLabel: {
    fontSize: 11,
    color: '#555555',
  },
  list: {
    gap: 12,
  },
  empty: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
