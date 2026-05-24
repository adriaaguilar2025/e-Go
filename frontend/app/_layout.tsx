// Layout raíz: tema, tabs (Home, Explorar) y pantalla de login
import '@/i18n/i18n';
import i18n from '@/i18n/i18n';
import { I18nextProvider } from 'react-i18next';
import { I18nLocaleHydrator } from '@/i18n/I18nLocaleHydrator';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { GoogleAdsBootstrap } from '@/components/ads/GoogleAdsBootstrap';
import { AuthProvider } from '@/contexts/AuthContext';
import { ChargingProvider } from '@/contexts/ChargingContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ColorblindPreferenceProvider } from '@/contexts/ColorblindPreferenceContext';
import { ThemePreferenceProvider } from '@/contexts/ThemePreferenceContext';
import { getSemanticColors } from '@/constants/accessibilityColors';
import { buildNavigationTheme } from '@/constants/screenTheme';
import { useColorblindPreference } from '@/contexts/ColorblindPreferenceContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSyncSystemUiBackground } from '@/hooks/use-sync-system-ui-background';
import { useMemo } from 'react';

// expo-keep-awake (usado por herramientas de desarrollo) puede rechazar la promesa si la
// pantalla estuvo apagada o el activity no estaba listo; no afecta a producción.
if (__DEV__) {
  LogBox.ignoreLogs([/keep awake/i]);
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    // Afegim style={{ flex: 1 }} al GestureHandler perquè ocupi tota la pantalla correctament
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <I18nLocaleHydrator>
            <ThemePreferenceProvider>
              <ColorblindPreferenceProvider>
                <RootLayoutContent />
              </ColorblindPreferenceProvider>
            </ThemePreferenceProvider>
          </I18nLocaleHydrator>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { colorblindFriendly } = useColorblindPreference();
  useSyncSystemUiBackground();
  const navigationTheme = useMemo(
    () => buildNavigationTheme(isDark, getSemanticColors(colorblindFriendly)),
    [isDark, colorblindFriendly]
  );

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <GoogleAdsBootstrap />
        <ChargingProvider>
          <ThemeProvider value={navigationTheme}>
            <View style={{ flex: 1, backgroundColor: navigationTheme.colors.background }}>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: navigationTheme.colors.background },
              }}
            >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="my-favorite-stations" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="admin-login" options={{ headerShown: false }} />
            <Stack.Screen name="company-login" options={{ headerShown: false }} />
            <Stack.Screen name="admin-home" options={{ headerShown: false }} />
            <Stack.Screen name="company-home" options={{ headerShown: false }} />
            <Stack.Screen name="company-requests" options={{ headerShown: false }} />
            <Stack.Screen name="admin-requests" options={{ headerShown: false }} />
            <Stack.Screen name="admin-station-new" options={{ headerShown: false }} />
            <Stack.Screen name="company-station-new" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            </View>
          </ThemeProvider>
        </ChargingProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}