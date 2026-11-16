import React from 'react';
import { DefaultTheme, NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { useRole } from '../context/RoleContext';
import { NotificationBanner } from '../components/notifications/NotificationBanner';
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

const navigationRef = createNavigationContainerRef();

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
    <>
      <NavigationContainer ref={navigationRef} key={role} theme={transparentNavTheme}>
        {isCounsellor ? <CounsellorStackNavigator /> : <StudentStackNavigator />}
      </NavigationContainer>
      {/* New-notification banner, drawn above whatever screen is open */}
      <NotificationBanner
        onOpen={() => {
          if (navigationRef.isReady()) navigationRef.navigate('Notifications' as never);
        }}
      />
    </>
  );
};
