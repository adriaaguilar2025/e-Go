import { Stack } from 'expo-router';
import { useMemo } from 'react';

import { useScreenTheme } from '@/hooks/use-screen-theme';

/** Native stack wrapper so the car tab gets the same themed backdrop as `/filters`. */
export default function CarTabLayout() {
  const theme = useScreenTheme();
  const contentStyle = useMemo(
    () => ({ backgroundColor: theme.containerBg }),
    [theme.containerBg]
  );

  return <Stack screenOptions={{ headerShown: false, contentStyle }} />;
}
