import * as SystemUI from 'expo-system-ui';
import { useFocusEffect } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useScreenTheme } from '@/hooks/use-screen-theme';

/** Paints the native tab scene + root window with the app slate background. */
export function TabScreenLayout({ children }: { children: ReactNode }) {
  const { containerBg } = useScreenTheme();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') return;
      SystemUI.setBackgroundColorAsync(containerBg).catch(() => {
        // Non-fatal if SystemUI is unavailable.
      });
    }, [containerBg])
  );

  return <View style={[styles.root, { backgroundColor: containerBg }]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
