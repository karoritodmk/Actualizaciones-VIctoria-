/**
 * Estilos de app/victoria/coordinador/gestion/fichas/index.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: VictoriaColors.darkerGreen,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  newButtonText: { color: VictoriaColors.white, fontWeight: '600', fontSize: 13 },
  errorText: { color: '#ff8a8a', marginBottom: 12 },
  empty: { color: 'rgba(255, 255, 255, 0.6)' },
  list: { gap: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 520, maxHeight: '85%', backgroundColor: '#f8f9fa', borderRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a3322' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    fontSize: 14,
    color: '#1a3322',
  },
  hint: { fontSize: 12, color: '#556b5c', marginBottom: 8, marginTop: 4, fontWeight: '600' },
  hintNote: { fontSize: 11, color: '#a33b3b', marginTop: -6, marginBottom: 10, lineHeight: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#e2ebd9' },
  chipActive: { backgroundColor: VictoriaColors.darkerGreen },
  chipText: { fontSize: 12, fontWeight: '600', color: '#1a3322' },
  chipTextActive: { color: '#fff' },
  saveButton: { backgroundColor: '#a2b49e', borderRadius: 20, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
