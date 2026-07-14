import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { colors, radius } from '../utils/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  mode?: 'contained' | 'outlined' | 'text';
  color?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  loading,
  mode = 'contained',
  color,
}) => (
  <Button
    mode={mode}
    onPress={onPress}
    loading={loading}
    style={styles.btn}
    labelStyle={styles.label}
    buttonColor={mode === 'contained' ? color || colors.primary : undefined}
    textColor={mode === 'outlined' || mode === 'text' ? color || colors.textMuted : '#fff'}
  >
    {label}
  </Button>
);

const styles = StyleSheet.create({
  btn: { borderRadius: radius.md, marginVertical: 4 , marginBottom: 10},
  label: { fontWeight: '600', paddingVertical: 4 },
});
