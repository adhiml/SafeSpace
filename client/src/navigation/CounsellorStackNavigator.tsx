import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatScreen } from '../screens/consultation/ChatScreen';
import { SettingsWrapper } from '../screens/shared/SettingsWrapper';
import { CounsellorStackParamList } from '../types';
import { CounsellorTabNavigator } from './CounsellorTabNavigator';

const Stack = createNativeStackNavigator<CounsellorStackParamList>();

export const CounsellorStackNavigator: React.FC = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="CounsellorTabs">
      <Stack.Screen name="CounsellorTabs" component={CounsellorTabNavigator} />
      <Stack.Screen name="Settings" component={SettingsWrapper} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
);
