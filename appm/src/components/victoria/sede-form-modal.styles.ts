/**
 * Estilos de components/victoria/sede-form-modal.tsx
 * (extraídos del .tsx para mantener el componente ordenado).
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
    maxWidth: 560,
    backgroundColor: 'rgba(236, 241, 233, 0.94)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    padding: 28,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: VictoriaColors.darkGreen,
  },
  subtitle: {
    fontSize: 11,
    color: VictoriaColors.textOnLight,
    marginTop: 2,
  },
  error: {
    color: '#b3261e',
    fontSize: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(28, 53, 45, 0.15)',
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 14,
    paddingHorizontal: 22,
    fontSize: 15,
    color: VictoriaColors.textOnLight,
    outlineStyle: 'none',
  } as never,
  textArea: {
    borderRadius: 24,
    minHeight: 130,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: VictoriaColors.darkGreen,
  },
  dropzone: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(28, 53, 45, 0.15)',
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  dropzoneText: {
    fontSize: 13,
    color: VictoriaColors.textOnLight,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  submit: {
    backgroundColor: VictoriaColors.mutedGreen,
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: VictoriaColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
