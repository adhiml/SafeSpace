import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import { currentUser } from '../../constants/currentUser';
import { colors, spacing } from '../../utils/theme';

/** Settings UI only — no auth actions */
export const SettingsScreen: React.FC = () => (
  <ScreenContainer title="Settings">
    <Card>
      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{currentUser.user_name}</Text>
      <Text style={styles.label}>User ID</Text>
      <Text style={styles.value}>{currentUser._id}</Text>
      <Text style={styles.label}>Role</Text>
      <Text style={styles.value}>{currentUser.role}</Text>
      <Text style={styles.label}>Faculty</Text>
      <Text style={styles.value}>{currentUser.faculty}</Text>
    </Card>
    <Text style={styles.note}>Authentication is not enabled in this build.</Text>
  </ScreenContainer>
);

const styles = StyleSheet.create({
  label: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  value: { fontSize: 16, color: colors.text, fontWeight: '600' },
  note: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.lg, fontSize: 13 },
});
