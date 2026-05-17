import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from '../utils/constants';
import { colors, radius, spacing } from '../utils/theme';

interface MoodSelectorBarProps {
  selectedLevel?: number;
  onSelect?: (level: number) => void;
  compact?: boolean;
}

export const MoodSelectorBar: React.FC<MoodSelectorBarProps> = ({
  selectedLevel,
  onSelect,
  compact = false,
}) => {
  const levels = [1, 2, 3, 4, 5];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {levels.map((level) => {
        const active = selectedLevel === level;
        return (
          <TouchableOpacity
            key={level}
            style={[
              styles.item,
              compact && styles.itemCompact,
              active && { backgroundColor: MOOD_COLORS[level], borderColor: MOOD_COLORS[level] },
            ]}
            onPress={() => onSelect?.(level)}
            disabled={!onSelect}
          >
            <Text style={styles.emoji}>{MOOD_EMOJIS[level]}</Text>
            {!compact && (
              <Text style={[styles.label, active && styles.labelActive]}>{MOOD_LABELS[level]}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: { paddingVertical: spacing.sm },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  itemCompact: { minWidth: 56, paddingHorizontal: spacing.sm },
  emoji: { fontSize: 24 },
  label: { marginTop: 4, fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  labelActive: { color: colors.surface },
});
