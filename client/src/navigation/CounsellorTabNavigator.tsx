import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { CounsellorHomeScreen } from '../screens/counsellor/CounsellorHomeScreen';
import { ExpertInsightsScreen } from '../screens/counsellor/ExpertInsightsScreen';
import { CounsellorMessagesScreen } from '../screens/counsellor/CounsellorMessagesScreen';
import { CounsellorInsightsScreen } from '../screens/counsellor/CounsellorInsightsScreen';
import { CounsellorTabParamList } from '../types';
import { colors, radius, spacing } from '../utils/theme';

const Tab = createBottomTabNavigator<CounsellorTabParamList>();

const icons: Record<keyof CounsellorTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  ExpertInsights: 'bulb-outline',
  Chat: 'mail-outline',
  Insights: 'stats-chart-outline',
};

export const CounsellorTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size, focused }) => (
        <>
          {focused && <Text style={styles.dot}>●</Text>}
          <Ionicons name={icons[route.name]} size={size} color={color} />
        </>
      ),
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabLabel,
    })}
  >
    <Tab.Screen name="Home" component={CounsellorHomeScreen} />
    <Tab.Screen name="ExpertInsights" component={ExpertInsightsScreen} options={{ tabBarLabel: 'Expert' }} />
    <Tab.Screen name="Chat" component={CounsellorMessagesScreen} />
    <Tab.Screen name="Insights" component={CounsellorInsightsScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    position: 'relative',
    left: spacing.md,
    right: spacing.md,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
  },
  tabLabel: { fontSize: 10, fontWeight: '600' },
  dot: { fontSize: 6, color: colors.secondary, position: 'absolute', top: -4 },
});
