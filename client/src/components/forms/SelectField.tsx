import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { colors, palette, radius, spacing } from '../../utils/theme';

interface Props {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string; // heading of the list that opens
}

/** Looks like a text field; tapping it opens a list to pick one option from. */
export const SelectField: React.FC<Props> = ({ value, options, onChange, placeholder = 'Select', title = 'Choose one' }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${value || 'Nothing selected'}`}
        style={styles.field}
      >
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Icon source="chevron-down" size={20} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* the inner Pressable keeps taps on the list from closing it */}
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.title}>{title}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    style={[styles.option, selected && styles.optionSelected]}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{item}</Text>
                    {selected && <Icon source="check" size={18} color={colors.primary} />}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
    minHeight: 56,
    paddingHorizontal: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  value: { flex: 1, fontSize: 16, color: colors.text },
  placeholder: { color: colors.textMuted },

  backdrop: { flex: 1, backgroundColor: palette.overlay, justifyContent: 'center', padding: spacing.lg },
  sheet: { maxHeight: '75%', backgroundColor: palette.white, borderRadius: radius.md, paddingVertical: spacing.sm },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  optionSelected: { backgroundColor: palette.accentWash },
  optionText: { flex: 1, fontSize: 15, color: colors.text },
  optionTextSelected: { fontWeight: '700', color: colors.primary },
});
