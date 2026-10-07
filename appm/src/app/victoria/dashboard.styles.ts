/**
 * Estilos de app/victoria/dashboard.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  loadingWrap: { alignItems: 'center', gap: 12, paddingVertical: 48 },
  loadingText: { color: VictoriaColors.white, opacity: 0.8 },
  sectionLabel: {
    color: VictoriaColors.white,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    opacity: 0.85,
  },
  loader: { marginBottom: 10 },
  empty: { color: 'rgba(255, 255, 255, 0.6)', marginBottom: 10 },
  cardsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  cardFlex1: { flexGrow: 1, minWidth: 140 },
  cardFlex2: { flexGrow: 2, minWidth: 200 },
  list: { gap: 10 },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
