import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { colors } from '../../utils/theme';

interface PeriodNavigatorProps {
  label: string;
  meta: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const StepButton: React.FC<{
  icon: 'chevron-back' | 'chevron-forward';
  disabled: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}> = ({ icon, disabled, onPress, accessibilityLabel }) => (
  <TouchableOpacity
    style={[styles.stepBtn, disabled && styles.stepBtnDisabled]}
    onPress={onPress}
    disabled={disabled}
    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ disabled }}
  >
    <Ionicons name={icon} size={18} color={colors.primary} />
  </TouchableOpacity>
);

/** "‹  Nov 10 – 16 · 6 days logged  ›" card for stepping between periods. */
export const PeriodNavigator: React.FC<PeriodNavigatorProps> = ({
  label,
  meta,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}) => (
  <Card style={styles.card}>
    <StepButton icon="chevron-back" disabled={!canGoPrev} onPress={onPrev} accessibilityLabel="Previous period" />
    <View style={styles.center} accessible accessibilityLabel={`${label}, ${meta}`}>
      <Text style={styles.label}>{label}</Text>
    </View>
    <StepButton icon="chevron-forward" disabled={!canGoNext} onPress={onNext} accessibilityLabel="Next period" />
  </Card>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  stepBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { opacity: 0.3 },
  center: { alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted },
});
