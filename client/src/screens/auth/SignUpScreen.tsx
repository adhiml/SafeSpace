import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { ChipGroup } from '../../components/forms/ChipGroup';
import { SelectField } from '../../components/forms/SelectField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { EMAIL_DOMAIN, FACULTIES, GENDERS, UserKind, YEARS_OF_STUDY } from '../../constants/options';
import { useRole } from '../../context/RoleContext';
import * as authService from '../../services/authService';
import { colors, palette, radius, spacing } from '../../utils/theme';

const KIND_LABEL: Record<UserKind, string> = { student: 'Student', counsellor: 'Counsellor' };
const MIN_PASSWORD = 8;

export const SignUpScreen = () => {
  const navigation = useNavigation();
  const { signIn } = useRole();

  const [kind, setKind] = useState<UserKind>('student');
  const [userName, setUserName] = useState('');
  const [anonymousName, setAnonymousName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [year, setYear] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [gender, setGender] = useState('');
  const [emailLocal, setEmailLocal] = useState(''); // the part before the "@"
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const domain = EMAIL_DOMAIN[kind];
  const isStudent = kind === 'student';

  // Typing or pasting a full address works too: the ending decides Student / Counsellor.
  const onEmailChange = (text: string) => {
    setError(null);
    if (!text.includes('@')) return setEmailLocal(text.trim());
    const [local, rest] = [text.split('@')[0], '@' + text.split('@').slice(1).join('@')];
    setEmailLocal(local.trim());
    (Object.keys(EMAIL_DOMAIN) as UserKind[]).forEach((k) => {
      if (rest.toLowerCase() === EMAIL_DOMAIN[k]) setKind(k);
    });
  };

  const submit = async () => {
    const name = userName.trim();
    const alias = anonymousName.trim();

    if (!name) return setError('Enter your display name.');
    if (isStudent) {
      if (!alias) return setError('Enter an anonymous name.');
      if (alias.toLowerCase() === name.toLowerCase()) return setError('Your anonymous name must be different from your real name.');
      if (!faculty) return setError('Choose your faculty.');
      if (!year) return setError('Choose your year of study.');
    } else if (!specialization.trim()) {
      return setError('Enter your specialization.');
    }
    if (!gender) return setError('Choose your gender.');
    if (!emailLocal) return setError('Enter your university email.');
    if (password.length < MIN_PASSWORD) return setError(`Your password must be at least ${MIN_PASSWORD} characters.`);
    if (password !== confirm) return setError("The two passwords don't match.");

    try {
      setSaving(true);
      setError(null);
      const result = await authService.register({
        email: `${emailLocal}${domain}`,
        password,
        user_name: name,
        gender,
        ...(isStudent
          ? { anonymous_name: alias, faculty, year_of_study: year }
          : { specialization: specialization.trim() }),
      });

      await signIn(result); // opens the app, or the "enter your code" screen if verification is required
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your account.');
    } finally {
      setSaving(false);
    }
  };

  const input = { mode: 'outlined' as const, style: styles.input, outlineColor: colors.border, activeOutlineColor: colors.primary };
  const eye = (
    <TextInput.Icon
      icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
      onPress={() => setShowPassword((v) => !v)}
      forceTextInputFocus={false}
      accessibilityLabel={showPassword ? 'Hide passwords' : 'Show passwords'}
    />
  );

  return (
    <ScreenContainer title="Sign up" showHeader={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.brand}>tenang.</Text>
        <Text style={styles.heading}>Create your account</Text>
        <Text style={styles.sub}>Use your university email. We check it against the university list.</Text>

        <Card style={styles.card}>
          {/* Student / Counsellor: picking one fills in the matching email ending */}
          <Text style={[styles.label, styles.firstLabel]}>I am a</Text>
          <View style={styles.kindRow}>
            {(Object.keys(KIND_LABEL) as UserKind[]).map((k) => {
              const selected = k === kind;
              return (
                <Pressable
                  key={k}
                  onPress={() => {
                    setKind(k);
                    setError(null);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[styles.kind, selected && styles.kindSelected]}
                >
                  <Icon source={selected ? 'check-circle' : 'circle-outline'} size={20} color={selected ? palette.white : colors.textMuted} />
                  <View>
                    <Text style={[styles.kindTitle, selected && styles.kindTextSelected]}>{KIND_LABEL[k]}</Text>
                    <Text style={[styles.kindSub, selected && styles.kindTextSelected]}>{EMAIL_DOMAIN[k]}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Display name</Text>
          <TextInput {...input} value={userName} onChangeText={(v) => { setError(null); setUserName(v); }} maxLength={60} autoCapitalize="words" />

          {isStudent ? (
            <>
              <Text style={styles.label}>Anonymous name</Text>
              <TextInput {...input} value={anonymousName} onChangeText={(v) => { setError(null); setAnonymousName(v); }} maxLength={30} autoCapitalize="none" autoCorrect={false} />
              <Text style={styles.hint}>Other students see this instead of your name. It must be unique.</Text>

              <Text style={styles.label}>Faculty</Text>
              <SelectField value={faculty} options={FACULTIES} onChange={(v) => { setError(null); setFaculty(v); }} placeholder="Choose your faculty" title="Faculty" />

              <Text style={styles.label}>Year of study</Text>
              <ChipGroup options={YEARS_OF_STUDY} value={year} onChange={(v) => { setError(null); setYear(v); }} labelFor={(y) => (y === 'Postgraduate' ? y : `Year ${y}`)} />
            </>
          ) : (
            <>
              <Text style={styles.label}>Specialization</Text>
              <TextInput {...input} value={specialization} onChangeText={(v) => { setError(null); setSpecialization(v); }} maxLength={100} autoCapitalize="words" />
            </>
          )}

          <Text style={styles.label}>Gender</Text>
          <ChipGroup options={GENDERS} value={gender} onChange={(v) => { setError(null); setGender(v); }} />

          <Text style={styles.label}>University email</Text>
          <TextInput
            {...input}
            value={emailLocal}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            right={<TextInput.Affix text={domain} />}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput {...input} value={password} onChangeText={(v) => { setError(null); setPassword(v); }} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} maxLength={128} right={eye} />
          <Text style={styles.hint}>At least {MIN_PASSWORD} characters.</Text>

          <Text style={styles.label}>Confirm password</Text>
          <TextInput {...input} value={confirm} onChangeText={(v) => { setError(null); setConfirm(v); }} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} maxLength={128} right={eye} />
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton label={saving ? 'Creating account…' : 'Sign up'} onPress={submit} loading={saving} disabled={saving} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => navigation.navigate('Login' as never)} hitSlop={8}>
            <Text style={styles.footerLink}>Log in</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  brand: { fontSize: 34, fontWeight: '800', color: colors.primary, textAlign: 'center', marginTop: spacing.sm },
  heading: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', marginTop: spacing.xs },
  sub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.md },
  card: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface },
  label: { fontSize: 12, fontWeight: '600', color: colors.secondary, marginTop: spacing.md },
  firstLabel: { marginTop: 0 },
  input: { backgroundColor: colors.surface, marginTop: spacing.xs },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 15 },

  kindRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  kind: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
  },
  kindSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  kindTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  kindSub: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  kindTextSelected: { color: palette.white },

  error: { color: palette.cancelledText, fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xs },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginVertical: spacing.md },
  footerText: { color: colors.textMuted, fontSize: 14 },
  footerLink: { color: colors.primary, fontSize: 15, fontWeight: '700' },
});
