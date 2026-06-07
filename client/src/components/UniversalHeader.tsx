import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing } from '../utils/theme';

interface UniversalHeaderProps {
  title: string;
  isHome?: boolean;
  showActions?: boolean;
}

export const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  title,
  isHome = false,
  showActions = true,
}) => {
  const navigation = useNavigation();
  const displayTitle = isHome ? 'SafeSpace' : title;

  const openSettings = () => {
    const parent = navigation.getParent();
    if (parent?.navigate) {
      parent.navigate('Settings' as never);
    }
  };

  const openNotifications = () => {
    const parent = navigation.getParent();
    if (parent?.navigate) {
      parent.navigate('Notifications' as never);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.side} />
      <Text style={styles.title}>{displayTitle}</Text>
      <View style={[styles.side, styles.actions]}>
        {showActions && (
          <>
            <TouchableOpacity style={styles.iconBtn} onPress={openNotifications}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={openSettings}>
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
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    height: 56,
  },
  side: { width: 72 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  iconBtn: { padding: spacing.xs, marginLeft: spacing.xs },
});
