import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { MoodProvider } from './src/context/MoodContext';
import { RoleProvider } from './src/context/RoleContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/utils/theme';
import { Background } from './src/components/Background';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
  },
};

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <Background>
            <RoleProvider>
              <MoodProvider>
                  <RootNavigator />
                <StatusBar style="dark" />
              </MoodProvider>
            </RoleProvider>
          </Background>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}