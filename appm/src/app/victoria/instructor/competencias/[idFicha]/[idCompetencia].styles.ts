/**
 * Estilos de app/victoria/instructor/competencias/[idFicha]/[idCompetencia].tsx
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
  newTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: VictoriaColors.darkGreen,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: VictoriaRadius.pill,
  },
  newTaskBtnText: {
    color: VictoriaColors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  list: {
    gap: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  taskMain: {
    flex: 1,
    gap: 6,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: VictoriaColors.black,
  },
  taskDesc: {
    fontSize: 13,
    color: '#555555',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 11,
    color: '#444444',
    fontWeight: '600',
  },
  chipGreen: { backgroundColor: '#d1f2dc' },
  chipGreenText: { color: '#146c43' },
  chipAmber: { backgroundColor: '#fdecc8' },
  chipAmberText: { color: '#8a5a00' },
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
    width: 420,
    maxWidth: '100%',
    maxHeight: '85%',
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
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1a1a1a',
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
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
