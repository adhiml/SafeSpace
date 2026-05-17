import React, { useCallback, useEffect } from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMood } from '../context/MoodContext';
import { ChatScreen } from '../screens/consultation/ChatScreen';
import { JournalEditorScreen } from '../screens/journal/JournalEditorScreen';
import { MoodCheckInScreen } from '../screens/mood/MoodCheckInScreen';
import { StressCausesScreen } from '../screens/mood/StressCausesScreen';
import { NotificationsScreen } from '../screens/settings/NotificationsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { RootStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { needsCheckIn, refreshMoods } = useMood();

  const openCheckInIfNeeded = useCallback(() => {
    if (needsCheckIn && navigationRef.isReady()) {
      navigationRef.navigate('MoodCheckIn');
    }
  }, [needsCheckIn]);

  // Load moods in background — do not block the UI on API/network
  useEffect(() => {
    refreshMoods().catch(() => undefined);
  }, [refreshMoods]);

  useEffect(() => {
    openCheckInIfNeeded();
  }, [openCheckInIfNeeded]);

  return (
    <NavigationContainer ref={navigationRef} onReady={openCheckInIfNeeded}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Main">
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
        <Stack.Screen name="StressCauses" component={StressCausesScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="JournalEditor" component={JournalEditorScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
