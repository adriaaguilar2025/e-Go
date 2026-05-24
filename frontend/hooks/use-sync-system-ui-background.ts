import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useScreenTheme } from '@/hooks/use-screen-theme';

/** Keeps the native root window color in sync with app theme (avoids pure black bleed on Android). */
export function useSyncSystemUiBackground() {
  const { containerBg } = useScreenTheme();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    SystemUI.setBackgroundColorAsync(containerBg).catch(() => {
      // Ignore — non-fatal if SystemUI is unavailable.
    });
  }, [containerBg]);
}
