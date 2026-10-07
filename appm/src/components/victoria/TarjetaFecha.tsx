import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { styles } from './TarjetaFecha.styles';

// Icono que va en el centro del círculo verde
const ICONO_CENTRO = require('@/assets/images/victoria/v-logo.png');

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function fechaActual() {
  const hoy = new Date(); // calendario del dispositivo
  return { mes: MESES[hoy.getMonth()], anio: String(hoy.getFullYear()) };
}

/**
 * Tarjeta del login: el mes y el año salen del calendario del dispositivo.
 * Todo va en porcentajes, así que escala con el ancho (maxWidth).
 *
 * FIX Android/Fabric: en el primer render `ancho` vale 0, lo que producía
 * fontSize = 0 y tumbaba la app ("FontSize should be a positive value").
 * Ahora los textos solo se renderizan cuando ya hay un ancho medido, y
 * además el tamaño tiene un mínimo de 1.
 */
export function TarjetaFecha() {
  const [fecha, setFecha] = useState(fechaActual);
  const [ancho, setAncho] = useState(0);

  // Si la app queda abierta al cambiar de mes, se actualiza sola.
  useEffect(() => {
    const id = setInterval(() => setFecha(fechaActual()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.card} onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
      <View style={styles.circulo} />

      {/* Icono centrado en la parte visible del círculo */}
      <View style={styles.iconoWrap} pointerEvents="none">
        <Image source={ICONO_CENTRO} style={styles.icono} resizeMode="contain" />
      </View>

      <View style={styles.mancha} />

      <BlurView intensity={90} tint="light" style={styles.panel}>
        {ancho > 0 && (
          <>
            <Text
              style={[
                styles.mes,
                {
                  fontSize: Math.max(1, ancho * 0.17),
                  lineHeight: Math.max(1, ancho * 0.19),
                },
              ]}>
              {fecha.mes}
            </Text>
            <Text
              style={[
                styles.anio,
                {
                  fontSize: Math.max(1, ancho * 0.155),
                  lineHeight: Math.max(1, ancho * 0.17),
                },
              ]}>
              {fecha.anio}
            </Text>
          </>
        )}
      </BlurView>
    </View>
  );
}
