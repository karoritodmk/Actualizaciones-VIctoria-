/**
 * Estilos de components/victoria/TarjetaFecha.tsx
 * (extraídos del .tsx para mantener la pantalla ordenada).
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 522 / 860,
    backgroundColor: '#f5f5f5',
    borderRadius: 40,
    overflow: 'hidden',
  },
  circulo: {
    position: 'absolute',
    left: '20%',
    top: '30%',
    width: '65%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#1f4a2d',
  },
  iconoWrap: {
    position: 'absolute',
    left: '52.6%',
    right: '15%',
    top: '30%',
    height: '39.5%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icono: {
    width: '100%',
    aspectRatio: 1,
  },
  mancha: {
    position: 'absolute',
    left: '17%',
    top: '33%',
    width: '34%',
    height: '42%',
    borderRadius: 999,
    backgroundColor: '#2f5a3f',
  },
  panel: {
    position: 'absolute',
    left: '5.6%',
    top: '3.3%',
    bottom: '3.1%',
    width: '47%',
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: 'rgba(245, 247, 244, 0.6)',
    alignItems: 'center',
    paddingTop: '6%',
  },
  mes: {
    color: '#111111',
    fontWeight: '300',
  },
  anio: {
    color: '#8a8a8a',
    fontWeight: '300',
  },
});
