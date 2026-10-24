/**
 * Estilos de components/victoria/documento-preview-modal.web.tsx
 * (reutiliza el cristal del modal de programas y lo hace más alto para el documento).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors, VictoriaRadius } from '@/constants/victoria-theme';
import { styles as base } from './programa-form-modal.styles';

export const styles = StyleSheet.create({
  backdrop: base.backdrop,
  card: {
    ...base.card,
    maxWidth: 820,
    height: '86%',
    padding: 22,
    gap: 12,
  },
  header: base.header,
  title: base.title,
  subtitle: base.subtitle,
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  /** Hoja blanca donde se ve el documento (igual que el diseño). */
  previewArea: {
    flex: 1,
    backgroundColor: VictoriaColors.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(28, 53, 45, 0.12)',
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  mensaje: {
    fontSize: 13,
    lineHeight: 20,
    color: VictoriaColors.textOnLight,
    textAlign: 'center',
    maxWidth: 420,
  },
  mensajeError: { color: '#b3261e' },
  botonAbrir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: VictoriaColors.darkGreen,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: VictoriaRadius.pill,
  },
  botonAbrirTexto: { color: VictoriaColors.white, fontSize: 13, fontWeight: '600' },
});
