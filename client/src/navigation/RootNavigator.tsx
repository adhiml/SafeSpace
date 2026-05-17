import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useRole } from '../context/RoleContext';
import { RoleSelectScreen } from '../screens/role/RoleSelectScreen';
import { CounsellorStackNavigator } from './CounsellorStackNavigator';
import { StudentStackNavigator } from './StudentStackNavigator';

/** Remounts navigation on role change via key — prevents UI leakage between roles */
export const RootNavigator: React.FC = () => {
  const { role, isCounsellor } = useRole();

  if (!role) {
    return <RoleSelectScreen />;
  }

  return (
    <NavigationContainer key={role}>
      {isCounsellor ? <CounsellorStackNavigator /> : <StudentStackNavigator />}
    </NavigationContainer>
  );
};
