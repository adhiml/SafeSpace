import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, radius, spacing } from '../utils/theme';

interface Props {
  text: string;
  title?: string;
  size?: number;
}

/** Small ⓘ icon that opens a short explanation, so help text doesn't crowd the screen. */
export const InfoTip: React.FC<Props> = ({ text, title = 'Good to know', size = 16 }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="More information"
      >
        <Ionicons name="information-circle-outline" size={size} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={() => undefined}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.text}>{text}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={8} style={styles.close}>
              <Text style={styles.closeText}>Got it</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: palette.overlay, justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: palette.white, borderRadius: radius.md, padding: spacing.lg },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  text: { fontSize: 14, lineHeight: 20, color: palette.textSoft },
  close: { alignSelf: 'flex-end', marginTop: spacing.md },
  closeText: { fontSize: 14, fontWeight: '700', color: colors.secondary },
});
