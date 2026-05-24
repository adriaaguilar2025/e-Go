import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';

import { createFilterFormScreenStyles } from '@/constants/filterFormScreenStyles';
import type { ScreenTheme } from '@/constants/screenTheme';

type FilterFormScreenShellProps = {
  theme: ScreenTheme;
  testID?: string;
  header: ReactNode;
  headerCentered?: boolean;
  children: ReactNode;
};

/** Same root layout as `filters.tsx` (RN SafeAreaView + slate backdrop). */
export function FilterFormScreenShell({
  theme,
  testID,
  header,
  headerCentered = false,
  children,
}: FilterFormScreenShellProps) {
  const styles = useMemo(() => createFilterFormScreenStyles(theme), [theme.isDark, theme.sem]);

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      <View style={headerCentered ? styles.headerCentered : styles.header}>{header}</View>
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
