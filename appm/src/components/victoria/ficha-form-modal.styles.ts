/**
 * Estilos de components/victoria/ficha-form-modal.tsx
 * (mismo look que programa-form-modal: tarjeta clara, campos en píldora).
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

  select: {
    ...CAMPO,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectBloqueado: { opacity: 0.75 },
  selectText: { flex: 1, fontSize: 15, color: VictoriaColors.textOnLight },
  selectPlaceholder: { color: '#6b7d70' },
  opciones: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(28, 53, 45, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: 190,
  },
  opcion: { paddingVertical: 12, paddingHorizontal: 20 },
  opcionActiva: { backgroundColor: 'rgba(143, 164, 126, 0.30)' },
  opcionText: { fontSize: 14, color: VictoriaColors.textOnLight },
  opcionTextActiva: { fontWeight: '700' },
  opcionVacia: { padding: 14, fontSize: 13, color: '#6b7d70' },

  etiqueta: { fontSize: 13, color: VictoriaColors.textOnLight, marginTop: 2 },
  circulos: { flexDirection: 'row', gap: 12 },
  circulo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(28, 53, 45, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circuloActivo: { backgroundColor: VictoriaColors.darkGreen, borderColor: VictoriaColors.darkGreen },
  circuloText: { fontSize: 15, fontWeight: '600', color: VictoriaColors.textOnLight },
  circuloTextActivo: { color: VictoriaColors.white },

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
});