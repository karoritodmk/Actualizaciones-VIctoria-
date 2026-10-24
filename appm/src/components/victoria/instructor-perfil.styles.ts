/**
 * Estilos de coordinador/instructores/[idInstructor]/index.tsx
 * (tarjetas claras y translúcidas, como en el diseño del perfil del instructor).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors, VictoriaRadius } from '@/constants/victoria-theme';

const TARJETA = {
  backgroundColor: 'rgba(236, 241, 233, 0.88)',
  borderRadius: 28,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.6)',
  padding: 24,
} as const;

export const styles = StyleSheet.create({
  loader: { marginTop: 24 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  volver: { fontSize: 12, color: 'rgba(255, 255, 255, 0.85)', marginBottom: 18 },
  layout: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 20 },
  main: { flex: 1, flexBasis: 420, minWidth: 300, gap: 18 },
  side: { width: 180, alignItems: 'flex-end' },

  card: { ...TARJETA, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: VictoriaColors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombre: { fontSize: 28, color: VictoriaColors.darkGreen },
  subLinea: { fontSize: 11, color: '#556b5c' },

  seccion: { fontSize: 12, letterSpacing: 0.5, color: VictoriaColors.darkGreen, marginTop: 8 },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  datoEtiqueta: { width: 92, fontSize: 13, color: VictoriaColors.textOnLight },
  datoValor: { flex: 1, fontSize: 13, color: '#556b5c' },
  datoLink: { textDecorationLine: 'underline' },
  divider: { height: 1, backgroundColor: 'rgba(28, 53, 45, 0.25)', marginVertical: 6 },

  hojaVida: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  chipLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: VictoriaRadius.pill,
    backgroundColor: VictoriaColors.darkGreen,
  },
  chipLinkClaro: { backgroundColor: VictoriaColors.mutedGreen },
  chipLinkTexto: { color: VictoriaColors.white, fontSize: 12, fontWeight: '600' },

  etiqueta: { fontSize: 13, color: VictoriaColors.textOnLight, marginTop: 4 },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: 'rgba(143, 164, 126, 0.45)',
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  selectTexto: { flex: 1, fontSize: 13, color: VictoriaColors.textOnLight },
  opciones: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(28, 53, 45, 0.12)',
  },
  opcion: { paddingVertical: 9, paddingHorizontal: 18 },
  opcionActiva: { backgroundColor: VictoriaColors.mutedGreen },
  opcionTexto: { fontSize: 13, color: VictoriaColors.textOnLight },
  opcionTextoActiva: { color: VictoriaColors.white, fontWeight: '600' },

  boton: {
    backgroundColor: VictoriaColors.darkGreen,
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  botonExito: { backgroundColor: '#2e7d43' },
  botonDeshabilitado: { opacity: 0.55 },
  botonFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  botonTexto: { color: VictoriaColors.white, fontSize: 13, fontWeight: '600' },
  errorForm: { color: '#b3261e', fontSize: 12 },

  comentTitulo: { fontSize: 28, color: VictoriaColors.darkGreen },
  comentInput: {
    backgroundColor: 'rgba(143, 164, 126, 0.35)',
    borderRadius: 20,
    padding: 14,
    minHeight: 76,
    fontSize: 13,
    color: VictoriaColors.textOnLight,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  } as never,
  contador: { fontSize: 11, color: '#556b5c', textAlign: 'right' },
  comentario: {
    backgroundColor: 'rgba(143, 164, 126, 0.35)',
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },
  comentCabecera: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: VictoriaColors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: VictoriaColors.white, fontSize: 13, fontWeight: '700' },
  comentAutor: { fontSize: 14, color: VictoriaColors.textOnLight },
  comentFecha: { fontSize: 10, color: '#556b5c' },
  comentTexto: { fontSize: 12, color: VictoriaColors.textOnLight, lineHeight: 18 },
  sinComentarios: { fontSize: 12, color: '#556b5c' },
});