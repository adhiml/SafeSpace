import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatScreen } from '../screens/consultation/ChatScreen';
import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { CounsellorStackParamList } from '../types';
import { CounsellorTabNavigator } from './CounsellorTabNavigator';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { ChangePasswordScreen } from '../screens/shared/ChangePasswordScreen';
import { NotificationsScreen } from '../screens/notification/NotificationsScreen';

// // stack is within one "tab" or "main tabs (inside tab navigator)"
// // it is for screens that are not in the main tab but can be navigated to from the main tab

const Stack = createNativeStackNavigator<CounsellorStackParamList>();

export const CounsellorStackNavigator: React.FC = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="CounsellorTabs">
      <Stack.Screen name="CounsellorTabs" component={CounsellorTabNavigator} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Consult" component={ChatScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
);