/**
 * Estilos de app/victoria/coordinador/instructores/[idInstructor]/index.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaRadius, VictoriaColors } from '@/constants/victoria-theme';

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
    maxWidth: 460,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(28, 53, 45, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombre: {
    fontSize: 18,
    fontWeight: '700',
    color: VictoriaColors.black,
  },
  subLinea: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  especialidad: {
    fontSize: 13,
    fontWeight: '600',
    color: VictoriaColors.textOnLight,
  },
  detalleLinea: {
    fontSize: 12,
    color: '#555555',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 53, 45, 0.08)',
  },
  contactoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  contactoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: VictoriaColors.darkGreen,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: VictoriaRadius.pill,
  },
  contactoPillClaro: {
    backgroundColor: 'rgba(28, 53, 45, 0.08)',
  },
  contactoPillText: {
    color: VictoriaColors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  contactoPillTextClaro: {
    color: VictoriaColors.textOnLight,
    fontSize: 11,
    fontWeight: '600',
  },
  hojaVidaBlock: {
    marginTop: 12,
  },
  hojaVidaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 8,
  },
  hojaVidaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  hojaVidaThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: 'rgba(28, 53, 45, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hojaVidaAcciones: {
    gap: 8,
  },
  hojaVidaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: VictoriaColors.darkGreen,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: VictoriaRadius.pill,
  },
  hojaVidaBtnClaro: {
    backgroundColor: 'rgba(28, 53, 45, 0.08)',
  },
  hojaVidaBtnText: {
    color: VictoriaColors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  hojaVidaBtnTextClaro: {
    color: VictoriaColors.textOnLight,
    fontSize: 11,
    fontWeight: '600',
  },
  sinArchivo: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    fontStyle: 'italic',
  },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
