import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UniversalHeader } from './UniversalHeader';
import { colors, spacing } from '../utils/theme';

interface ScreenContainerProps {
  title: string;
  isHome?: boolean;
  children: React.ReactNode;
  scroll?: boolean;
  showHeader?: boolean;
  hideHeaderActions?: boolean;
}

// export const ScreenContainer: React.FC<ScreenContainerProps> = ({
//   title,
//   isHome,
//   children,
//   scroll = true,
//   showHeader = true,
// }) => (
//   <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
//     {showHeader && <UniversalHeader title={title} isHome={isHome} />}
//     {scroll ? (
//       <ScrollView
//         style={styles.flex}
//         contentContainerStyle={styles.scroll}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.content}>{children}</View>
//       </ScrollView>
//     ) : (
//       <View style={[styles.flex, styles.content]}>{children}</View>
//     )}
//   </SafeAreaView>
// );

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  title,
  isHome,
  children,
  scroll = true,
  showHeader = true,
  hideHeaderActions = false
}) => (
  <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    {/* 
      If isHome is true, !isHome becomes false (so it DOES NOT hide actions).
      If isHome is missing/false, !isHome becomes true (so it HIDES actions).
    */}
    {showHeader && (
      <UniversalHeader 
        title={title} 
        isHome={isHome} 
        showActions={!hideHeaderActions}
      />
    )}
    
    {scroll ? (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>{children}</View>
      </ScrollView>
    ) : (
      <View style={[styles.flex, styles.content]}>{children}</View>
    )}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 100 },
  content: { padding: spacing.md , paddingTop: spacing.xs},
});
