/**
 * Estilos de app/victoria/portafolio/[categoria]/[subcarpeta]/index.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';
import { VictoriaColors } from '@/constants/victoria-theme';

export const styles = StyleSheet.create({
  loader: { marginVertical: 30 },
  error: { color: '#ff8a8a', marginBottom: 12 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 10,
    position: 'relative',
    zIndex: 10,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
  },
  crumb: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'none',
  },
  crumbSep: { fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' },
  crumbActual: { fontSize: 12, fontWeight: '700', color: VictoriaColors.white },
  nuevoContenedor: {
    position: 'relative',
    alignItems: 'flex-end',
    zIndex: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: VictoriaColors.darkGreen,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 50,
  },
  uploadButtonText: {
    color: VictoriaColors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  menu: {
    position: 'absolute',
    top: 46,
    right: 0,
    minWidth: 170,
    backgroundColor: VictoriaColors.darkGreen,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    zIndex: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  menuTexto: {
    color: VictoriaColors.white,
    fontSize: 13,
    fontWeight: '500',
  },
  menuLinea: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  table: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 320,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tableArrastrando: {
    borderColor: VictoriaColors.darkGreen,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  headerNombre: { paddingLeft: 40 },
  vacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 6,
  },
  vacioTitulo: {
    fontSize: 18,
    color: VictoriaColors.black,
    marginTop: 16,
  },
  vacioTexto: {
    fontSize: 12,
    color: '#666666',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  folderIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: VictoriaColors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: VictoriaColors.mutedGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: VictoriaColors.black,
    flexShrink: 1,
  },
  rowText: {
    fontSize: 13,
    color: '#555555',
  },
  colNombre: { flex: 3 },
  colDato: { flex: 1.2, textAlign: 'center' },

  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalTarjeta: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(238, 243, 238, 0.97)',
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  modalCerrar: {
    position: 'absolute',
    top: 14,
    right: 16,
    padding: 4,
  },
  modalTitulo: {
    fontSize: 24,
    fontWeight: '700',
    color: VictoriaColors.black,
  },
  modalSubtitulo: {
    fontSize: 11,
    color: '#555555',
    marginTop: 2,
    marginBottom: 18,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 18,
    fontSize: 13,
    color: VictoriaColors.black,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    ...({ outlineStyle: 'none' } as object),
  },
  modalError: {
    color: '#b33a3a',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  modalBoton: {
    marginTop: 14,
    backgroundColor: VictoriaColors.darkGreen,
    borderRadius: 50,
    paddingVertical: 9,
    paddingHorizontal: 26,
  },
  modalBotonInactivo: {
    backgroundColor: VictoriaColors.mutedGreen,
    opacity: 0.7,
  },
  modalBotonTexto: {
    color: VictoriaColors.white,
    fontSize: 13,
    fontWeight: '600',
  },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
