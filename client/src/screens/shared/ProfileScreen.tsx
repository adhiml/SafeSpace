import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useRole } from '../../context/RoleContext';
import { AppRole } from '../../types';
import { colors, spacing } from '../../utils/theme';

export const ProfileScreen: React.FC = () => {
  const { role, profile, isCounsellor, updateProfile } = useRole();

  if (!profile || !role) return null;

  const displayName = isCounsellor
    ? `${profile.displayTitle || 'Dr.'} ${profile.user_name}`
    : profile.user_name;

  return (
    <ScreenContainer title="Profile" hideHeaderActions>
      <Card>
        <Text style={styles.label}>Display name</Text>
        <TextInput
          mode="outlined"
          value={profile.user_name}
          onChangeText={(t) => updateProfile({ user_name: t })}
          style={styles.input}
        />
        {isCounsellor ? (
          <>
            <Text style={styles.label}>Title</Text>
            <TextInput
              mode="outlined"
              value={profile.displayTitle || 'Dr.'}
              onChangeText={(t) => updateProfile({ displayTitle: t })}
              style={styles.input}
            />
            <Text style={styles.label}>Specialization</Text>
            <TextInput
              mode="outlined"
              value={profile.specialization || ''}
              onChangeText={(t) => updateProfile({ specialization: t })}
              style={styles.input}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Anonymous name</Text>
            <TextInput
              mode="outlined"
              value={profile.anonymous_name || ''}
              onChangeText={(t) => updateProfile({ anonymous_name: t })}
              style={styles.input}
            />
            <Text style={styles.label}>Faculty</Text>
            <TextInput
              mode="outlined"
              value={profile.faculty || ''}
              onChangeText={(t) => updateProfile({ faculty: t })}
              style={styles.input}
            />
          </>
        )}
        <Text style={styles.preview}>Preview: {displayName}</Text>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  input: { backgroundColor: colors.surface, marginTop: spacing.xs },
  preview: { marginTop: spacing.md, color: colors.primary, fontWeight: '600' },
});
