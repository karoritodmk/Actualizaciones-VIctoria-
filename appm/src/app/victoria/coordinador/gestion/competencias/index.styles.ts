/**
 * Estilos de app/victoria/coordinador/gestion/competencias/index.tsx
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a3322' },
  label: { fontSize: 12, color: '#556b5c', marginBottom: 8, fontWeight: '600' },
  trimestreRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  trimestreChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  trimestreChipActivo: { backgroundColor: '#8fa47e', borderColor: '#8fa47e' },
  trimestreChipText: { color: '#556b5c', fontWeight: '600', fontSize: 13 },
  trimestreChipTextActivo: { color: '#ffffff' },
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
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  saveButton: {
    backgroundColor: '#a2b49e',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
