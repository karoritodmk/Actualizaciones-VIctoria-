
import { StyleSheet } from 'react-native';
import { VictoriaRadius, VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  layout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 20,
  },
  main: {
    flex: 1,
    flexBasis: 360,
    minWidth: 300,
  },
  side: {
    width: 220,
    gap: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: VictoriaColors.darkGreen,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: VictoriaRadius.pill,
  },
  addButtonText: { color: VictoriaColors.white, fontSize: 13, fontWeight: '600' },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: -22,
    marginBottom: 24,
  },
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: VictoriaColors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: VictoriaColors.textOnLight,
    textTransform: 'uppercase',
  },
  cardDescription: {
    fontSize: 12,
    color: '#555555',
    lineHeight: 17,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailBlock: {
    gap: 6,
    paddingTop: 2,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  detailLoader: {
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  detailError: {
    fontSize: 12,
    color: '#b3261e',
  },
  detailLine: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 18,
  },
  detailIndent: { paddingLeft: 12 },
  archivoBloque: { gap: 6, marginTop: 6 },
  archivoModal: { gap: 6, marginBottom: 12 },
  uploadHint: { fontSize: 11, color: '#6b7d70', textAlign: 'center', paddingHorizontal: 12 },
  detailLink: {
    color: VictoriaColors.textOnLight,
    textDecorationLine: 'underline',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '90%',
    backgroundColor: 'rgba(236, 240, 233, 0.96)',
    borderRadius: 28,
    padding: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: VictoriaColors.darkGreen,
  },
  modalSubtitle: {
    fontSize: 11,
    color: VictoriaColors.textOnLight,
    marginTop: 2,
  },
  modalError: { color: '#b3261e', fontSize: 12, marginBottom: 10 },
  inputPill: {
    borderWidth: 1,
    borderColor: VictoriaColors.mutedGreen,
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    fontSize: 14,
    color: VictoriaColors.textOnLight,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  inputArea: {
    borderWidth: 1,
    borderColor: 'rgba(143, 164, 126, 0.5)',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
    minHeight: 120,
    fontSize: 14,
    lineHeight: 20,
    color: VictoriaColors.textOnLight,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    textAlignVertical: 'top',
  },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 22,
    borderRadius: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  uploadBoxListo: { 
    borderColor: '#2e7d43',   
    backgroundColor: 'rgba(143, 164, 126, 0.30)' 
  },
  uploadTextListo: { 
   color: '#1c352d', 
   fontWeight: '600' 
  },

  uploadText: { fontSize: 13, color: '#6b7d70', textAlign: 'center' },
  saveButton: {
    backgroundColor: VictoriaColors.mutedGreen,
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: VictoriaColors.white, fontSize: 15, fontWeight: '600' },
  saveButtonRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  saveButtonSuccess: { 
    backgroundColor: '#2e7d43' 
  },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;