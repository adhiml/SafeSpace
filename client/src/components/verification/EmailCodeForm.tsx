import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import * as authService from '../../services/authService';
import { colors, palette, spacing } from '../../utils/theme';
import { PrimaryButton } from '../PrimaryButton';

interface Props {
  /** Email a code as soon as the form appears (used when the user asked to renew). */
  sendOnMount?: boolean;
  /** Called after the server accepted the code. */
  onVerified: () => void | Promise<void>;
}

const CODE_LENGTH = 6;

/** Type the 6-digit code we emailed, or ask for a new one (with a countdown between requests). */
export const EmailCodeForm: React.FC<Props> = ({ sendOnMount, onVerified }) => {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds until another code may be requested
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  // Count the resend timer down once a second.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async () => {
    setSending(true);
    setError(null);
    setInfo(null);
    try {
      const sent = await authService.sendCode();
      setInfo(sent.message);
      setCooldown(sent.resend_after_seconds);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not send a code.';
      setError(message);
      // "Please wait 42 seconds..." -> show that countdown on the button as well
      const wait = message.match(/wait (\d+) second/);
      if (wait) setCooldown(Number(wait[1]));
    } finally {
      if (mounted.current) setSending(false);
    }
  };

  useEffect(() => {
    if (sendOnMount) void sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (code.length !== CODE_LENGTH) return setError(`Enter the ${CODE_LENGTH}-digit code.`);
    setVerifying(true);
    setError(null);
    try {
      await authService.verifyCode(code);
      await onVerified();
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : 'Could not verify the code.');
    } finally {
      if (mounted.current) setVerifying(false);
    }
  };

  return (
    <View>
      <TextInput
        mode="outlined"
        value={code}
        onChangeText={(v) => {
          setError(null);
          setCode(v.replace(/\D/g, '').slice(0, CODE_LENGTH)); // digits only, so pasting "123 456" works
        }}
        placeholder="000000"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={CODE_LENGTH}
        autoFocus
        onSubmitEditing={submit}
        contentStyle={styles.codeText}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        style={styles.input}
        accessibilityLabel="Verification code"
      />

      {info ? <Text style={styles.info}>{info}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {__DEV__ && <Text style={styles.devHint}>Development: the email is printed in the server terminal.</Text>}

      <PrimaryButton label={verifying ? 'Verifying…' : 'Verify'} onPress={submit} loading={verifying} disabled={verifying || code.length !== CODE_LENGTH} />

      <Pressable
        onPress={sendCode}
        disabled={sending || cooldown > 0}
        hitSlop={8}
        style={styles.resend}
        accessibilityRole="button"
      >
        <Text style={[styles.resendText, (sending || cooldown > 0) && styles.resendDisabled]}>
          {sending ? 'Sending…' : cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code'}
        </Text>
      </Pressable>
      <Text style={styles.note}>Codes last 10 minutes. Check your Junk or Spam folder if it doesn't arrive.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  input: { backgroundColor: colors.surface, marginBottom: spacing.sm },
  codeText: { textAlign: 'center', fontSize: 28, fontWeight: '700', letterSpacing: 10 },
  info: { color: palette.okText, fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: spacing.xs },
  error: { color: palette.cancelledText, fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: spacing.xs },
  devHint: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginBottom: spacing.xs },
  resend: { alignSelf: 'center', paddingVertical: spacing.sm },
  resendText: { color: colors.secondary, fontSize: 14, fontWeight: '700' },
  resendDisabled: { color: colors.textMuted },
  note: { color: colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 17 },
});
