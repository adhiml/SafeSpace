import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { DeleteAccountSection } from '../../components/DeleteAccountSection';
import { EmailCodeForm } from '../../components/verification/EmailCodeForm';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRole } from '../../context/RoleContext';
import { maskEmail } from '../../utils/names';
import { colors, spacing } from '../../utils/theme';

/**
 * Shown instead of the app while an account has never been verified. Nothing else in the app
 * works until the emailed code is entered, so this is the only screen they get.
 */
export const VerifyEmailScreen: React.FC = () => {
  const { profile, refreshAccount, signOut } = useRole();

  return (
    <ScreenContainer title="Verify your email" showHeader={false}>
      <View style={styles.center}>
        <Icon source="email-check-outline" size={56} color={colors.primary} />
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.sub}>
          Enter the 6-digit code we emailed to {profile?.email ? maskEmail(profile.email) : 'your university email'}.
        </Text>

        {/* The first code is sent when the account is created. "Send a new code" is there if it didn't arrive. */}
        <EmailCodeForm onVerified={refreshAccount} />

        <PrimaryButton label="Sign out" onPress={() => void signOut()} mode="text" />

        {/* Typed something wrong at sign-up? Delete this account and register again. */}
        <DeleteAccountSection variant="link" />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: { paddingTop: spacing.xl, gap: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary, textAlign: 'center', marginTop: spacing.sm },
  sub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
});
