import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, TextInput } from 'react-native-paper';
import { useRole } from '../context/RoleContext';
import * as authService from '../services/authService';
import { colors, palette, radius, spacing } from '../utils/theme';

const STUDENT_LOSES = [
  'Your profile and anonymous name',
  'Your mood check-ins and journal entries',
  'Your peer posts',
  'Your consultation bookings and chats',
  'Your notifications',
];

const COUNSELLOR_LOSES = [
  'Your profile',
  'All your sessions and chats (they disappear for the students too)',
  'Your posts',
  'Your notifications',
];

interface Props {
  /** "row" is the full entry used on the profile screen; "link" is a small text link. */
  variant?: 'row' | 'link';
}

/** The delete-account entry point, its warning, and the password check that confirms it. */
export const DeleteAccountSection: React.FC<Props> = ({ variant = 'row' }) => {
  const { isCounsellor, endSession } = useRole();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setPassword('');
    setShowPassword(false);
    setError(null);
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await authService.deleteAccount(password);
      close();
      await endSession(); // back to the welcome screen
      Alert.alert('Account deleted', 'Your account and data have been removed. You can register again any time with your university email.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete your account.');
    } finally {
      setBusy(false);
    }
  };

  const loses = isCounsellor ? COUNSELLOR_LOSES : STUDENT_LOSES;

  return (
    <>
      {variant === 'row' ? (
        <Pressable onPress={() => setOpen(true)} style={styles.row} accessibilityRole="button" accessibilityLabel="Delete account">
          <Icon source="trash-can-outline" size={22} color={palette.cancelledText} />
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Delete account</Text>
            <Text style={styles.rowSub}>Permanently remove your account and all your data</Text>
          </View>
          <Icon source="chevron-right" size={22} color={colors.textMuted} />
        </Pressable>
      ) : (
        <Pressable onPress={() => setOpen(true)} hitSlop={8} style={styles.link} accessibilityRole="button">
          <Text style={styles.linkText}>Delete account</Text>
        </Pressable>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.backdrop} onPress={busy ? undefined : close}>
            {/* the inner Pressable keeps taps inside the sheet from closing it */}
            <Pressable style={styles.sheet} onPress={() => undefined}>
              <View style={styles.iconWrap}>
                <Icon source="alert-outline" size={28} color={palette.cancelledText} />
              </View>
              <Text style={styles.title}>Delete your account?</Text>

              <Text style={styles.lead}>This permanently deletes:</Text>
              {loses.map((item) => (
                <Text key={item} style={styles.bullet}>
                  {'•'}  {item}
                </Text>
              ))}

              <View style={styles.warning}>
                <Text style={styles.warningText}>
                  This can't be undone. You can register again later with the same university email, but none of your data will come back.
                </Text>
              </View>

              <Text style={styles.label}>Enter your password to confirm</Text>
              <TextInput
                mode="outlined"
                value={password}
                onChangeText={(v) => {
                  setError(null);
                  setPassword(v);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                outlineColor={colors.border}
                activeOutlineColor={palette.cancelledDot}
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setShowPassword((v) => !v)}
                    forceTextInputFocus={false}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  />
                }
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                onPress={confirm}
                disabled={busy || !password}
                style={[styles.delete, (busy || !password) && styles.deleteDisabled]}
                accessibilityRole="button"
              >
                <Text style={styles.deleteText}>{busy ? 'Deleting…' : 'Delete my account'}</Text>
              </Pressable>
              <Pressable onPress={close} disabled={busy} hitSlop={8} style={styles.cancel} accessibilityRole="button">
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: palette.cancelledText },
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  link: { alignSelf: 'center', paddingVertical: spacing.sm },
  linkText: { color: palette.cancelledText, fontSize: 13, fontWeight: '700' },

  backdrop: { flex: 1, backgroundColor: palette.overlay, justifyContent: 'center', padding: spacing.lg },
  sheet: { backgroundColor: palette.white, borderRadius: radius.md, padding: spacing.lg },
  iconWrap: {
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.cancelledBg,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  lead: { fontSize: 13, fontWeight: '700', color: palette.textSoft, marginBottom: spacing.xs },
  bullet: { fontSize: 13, color: palette.textSoft, lineHeight: 20 },
  warning: { backgroundColor: palette.cancelledBg, borderRadius: radius.sm, padding: spacing.sm + 2, marginTop: spacing.md },
  warningText: { fontSize: 12, lineHeight: 17, color: palette.cancelledText, fontWeight: '600' },
  label: { fontSize: 12, fontWeight: '600', color: colors.secondary, marginTop: spacing.md },
  input: { backgroundColor: colors.surface, marginTop: spacing.xs },
  error: { color: palette.cancelledText, fontSize: 13, fontWeight: '600', marginTop: spacing.sm, textAlign: 'center' },
  delete: {
    marginTop: spacing.md,
    paddingVertical: 14,
    borderRadius: radius.full,
    alignItems: 'center',
    backgroundColor: palette.cancelledDot,
  },
  deleteDisabled: { opacity: 0.45 },
  deleteText: { color: palette.white, fontSize: 14, fontWeight: '800' },
  cancel: { alignSelf: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  cancelText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
});
