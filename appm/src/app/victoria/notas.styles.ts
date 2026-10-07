/**
 * Estilos de app/victoria/notas.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: VictoriaColors.white,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: VictoriaColors.darkerGreen,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  newButtonText: {
    color: VictoriaColors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  errorText: {
    color: '#ff8a8a',
    marginBottom: 12,
  },
  empty: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    backgroundColor: VictoriaColors.cardGreen,
    borderRadius: 20,
    padding: 20,
    flexBasis: 280,
    flexGrow: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: VictoriaColors.deepGreen,
    flex: 1,
    marginRight: 8,
  },
  cardSubject: {
    fontSize: 12,
    color: '#5b6b5e',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 13,
    color: '#3d4a3f',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 11,
    color: '#7a8a7c',
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    backgroundColor: 'rgba(220, 230, 215, 0.98)',
    borderRadius: 25,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: VictoriaColors.darkerGreen,
  },
  modalTitleMuted: {
    fontWeight: '400',
    fontSize: 13,
    color: '#666666',
  },
  input: {
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: VictoriaColors.darkerGreen,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: VictoriaColors.mutedGreen,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: VictoriaColors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
