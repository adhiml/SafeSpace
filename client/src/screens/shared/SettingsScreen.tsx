import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { SwitchRoleModal } from '../../components/SwitchRoleModal';
import { getRoleLabel } from '../../constants/roleUsers';
import { useRole } from '../../context/RoleContext';
import { AppRole } from '../../types';
import { colors, spacing } from '../../utils/theme';

interface SettingsScreenProps {
  onSwitchRole: (role: AppRole) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onSwitchRole }) => {
  const { role, profile, isCounsellor } = useRole();
  const [modalVisible, setModalVisible] = useState(false);

  if (!role || !profile) return null;

  const name = isCounsellor
    ? `${profile.displayTitle || 'Dr.'} ${profile.user_name}`
    : profile.user_name;

  return (
    <ScreenContainer title="Settings">
      <Card>
        <Text style={styles.label}>Current role (dev)</Text>
        <Text style={styles.value}>{getRoleLabel(role)}</Text>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{name}</Text>
        <Text style={styles.label}>User ID</Text>
        <Text style={styles.value}>{profile.userId}</Text>
      </Card>
      <PrimaryButton label="Switch role" onPress={() => setModalVisible(true)} />
      <SwitchRoleModal
        visible={modalVisible}
        currentRole={role}
        onClose={() => setModalVisible(false)}
        onSelect={(r) => {
          setModalVisible(false);
          onSwitchRole(r);
        }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  value: { fontSize: 16, color: colors.text, fontWeight: '600' },
});
