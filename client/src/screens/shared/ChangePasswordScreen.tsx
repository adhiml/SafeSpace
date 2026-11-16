import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as userService from '../../services/userService';
import { colors, palette, radius, spacing } from '../../utils/theme';

const MIN_LENGTH = 8; // same minimum the server enforces

export const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const edit = (setter: (v: string) => void) => (value: string) => {
    setError(null);
    setter(value);
  };

  // Live checks shown under the new-password field
  const longEnough = next.length >= MIN_LENGTH;
  const matches = confirm.length > 0 && next === confirm;
  const canSubmit = !!current && longEnough && matches && !saving;

  const submit = async () => {
    if (next === current) return setError('Your new password must be different from the current one.');
    try {
      setSaving(true);
      setError(null);
      await userService.changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      Alert.alert('Password changed', 'Your password has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change your password.');
    } finally {
      setSaving(false);
    }
  };

  // One eye icon toggles all three fields, so they always match.
  const eye = (
    <TextInput.Icon
      icon={visible ? 'eye-off-outline' : 'eye-outline'}
      onPress={() => setVisible((v) => !v)}
      forceTextInputFocus={false}
      accessibilityLabel={visible ? 'Hide passwords' : 'Show passwords'}
    />
  );

  return (
    <ScreenContainer title="password." scroll={false} hideHeaderActions>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <Text style={[styles.label, styles.firstLabel]}>Current password</Text>
            <TextInput
              mode="outlined"
              value={current}
              onChangeText={edit(setCurrent)}
              secureTextEntry={!visible}
              autoCapitalize="none"
              autoCorrect={false}
              right={eye}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />

            <Text style={styles.label}>New password</Text>
            <TextInput
              mode="outlined"
              value={next}
              onChangeText={edit(setNext)}
              secureTextEntry={!visible}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={128}
              right={eye}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
            <Text style={[styles.hint, next.length > 0 && (longEnough ? styles.hintOk : styles.hintBad)]}>
              {longEnough ? '✓' : '•'} At least {MIN_LENGTH} characters
            </Text>

            <Text style={styles.label}>Confirm new password</Text>
            <TextInput
              mode="outlined"
              value={confirm}
              onChangeText={edit(setConfirm)}
              secureTextEntry={!visible}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={128}
              right={eye}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
            {confirm.length > 0 && (
              <Text style={[styles.hint, matches ? styles.hintOk : styles.hintBad]}>
                {matches ? '✓ Passwords match' : "Passwords don't match yet"}
              </Text>
            )}
          </Card>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label={saving ? 'Updating…' : 'Update password'}
            onPress={submit}
            loading={saving}
            disabled={!canSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
    marginTop: spacing.md,
  },
  firstLabel: { marginTop: 0 },
  input: {
    backgroundColor: colors.surface,
    marginTop: spacing.xs,
  },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  hintOk: { color: palette.okText, fontWeight: '600' },
  hintBad: { color: palette.warnText },
  error: {
    color: palette.cancelledText,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
