import { View } from 'react-native';

/** Logo "V" de Victoria hecho con vistas normales (sin imágenes ni librerías). Se usa en los estados vacíos. */
export function LogoV({ size = 96 }: { size?: number }) {
  const escala = size / 96;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 22.8 * escala,
          top: 7 * escala,
          width: 22 * escala,
          height: 70 * escala,
          borderRadius: 11 * escala,
          backgroundColor: '#1F5A33',
          transform: [{ rotate: '-24deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 51.2 * escala,
          top: 7 * escala,
          width: 22 * escala,
          height: 70 * escala,
          borderRadius: 11 * escala,
          backgroundColor: '#4E9B68',
          transform: [{ rotate: '24deg' }],
        }}
      />
    </View>
  );
}
