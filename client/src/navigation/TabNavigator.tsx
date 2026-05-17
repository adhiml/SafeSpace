import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MoodHomeScreen } from '../screens/mood/MoodHomeScreen';
import { PeerSupportScreen } from '../screens/peer/PeerSupportScreen';
import { JournalScreen } from '../screens/journal/JournalScreen';
import { ConsultationScreen } from '../screens/consultation/ConsultationScreen';
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { RootTabParamList } from '../types';
import { colors, radius, spacing } from '../utils/theme';

const Tab = createBottomTabNavigator<RootTabParamList>();

const tabIcons: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Mood: 'happy-outline',
  PeerSupport: 'people-outline',
  Journal: 'book-outline',
  Consultation: 'chatbubbles-outline',
  Insights: 'stats-chart-outline',
};

export const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => (
        <Ionicons name={tabIcons[route.name]} size={size} color={color} />
      ),
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabLabel,
      tabBarActiveBackgroundColor: colors.primaryLight,
    })}
  >
    <Tab.Screen name="Mood" component={MoodHomeScreen} />
    <Tab.Screen name="PeerSupport" component={PeerSupportScreen} options={{ tabBarLabel: 'Peer' }} />
    <Tab.Screen name="Journal" component={JournalScreen} />
    <Tab.Screen name="Consultation" component={ConsultationScreen} options={{ tabBarLabel: 'Consult' }} />
    <Tab.Screen name="Insights" component={InsightsScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    paddingBottom: 6,
    paddingTop: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
