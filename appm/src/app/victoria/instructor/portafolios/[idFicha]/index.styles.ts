/**
 * Estilos de app/victoria/instructor/portafolios/[idFicha]/index.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors, VictoriaRadius } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  loader: { marginTop: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  empty: { color: 'rgba(255, 255, 255, 0.6)' },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: VictoriaColors.darkGreen,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: VictoriaRadius.pill,
  },
  addBtnText: {
    color: VictoriaColors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  aprendizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 12,
    minWidth: 260,
    flexBasis: '47%',
    flexGrow: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: VictoriaColors.mutedGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: VictoriaColors.white,
    fontWeight: '700',
  },
  aprendizInfo: {
    flex: 1,
  },
  aprendizNombre: {
    fontSize: 13,
    fontWeight: '600',
    color: VictoriaColors.black,
  },
  aprendizEstado: {
    fontSize: 11,
    color: '#777777',
  },
});

export const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  card: {
    width: 440,
    maxWidth: '100%',
    maxHeight: '88%',
    backgroundColor: 'rgba(225, 232, 222, 0.98)',
    borderRadius: 25,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 24,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a3322',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b6b6b',
  },
  inline: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1a1a1a',
  },
  inputSmall: {
    width: 100,
  },
  inputGrow: {
    flex: 1,
  },
  textarea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  attachBox: {
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.15)',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  attachText: {
    fontSize: 12,
    color: '#556b5c',
    textAlign: 'center',
  },
  error: {
    color: '#b3261e',
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: '#143520',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  successBox: {
    gap: 6,
    paddingVertical: 10,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#146c43',
  },
  successLine: {
    fontSize: 13,
    color: '#1a1a1a',
  },
  successHint: {
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
  },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
