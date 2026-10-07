import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, View } from 'react-native';

import { VictoriaNavbar } from '@/components/victoria/navbar';
import { cerrarSesion } from '@/lib/auth';
import { NOTCH_WIDTH, styles } from './screen-shell.styles';

/**
 * Equivalente a <body class="dashboard-body"> + <header class="app-navbar">
 * + <main class="container main-content-shift"><div class="glass-viewport-wrapper">
 * de templates/base.html.
 *
 * El panel de cristal ocupa SIEMPRE el alto restante de la pantalla (debajo
 * del navbar). Si el contenido es más largo, el scroll ocurre dentro del
 * panel; el panel nunca crece ni se encoge.
 */
export function VictoriaScreenShell({ children }: { children: React.ReactNode }) {
  const viewportWrapRef = useRef<View>(null);
  const [notchLeft, setNotchLeft] = useState<number | null>(64);

  // Convierte el X absoluto del tab activo (medido por el navbar) en un
  // "left" relativo al contenedor del panel, para poder usarlo en un
  // View con position:absolute dentro de ese contenedor.
  const handleActiveTabMeasure = useCallback((tabCenterX: number) => {
    if (Platform.OS !== 'web') return;
    const el = viewportWrapRef.current as unknown as HTMLElement | null;
    if (!el || typeof el.getBoundingClientRect !== 'function') return;
    const wrapRect = el.getBoundingClientRect();
    setNotchLeft(tabCenterX - wrapRect.left - NOTCH_WIDTH / 2);
  }, []);

  async function handleLogout() {
    await cerrarSesion();
    router.replace('/login');
  }

  const panelContent = (
    <ScrollView style={styles.innerScroll} contentContainerStyle={styles.innerScrollContent}>
      {children}
    </ScrollView>
  );

  return (
    <View style={styles.body}>
      {/* Capa de fondo fija: siempre del tamaño de la ventana. */}
      <View style={styles.bgLayer} pointerEvents="none">
        <Image
          source={require('@/assets/images/victoria/dashboard-bg.jpg')}
          style={styles.bgImage}
        />
      </View>

      <VictoriaNavbar onActiveTabMeasure={handleActiveTabMeasure} />

      <View style={styles.main}>
        <View style={styles.mainContent}>
          <View style={styles.viewportWrap} ref={viewportWrapRef}>
            {Platform.OS === 'web' ? (
              <View
                style={[
                  styles.notch,
                  { left: notchLeft },
                  // backdropFilter pasado como objeto plano inline: dentro
                  // de StyleSheet.create a veces no sobrevive la
                  // conversión a CSS en web.
                  { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as object,
                ]}
              />
            ) : null}

            {Platform.OS === 'web' ? (
              <View
                style={[
                  styles.viewport,
                  { backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)' } as object,
                ]}>
                {panelContent}
              </View>
            ) : (
              <BlurView intensity={40} tint="light" style={styles.viewport}>
                {panelContent}
              </BlurView>
            )}
          </View>
        </View>
      </View>

      {/* Botón de cerrar sesión: afuera del panel, esquina inferior izquierda. */}
      <Pressable
        style={styles.logoutBtn}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión">
        <Ionicons name="log-out-outline" size={22} color="#ffffff" />
      </Pressable>
    </View>
  );
}
