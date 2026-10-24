/**
 * Estilos de components/victoria/drive-explorer.tsx
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors, VictoriaRadius } from '@/constants/victoria-theme';

const COL_FECHA = 130;
const COL_POR = 130;
const COL_ARCH = 90;

export const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  eyebrow: { fontSize: 11, color: 'rgba(255, 255, 255, 0.85)', marginBottom: 6 },
  title: { fontSize: 34, fontWeight: '300', color: VictoriaColors.white, marginBottom: 6 },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: VictoriaColors.darkerGreen,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: VictoriaRadius.pill,
  },
  actionBtnLight: { backgroundColor: 'rgba(255, 255, 255, 0.22)' },
  actionText: { color: VictoriaColors.white, fontWeight: '600', fontSize: 12 },
  actionDisabled: { opacity: 0.55 },

  crumbs: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 12, marginLeft: 14 },
  crumb: { fontSize: 11, color: 'rgba(255, 255, 255, 0.85)' },
  crumbActive: { fontWeight: '700', color: VictoriaColors.white },

  aviso: { color: '#ffd7d7', fontSize: 12, marginBottom: 8, marginLeft: 14 },
  loader: { marginTop: 24 },

  table: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 22,
    minHeight: 300,
    overflow: 'hidden',
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 53, 45, 0.25)',
  },
  th: { paddingVertical: 14 },
  cellNombre: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 },
  cellFecha: { width: COL_FECHA, alignItems: 'center' },
  cellPor: { width: COL_POR, alignItems: 'center' },
  cellArch: { width: COL_ARCH, alignItems: 'center' },
  cellDel: { width: 34, alignItems: 'flex-end' },
  thText: { fontSize: 11, color: VictoriaColors.textOnLight, flexDirection: 'row' },
  thBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  icono: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#3b5d49',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombre: { fontSize: 12, color: VictoriaColors.black, flexShrink: 1 },
  celda: { fontSize: 11, color: VictoriaColors.textOnLight },
  vacio: { padding: 28, textAlign: 'center', color: 'rgba(28, 53, 45, 0.6)', fontSize: 12 },

  // Modales (nueva carpeta / confirmar borrado)
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(236, 241, 233, 0.94)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: VictoriaColors.darkGreen },
  modalText: { fontSize: 13, color: VictoriaColors.textOnLight },
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
  modalError: { color: '#b3261e', fontSize: 12 },
  modalRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 4 },
  btn: {
    backgroundColor: VictoriaColors.mutedGreen,
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 11,
    paddingHorizontal: 22,
  },
  btnGhost: { backgroundColor: 'rgba(28, 53, 45, 0.08)' },
  btnDanger: { backgroundColor: '#a63d3d' },
  btnText: { color: VictoriaColors.white, fontWeight: '600', fontSize: 13 },
  btnGhostText: { color: VictoriaColors.textOnLight, fontWeight: '600', fontSize: 13 },
});