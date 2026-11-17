import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Card';
import { ChipGroup } from '../../components/forms/ChipGroup';
import { SelectField } from '../../components/forms/SelectField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { FACULTIES, GENDERS, YEARS_OF_STUDY } from '../../constants/options';
import { useRole } from '../../context/RoleContext';
import { RoleProfile, SharedStackParamList } from '../../types';
import { colors, palette, radius, spacing } from '../../utils/theme';

interface FormValues {
  user_name: string;
  displayTitle: string;
  specialization: string;
  anonymous_name: string;
  gender: string;
  faculty: string;
  year_of_study: string;
}

interface FieldDef {
  key: keyof FormValues;
  label: string;
  max: number; // matches the server's limits
  hint?: string;
  autoCapitalize?: 'none' | 'words';
  // text (default) is typed; select opens a list; chips shows every option at once
  kind?: 'text' | 'select' | 'chips';
  options?: string[];
  labelFor?: (option: string) => string;
}

const yearLabel = (y: string) => (y === 'Postgraduate' ? y : `Year ${y}`);

const STUDENT_FIELDS: FieldDef[] = [
  { key: 'user_name', label: 'Display Name', max: 60, autoCapitalize: 'words' },
  {
    key: 'anonymous_name',
    label: 'Anonymous Name',
    max: 30,
    autoCapitalize: 'none',
    hint: 'Shown instead of your name on peer posts and anonymous consultations. It must be unique.',
  },
  { key: 'faculty', label: 'Faculty', max: 80, kind: 'select', options: FACULTIES },
  { key: 'year_of_study', label: 'Year of study', max: 12, kind: 'chips', options: YEARS_OF_STUDY, labelFor: yearLabel },
  { key: 'gender', label: 'Gender', max: 30, kind: 'chips', options: GENDERS },
];

const COUNSELLOR_FIELDS: FieldDef[] = [
  { key: 'user_name', label: 'Display Name', max: 60, autoCapitalize: 'words' },
  { key: 'displayTitle', label: 'Title', max: 20, autoCapitalize: 'words', hint: 'Shown before your name, e.g. "Dr."' },
  { key: 'specialization', label: 'Specialization', max: 100, autoCapitalize: 'words' },
  { key: 'gender', label: 'Gender', max: 30, kind: 'chips', options: GENDERS },
];

const fromProfile = (p: RoleProfile | null): FormValues => ({
  user_name: p?.user_name ?? '',
  displayTitle: p?.displayTitle ?? 'Dr.',
  specialization: p?.specialization ?? '',
  anonymous_name: p?.anonymous_name ?? '',
  gender: p?.gender ?? '',
  faculty: p?.faculty ?? '',
  year_of_study: p?.year_of_study ?? '',
});

export const ProfileScreen: React.FC = () => {
  const { role, profile, isCounsellor, saveProfile } = useRole();
  const navigation = useNavigation<NativeStackNavigationProp<SharedStackParamList>>();

  // Hooks all run before the early return below, so their order never changes.
  const saved = fromProfile(profile);
  const savedKey = JSON.stringify(saved);
  const [form, setForm] = useState<FormValues>(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const touched = useRef(false);

  // The saved profile can arrive from the server after this screen opens; show it unless
  // the user has already started typing.
  useEffect(() => {
    if (!touched.current) setForm(fromProfile(profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedKey]);

  if (!profile || !role) return null;

  const fields = isCounsellor ? COUNSELLOR_FIELDS : STUDENT_FIELDS;
  const dirty = JSON.stringify(form) !== savedKey;

  const setField = (key: keyof FormValues, value: string) => {
    touched.current = true;
    setError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const liveDisplayName = isCounsellor
    ? `${form.displayTitle.trim() || 'Dr.'} ${form.user_name}`
    : form.user_name;
  const liveSubtitle = isCounsellor
    ? form.specialization || 'Counselling Specialist'
    : form.faculty || 'Student';

  const handleSave = async () => {
    const name = form.user_name.trim();
    const alias = form.anonymous_name.trim();

    if (!name) return setError('Your name cannot be empty.');
    if (!isCounsellor) {
      if (!alias) return setError('Your anonymous name cannot be empty.');
      if (alias.toLowerCase() === name.toLowerCase()) {
        return setError('Your anonymous name must be different from your real name.');
      }
    }

    try {
      setSaving(true);
      setError(null);
      await saveProfile(
        isCounsellor
          ? { user_name: name, displayTitle: form.displayTitle.trim(), specialization: form.specialization.trim(), gender: form.gender }
          : { user_name: name, anonymous_name: alias, gender: form.gender, faculty: form.faculty, year_of_study: form.year_of_study }
      );
      touched.current = false;
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer title="edit." scroll={false}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Preview. Everyone shares the same default picture. */}
          <View style={styles.avatarContainer}>
            <Avatar size={100} />
            <Text style={styles.previewTitle}>{liveDisplayName}</Text>
            <Text style={styles.previewSub}>{liveSubtitle}</Text>
          </View>

          {/* Editable fields */}
          <Card style={styles.card}>
            {fields.map((f, i) => (
              <View key={f.key}>
                <Text style={[styles.label, i === 0 && styles.firstLabel]}>{f.label}</Text>
                {f.kind === 'select' ? (
                  <SelectField value={form[f.key]} options={f.options ?? []} onChange={(v) => setField(f.key, v)} title={f.label} placeholder={`Choose your ${f.label.toLowerCase()}`} />
                ) : f.kind === 'chips' ? (
                  <ChipGroup options={f.options ?? []} value={form[f.key]} onChange={(v) => setField(f.key, v)} labelFor={f.labelFor} />
                ) : (
                  <TextInput
                    mode="outlined"
                    value={form[f.key]}
                    onChangeText={(v) => setField(f.key, v)}
                    maxLength={f.max}
                    autoCapitalize={f.autoCapitalize}
                    autoCorrect={false}
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                  />
                )}
                {f.hint ? <Text style={styles.hint}>{f.hint}</Text> : null}
              </View>
            ))}

            <Text style={styles.readOnlyLabel}>Email (read-only)</Text>
            <TextInput
              mode="outlined"
              value={profile.email || ''}
              disabled
              style={[styles.input, styles.disabledInput]}
            />
          </Card>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label={saving ? 'Saving…' : 'Save Changes'}
            onPress={handleSave}
            loading={saving}
            disabled={!dirty || saving}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  previewSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
    marginTop: spacing.sm,
  },
  firstLabel: { marginTop: 0 },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 15 },
  readOnlyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    marginTop: spacing.xs,
  },
  disabledInput: {
    backgroundColor: palette.surfaceAlt,
  },
  error: {
    color: palette.cancelledText,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
});
