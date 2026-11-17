import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useRole } from '../context/RoleContext';
import { colors, palette, radius, spacing } from '../utils/theme';
import { VerifyEmailModal } from './verification/VerifyEmailModal';

// The gentle two-week reminder can be closed; it stays closed until the app is reopened.
let reminderDismissed = false;

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

/**
 * A slim notice shown on every screen when it matters:
 *  - the last two weeks before verification runs out: a reminder with "Verify now"
 *  - after it ran out: the account is read-only, with "Verify now" to fix it
 */
export const AccountBanner: React.FC = () => {
  const { account, refreshAccount } = useRole();
  const [open, setOpen] = useState(false);
  const [, rerender] = useState(0);

  if (!account) return null;

  const expired = account.state === 'expired';
  const reminder = account.state === 'active' && account.renew_soon && !reminderDismissed;
  if (!expired && !reminder) return null;

  const until = formatDate(account.verified_until);
  const days = account.days_left ?? 0;

  return (
    <>
      <View style={[styles.banner, expired ? styles.expired : styles.reminder]} accessibilityRole="alert">
        <Icon
          source={expired ? 'lock-outline' : 'calendar-alert'}
          size={16}
          color={expired ? palette.warnText : colors.primary}
        />
        <View style={styles.body}>
          <Text style={[styles.text, expired ? styles.expiredText : styles.reminderText]}>
            {expired
              ? `Read-only: your email verification expired${until ? ` on ${until}` : ''}. You can view what was there before, but can't add or change anything until you verify again.`
              : `Your email verification ends in ${days} day${days === 1 ? '' : 's'}${until ? ` (${until})` : ''}. Verify now to keep your account active.`}
          </Text>
          <Pressable onPress={() => setOpen(true)} hitSlop={8} style={styles.button} accessibilityRole="button">
            <Text style={styles.buttonText}>Verify now</Text>
          </Pressable>
        </View>
        {!expired && (
          <Pressable
            onPress={() => {
              reminderDismissed = true;
              rerender((n) => n + 1);
            }}
            hitSlop={10}
            accessibilityLabel="Dismiss reminder"
          >
            <Icon source="close" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <VerifyEmailModal visible={open} onClose={() => setOpen(false)} onVerified={refreshAccount} />
    </>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
  },
  expired: { backgroundColor: palette.warnBg },
  reminder: { backgroundColor: palette.accentWash, borderWidth: 1, borderColor: palette.accentSoft },
  body: { flex: 1 },
  text: { fontSize: 12, lineHeight: 17 },
  expiredText: { color: palette.warnText },
  reminderText: { color: colors.text },
  button: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  buttonText: { color: palette.white, fontSize: 12, fontWeight: '700' },
});
