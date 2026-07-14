import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useRole } from '../context/RoleContext';
import { CounsellorStackNavigator } from './CounsellorStackNavigator';
import { StudentStackNavigator } from './StudentStackNavigator';
import AuthStackNavigator from './AuthStackNavigator';

const transparentNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent', 
  },
};

/** Remounts navigation on role change via key — prevents UI leakage between roles */
export const RootNavigator: React.FC = () => {
  const { role, isCounsellor } = useRole();

  if (!role) {
    return (
    <NavigationContainer theme={transparentNavTheme}>
            <AuthStackNavigator />
        </NavigationContainer>)
  }

  return (
    <NavigationContainer key={role} theme={transparentNavTheme}>
      {isCounsellor ? <CounsellorStackNavigator /> : <StudentStackNavigator />}
    </NavigationContainer>
  );
};
