import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRole } from '../../context/RoleContext';
import * as authService from '../../services/authService';
import { colors, palette, radius, spacing } from '../../utils/theme';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useRole();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim() || !password) return setError('Enter your email and password.');
    try {
      setSaving(true);
      setError(null);
      await signIn(await authService.login(email.trim(), password)); // the app opens as soon as this is set
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not log in.');
    } finally {
      setSaving(false);
    }
  };

  const input = { mode: 'outlined' as const, style: styles.input, outlineColor: colors.border, activeOutlineColor: colors.primary };

  return (
    <ScreenContainer title="Log in" showHeader={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
        <Text style={styles.brand}>tenang.</Text>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.sub}>Log in with your university email.</Text>

        <Card style={styles.card}>
          <Text style={[styles.label, styles.firstLabel]}>Email address</Text>
          <TextInput
            {...input}
            value={email}
            onChangeText={(v) => { setError(null); setEmail(v); }}
            placeholder="you@siswa.um.edu.my"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            {...input}
            value={password}
            onChangeText={(v) => { setError(null); setPassword(v); }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setShowPassword((v) => !v)}
                forceTextInputFocus={false}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              />
            }
          />
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton label={saving ? 'Logging in…' : 'Log in'} onPress={submit} loading={saving} disabled={saving} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate('SignUp' as never)} hitSlop={8}>
            <Text style={styles.footerLink}>Sign up</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingTop: spacing.xl },
  brand: { fontSize: 40, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  heading: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', marginTop: spacing.xs },
  sub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.lg },
  card: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
  label: { fontSize: 12, fontWeight: '600', color: colors.secondary, marginTop: spacing.md },
  firstLabel: { marginTop: 0 },
  input: { backgroundColor: colors.surface, marginTop: spacing.xs },
  error: { color: palette.cancelledText, fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xs },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginVertical: spacing.md },
  footerText: { color: colors.textMuted, fontSize: 14 },
  footerLink: { color: colors.primary, fontSize: 15, fontWeight: '700' },
});
