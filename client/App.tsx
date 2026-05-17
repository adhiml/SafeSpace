import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { MoodProvider } from './src/context/MoodContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/utils/theme';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
  },
};

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider style={styles.root}>
        <PaperProvider theme={theme}>
          <MoodProvider>
            <View style={styles.root}>
              <RootNavigator />
            </View>
            <StatusBar style="dark" />
          </MoodProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
