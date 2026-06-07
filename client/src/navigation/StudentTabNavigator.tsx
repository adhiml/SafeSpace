import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { MoodHomeScreen } from '../screens/mood/MoodHomeScreen';
import { PeerSupportScreen } from '../screens/peer/PeerSupportScreen';
import { JournalScreen } from '../screens/journal/JournalScreen';
import { ConsultationScreen } from '../screens/consultation/ConsultationScreen';
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { StudentTabParamList } from '../types';
import { colors, radius, spacing } from '../utils/theme';

const Tab = createBottomTabNavigator<StudentTabParamList>();

const icons: Record<keyof StudentTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'happy-outline',
  PeerSupport: 'people-outline',
  Journal: 'book-outline',
  Consultation: 'chatbubbles-outline',
  Insights: 'stats-chart-outline',
};

export const StudentTabNavigator: React.FC = () => (
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
    <Tab.Screen name="Home" component={MoodHomeScreen} />
    <Tab.Screen name="PeerSupport" component={PeerSupportScreen} options={{ tabBarLabel: 'Peer' }} />
    <Tab.Screen name="Journal" component={JournalScreen} />
    <Tab.Screen name="Consultation" component={ConsultationScreen} options={{ tabBarLabel: 'Consult' }} />
    <Tab.Screen name="Insights" component={InsightsScreen} />
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
