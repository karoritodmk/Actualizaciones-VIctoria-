/**
 * Estilos de app/victoria/instructor/dashboard.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    color: '#ff8a8a',
    marginBottom: 12,
  },
  empty: {
    color: 'rgba(255, 255, 255, 0.55)',
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  cardFlex2: {
    minWidth: 240,
    flexBasis: '38%',
  },
  cardFlex1: {
    minWidth: 180,
    flexBasis: '25%',
  },
  sectionLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
