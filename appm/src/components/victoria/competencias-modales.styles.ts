/**
 * Estilos de competencia-form-modal, competencia-actividades-modal y competencia-instructor-modal
 * (mismo look que ficha-form-modal: tarjeta clara, campos en píldora).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors, VictoriaRadius } from '@/constants/victoria-theme';

const CAMPO = {
  backgroundColor: 'rgba(255, 255, 255, 0.55)',
  borderWidth: 1,
  borderColor: 'rgba(28, 53, 45, 0.15)',
  borderRadius: VictoriaRadius.pill,
  paddingVertical: 14,
  paddingHorizontal: 22,
} as const;

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '94%',
    backgroundColor: 'rgba(236, 241, 233, 0.94)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    padding: 28,
  },
  content: { gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 28, fontWeight: '700', color: VictoriaColors.darkGreen },
  subtitle: { fontSize: 11, color: VictoriaColors.textOnLight, marginTop: 2 },
  error: { color: '#b3261e', fontSize: 12 },

  input: { ...CAMPO, fontSize: 15, color: VictoriaColors.textOnLight, outlineStyle: 'none' } as never,
  area: {
    ...CAMPO,
    borderRadius: 24,
    minHeight: 88,
    fontSize: 15,
    color: VictoriaColors.textOnLight,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as never,
  fila: { flexDirection: 'row', gap: 10 },
  mitad: { flex: 1 },

  etiqueta: { fontSize: 13, color: VictoriaColors.textOnLight, marginTop: 2 },
  ayuda: { fontSize: 11, color: '#556b5c', lineHeight: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: VictoriaRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(28, 53, 45, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  chipActivo: { backgroundColor: VictoriaColors.darkGreen, borderColor: VictoriaColors.darkGreen },
  chipText: { fontSize: 13, fontWeight: '600', color: VictoriaColors.textOnLight },
  chipTextActivo: { color: VictoriaColors.white },

  checkFila: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  checkTexto: { flex: 1, fontSize: 13, color: VictoriaColors.textOnLight, lineHeight: 18 },

  uploadBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(28, 53, 45, 0.15)',
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 6,
  },
  uploadBoxListo: { borderColor: '#2e7d43', backgroundColor: 'rgba(143, 164, 126, 0.30)' },
  uploadText: { fontSize: 13, color: '#6b7d70', textAlign: 'center' },
  uploadTextListo: { color: '#1c352d', fontWeight: '600' },
  uploadHint: { fontSize: 11, color: '#6b7d70', textAlign: 'center' },

  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  infoTitulo: { fontSize: 12, fontWeight: '700', color: VictoriaColors.darkGreen },
  infoLinea: { fontSize: 12, color: VictoriaColors.textOnLight, lineHeight: 17 },

  resultado: { borderRadius: 18, padding: 14, gap: 6, borderWidth: 1 },
  resultadoOk: { backgroundColor: 'rgba(46, 125, 67, 0.12)', borderColor: '#2e7d43' },
  resultadoMixto: { backgroundColor: 'rgba(179, 38, 30, 0.07)', borderColor: '#b3261e' },
  resultadoTitulo: { fontSize: 14, fontWeight: '700', color: VictoriaColors.textOnLight },
  resultadoLinea: { fontSize: 12, color: VictoriaColors.textOnLight, lineHeight: 17 },
  resultadoErrores: { maxHeight: 160 },

  submit: {
    backgroundColor: VictoriaColors.mutedGreen,
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  submitExito: { backgroundColor: '#2e7d43' },
  submitDisabled: { opacity: 0.6 },
  submitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: VictoriaColors.white, fontSize: 15, fontWeight: '600' },

  perfilLinea: { fontSize: 14, color: VictoriaColors.textOnLight, lineHeight: 21 },
  perfilEtiqueta: { fontWeight: '700' },
  cardAncha: { maxWidth: 880 },
  nombreDoc: { fontSize: 13, color: VictoriaColors.textOnLight, fontWeight: '600' },
  vacioDoc: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  vacioDocTexto: { fontSize: 14, color: '#556b5c', textAlign: 'center' },
  acciones: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 2 },
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: VictoriaRadius.pill,
    backgroundColor: VictoriaColors.darkGreen,
  },
  accionClara: { backgroundColor: VictoriaColors.mutedGreen },
  accionPeligro: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#b3261e' },
  accionTexto: { color: VictoriaColors.white, fontSize: 13, fontWeight: '600' },
  accionTextoPeligro: { color: '#b3261e' },

  lista: { gap: 8 },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(28, 53, 45, 0.15)',
  },
  opcionActiva: { borderColor: '#2e7d43', backgroundColor: 'rgba(143, 164, 126, 0.30)' },
  opcionTexto: { flex: 1, fontSize: 14, color: VictoriaColors.textOnLight },
});