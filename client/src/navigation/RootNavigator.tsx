import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DefaultTheme, NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { useRole } from '../context/RoleContext';
import { NotificationBanner } from '../components/notifications/NotificationBanner';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { colors } from '../utils/theme';
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

/** Remounts navigation when a different user signs in, so nothing leaks between accounts. */
export const RootNavigator: React.FC = () => {
  const { role, isCounsellor, userId, restoring, account } = useRole();

  // A saved login is being checked with the server
  if (restoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!role) {
    return (
    <NavigationContainer theme={transparentNavTheme}>
            <AuthStackNavigator />
        </NavigationContainer>)
  }

  // Never verified: nothing in the app works yet, so this is the only screen they get.
  if (account?.state === 'unverified') return <VerifyEmailScreen />;

  return (
    <>
      <NavigationContainer ref={navigationRef} key={userId ?? role} theme={transparentNavTheme}>
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
