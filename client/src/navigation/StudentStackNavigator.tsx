import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMood } from '../context/MoodContext';
import { ChatScreen } from '../screens/consultation/ChatScreen';
import { JournalEditorScreen } from '../screens/journal/JournalEditorScreen';
import { MoodCheckInScreen } from '../screens/mood/MoodCheckInScreen';
import { StressCausesScreen } from '../screens/mood/StressCausesScreen';
import { SettingsWrapper } from '../screens/shared/SettingsWrapper';
import { NotificationsScreen } from '../screens/settings/NotificationsScreen';
import { StudentStackParamList } from '../types';
import { StudentTabNavigator } from './StudentTabNavigator';

const Stack = createNativeStackNavigator<StudentStackParamList>();

export const StudentStackNavigator: React.FC = () => {
  const { refreshMoods } = useMood();

  useEffect(() => {
    refreshMoods().catch(() => undefined);
  }, [refreshMoods]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="StudentTabs">
      <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
      <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
      <Stack.Screen name="StressCauses" component={StressCausesScreen} />
      <Stack.Screen name="Settings" component={SettingsWrapper} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="JournalEditor" component={JournalEditorScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};
