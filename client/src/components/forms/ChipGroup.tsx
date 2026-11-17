import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, palette, radius, spacing } from '../../utils/theme';

interface Props {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  /** Text shown on a chip, when it should differ from the stored value (e.g. "Year 1"). */
  labelFor?: (option: string) => string;
}

/** A row of tappable chips where exactly one can be chosen. */
export const ChipGroup: React.FC<Props> = ({ options, value, onChange, labelFor }) => (
  <View style={styles.row}>
    {options.map((option) => {
      const selected = option === value;
      return (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          accessibilityRole="radio"
          accessibilityState={{ selected }}
          style={[styles.chip, selected && styles.chipSelected]}
        >
          <Text style={[styles.text, selected && styles.textSelected]}>{labelFor ? labelFor(option) : option}</Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 13, color: colors.text, fontWeight: '600' },
  textSelected: { color: palette.white },
});
