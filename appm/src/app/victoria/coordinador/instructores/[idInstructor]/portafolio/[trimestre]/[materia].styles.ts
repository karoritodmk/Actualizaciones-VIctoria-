/**
 * Estilos de app/victoria/coordinador/instructores/[idInstructor]/portafolio/[trimestre]/[materia].tsx
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
    maxWidth: 520,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
    fontSize: 17,
    fontWeight: '700',
    color: VictoriaColors.black,
  },
  subLinea: {
    fontSize: 12,
    color: '#777777',
    marginTop: 2,
  },
  trimestreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(28, 53, 45, 0.08)',
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  trimestreBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: VictoriaColors.textOnLight,
  },
  descripcion: {
    fontSize: 13,
    color: '#444444',
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(28, 53, 45, 0.08)',
  },
  sinArchivos: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    fontStyle: 'italic',
  },
  archivosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  archivoCol: {
    width: 100,
    gap: 6,
  },
  archivoThumb: {
    width: 100,
    height: 76,
    borderRadius: 14,
    backgroundColor: 'rgba(28, 53, 45, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivoNombre: {
    fontSize: 11,
    color: '#444444',
  },
  archivoAcciones: {
    flexDirection: 'row',
    gap: 6,
  },
  archivoBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: VictoriaColors.darkGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivoBtnClaro: {
    backgroundColor: 'rgba(28, 53, 45, 0.1)',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  footerFecha: {
    fontSize: 11,
    color: '#888888',
  },
  archivosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(28, 53, 45, 0.08)',
    borderRadius: VictoriaRadius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  archivosBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: VictoriaColors.textOnLight,
  },
});

// Expo Router trata todo archivo dentro de src/app como una ruta y exige un
// export default. Esta pantalla NO se navega; el default solo evita el aviso.
export default styles;
