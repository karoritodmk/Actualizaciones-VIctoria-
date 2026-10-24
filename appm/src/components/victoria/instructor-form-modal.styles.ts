/**
 * Estilos de components/victoria/instructor-form-modal.tsx
 * (misma estética "glass" del modal de sedes).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors, VictoriaRadius } from '@/constants/victoria-theme';

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
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: 'rgba(236, 241, 233, 0.94)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    padding: 26,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: { fontSize: 24, fontWeight: '700', color: VictoriaColors.darkGreen },
  subtitle: { fontSize: 11, color: VictoriaColors.textOnLight, marginTop: 2 },
  body: { gap: 6, paddingBottom: 4 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: VictoriaColors.textOnLight,
    marginTop: 8,
  },
  hint: { fontSize: 10, color: 'rgba(28, 53, 45, 0.65)' },
  error: { color: '#b3261e', fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(28, 53, 45, 0.15)',
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 14,
    color: VictoriaColors.textOnLight,
    outlineStyle: 'none',
  } as never,
  inputFocused: { borderColor: VictoriaColors.darkGreen },
  row: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(28, 53, 45, 0.15)',
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: 'rgba(139, 163, 120, 0.35)',
    borderColor: VictoriaColors.darkGreen,
  },
  chipText: { fontSize: 13, color: VictoriaColors.textOnLight },
  chipTextActive: { fontWeight: '700', color: VictoriaColors.darkGreen },
  submit: {
    backgroundColor: VictoriaColors.mutedGreen,
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 14,
  },
  submitDisabled: { opacity: 0.55 },
  submitText: { color: VictoriaColors.white, fontSize: 15, fontWeight: '600' },
});