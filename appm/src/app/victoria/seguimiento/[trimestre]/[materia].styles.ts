/**
 * Estilos de app/victoria/seguimiento/[trimestre]/[materia].tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  loader: { marginVertical: 20 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  empty: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 50,
  },
  tabButtonActive: {
    backgroundColor: VictoriaColors.darkGreen,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },
  tabTextActive: {
    color: VictoriaColors.white,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: VictoriaColors.mutedGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: VictoriaColors.black,
  },
  summaryValueSuffix: {
    fontSize: 13,
    fontWeight: '400',
    color: '#666666',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  row: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 18,
  },
  mainCol: {
    gap: 6,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  taskDesc: {
    fontSize: 12,
    color: '#666666',
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  gradeChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
  gradeChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  comentario: {
    fontSize: 12,
    color: '#555555',
    fontStyle: 'italic',
    flexShrink: 1,
  },

  // Pestaña Promedios
  promediosWrap: {
    gap: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statCardNum: {
    fontSize: 22,
    fontWeight: '700',
  },
  statCardLabel: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  barrasCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
  },
  barrasTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: VictoriaColors.black,
  },
  barrasSubtitulo: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 16,
  },
  barrasLista: {
    gap: 14,
  },
  barraFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barraTitulo: {
    width: 110,
    fontSize: 12,
    color: '#333333',
  },
  barraPista: {
    flex: 1,
    height: 22,
    justifyContent: 'center',
    position: 'relative',
  },
  barraRellena: {
    height: 12,
    borderRadius: 6,
  },
  tooltip: {
    position: 'absolute',
    top: -46,
    left: 0,
    backgroundColor: 'rgba(20, 30, 25, 0.92)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  tooltipTitulo: {
    color: VictoriaColors.white,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 160,
  },
  tooltipTexto: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
  },
  ejeFila: {
    flexDirection: 'row',
    marginTop: 4,
  },
  ejeEspaciador: {
    width: 122,
  },
  ejeLinea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.15)',
    paddingTop: 4,
  },
  ejeNumero: {
    fontSize: 10,
    color: '#888888',
  },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
