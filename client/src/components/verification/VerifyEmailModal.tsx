import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { colors, palette, radius, spacing } from '../../utils/theme';
import { EmailCodeForm } from './EmailCodeForm';

interface Props {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void | Promise<void>;
}

/** The renewal pop-up: asking to renew emails a code straight away, and they type it in here. */
export const VerifyEmailModal: React.FC<Props> = ({ visible, onClose, onVerified }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}>
      {/* the inner Pressable keeps taps inside the sheet from closing it */}
      <Pressable style={styles.sheet} onPress={() => undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify your email</Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
            <Icon source="close" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
        <Text style={styles.sub}>We're emailing you a 6-digit code. Enter it below to renew your account for another year.</Text>
        {/* mounted only while open, so a code is sent each time they open it */}
        {visible ? <EmailCodeForm sendOnMount onVerified={async () => { await onVerified(); onClose(); }} /> : null}
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: palette.overlay, justifyContent: 'center', padding: spacing.lg },
  sheet: { backgroundColor: palette.white, borderRadius: radius.md, padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800', color: colors.primary },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.md, lineHeight: 18 },
});
