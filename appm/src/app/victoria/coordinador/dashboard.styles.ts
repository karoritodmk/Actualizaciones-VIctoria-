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
  card: {
    minWidth: 200,
    flexBasis: '30%',
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


export default styles;
