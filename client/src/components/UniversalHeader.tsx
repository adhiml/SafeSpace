import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing } from '../utils/theme';

interface UniversalHeaderProps {
  title: string;
  isHome?: boolean;
  showActions?: boolean; // Add this line to your interface
}

export const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  title,
  isHome = false,
  showActions = true, // Default to true if not provided
}) => {
  const navigation = useNavigation();
  const displayTitle = isHome ? 'SafeSpace' : title;

  return (
    <View style={styles.container}>
      {/* Left side: Show a back arrow only if we are NOT on a main tab */}
      {/* <View style={styles.side}>
        {!showActions && navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View> */}

      {/* Center title: Always perfectly locked to center */}
      <Text style={styles.title} numberOfLines={1}>{displayTitle}</Text>

      {/* Right side: Show buttons only if we ARE on a main tab */}
      <View style={[styles.side, styles.actions]}>
        {showActions && (
          <>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications' as never)}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings' as never)}>
              <Ionicons name="settings-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#f3ebc4',
  },
  side: { width: 72 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'left',
    flex: 1,
  },
  iconBtn: { padding: spacing.xs, marginLeft: spacing.xs },
});

