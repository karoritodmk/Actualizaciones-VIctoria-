/**
 * Estilos de app/victoria/coordinador/fichas/[idFicha]/aprendices/[idAprendiz]/index.tsx
 * (misma tarjeta que el perfil del instructor + la sección ampliable).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors, VictoriaRadius } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  loader: { marginTop: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: VictoriaRadius.card,
    padding: 22,
    width: '100%',
    maxWidth: 520,
    gap: 10,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: VictoriaColors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombre: { fontSize: 22, color: VictoriaColors.black, flexShrink: 1 },
  subRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subLinea: { fontSize: 12, color: '#666666' },
  chevron: { padding: 4 },
  actualmente: { fontSize: 13, fontWeight: '600', color: VictoriaColors.textOnLight, marginTop: 4 },
  actualmenteSecundario: { fontSize: 11, color: '#666666', marginTop: -6 },
  sinDato: { fontSize: 12, color: 'rgba(0,0,0,0.4)', fontStyle: 'italic' },
  divisor: { height: 1, backgroundColor: 'rgba(28, 53, 45, 0.12)', marginVertical: 2 },
  detalleLinea: { fontSize: 13, color: VictoriaColors.black },
  contactoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  contactoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: VictoriaColors.darkGreen,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: VictoriaRadius.pill,
  },
  contactoPillClaro: { backgroundColor: VictoriaColors.mutedGreen },
  contactoPillText: { color: VictoriaColors.white, fontSize: 11, fontWeight: '600' },
  contactoPillTextClaro: { color: VictoriaColors.textOnLight, fontSize: 11, fontWeight: '600' },

  hojaVidaBlock: { marginTop: 8 },
  hojaVidaLabel: { fontSize: 12, fontWeight: '600', color: '#555555', marginBottom: 8 },
  hojaVidaRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  hojaVidaThumb: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: 'rgba(28, 53, 45, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hojaVidaAcciones: { gap: 8 },
  hojaVidaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: VictoriaColors.darkGreen,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: VictoriaRadius.pill,
  },
  hojaVidaBtnClaro: { backgroundColor: 'rgba(28, 53, 45, 0.08)' },
  hojaVidaBtnText: { color: VictoriaColors.white, fontSize: 11, fontWeight: '600' },
  hojaVidaBtnTextClaro: { color: VictoriaColors.textOnLight, fontSize: 11, fontWeight: '600' },

  // --- Información ampliada (se despliega con la flecha) ---
  ampliada: { gap: 14, marginTop: 4 },
  seccionTitulo: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: VictoriaColors.mutedGreen,
    textTransform: 'uppercase',
  },
  seccion: { gap: 8 },
  dato: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 6 },
  datoEtiqueta: { fontSize: 12, color: '#666666', minWidth: 118 },
  datoValor: { fontSize: 13, color: VictoriaColors.black, flexShrink: 1, flex: 1 },
});
