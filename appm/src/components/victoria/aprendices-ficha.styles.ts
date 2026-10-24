/**
 * Estilos de app/victoria/coordinador/fichas/[idFicha]/aprendices.tsx
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors, VictoriaRadius } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  subtitle: { fontSize: 12, color: 'rgba(255, 255, 255, 0.55)', marginTop: -22, marginBottom: 24 },
  layout: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 20 },
  main: { flex: 1, flexBasis: 360, minWidth: 300 },
  side: { width: 220, gap: 14 },
  sideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: VictoriaColors.darkGreen,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: VictoriaRadius.pill,
  },
  sideButtonText: { color: VictoriaColors.white, fontSize: 13, fontWeight: '600' },
  loader: { marginTop: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  empty: { color: 'rgba(255, 255, 255, 0.7)' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 250,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: VictoriaRadius.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: VictoriaColors.mutedGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: VictoriaColors.white, fontSize: 17, fontWeight: '700' },
  cardTexto: { flex: 1, gap: 1 },
  cardNombre: { fontSize: 16, color: VictoriaColors.textOnLight },
  cardVerPerfil: { fontSize: 11, color: '#556b5c' },
});

// Expo Router trata todo archivo dentro de src/app como una ruta; este está en
// components/ así que no hace falta default export.