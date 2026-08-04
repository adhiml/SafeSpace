import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { colors } from '../utils/theme';

interface FloatingButtonProps {
  onPress: () => void;
  icon?: string;
  loading?: boolean;
  color?: string;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  icon = 'plus',
  loading,
  color = colors.primary,
}) => (
  <FAB
    icon={icon}
    loading={loading}
    onPress={onPress}
    style={[styles.floatingButton, { backgroundColor: color }]}
    color="#fff" // Icon color
  />
);

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
  },
});