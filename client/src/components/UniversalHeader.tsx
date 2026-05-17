import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../utils/theme';
import { RootStackParamList } from '../types';

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const displayTitle = isHome ? 'SafeSpace' : title;

  return (
    <View style={styles.container}>
      <View style={styles.side} />
      <Text style={styles.title}>{displayTitle}</Text>
      <View style={[styles.side, styles.actions]}>
        {showActions && (
          <>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Settings')}
            >
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
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
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
  iconBtn: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});
