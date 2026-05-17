import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { getRoleLabel } from '../../constants/roleUsers';
import { useRole } from '../../context/RoleContext';
import { AppRole } from '../../types';
import { colors, spacing } from '../../utils/theme';

const ROLES: AppRole[] = ['counsellor', 'student1', 'student2'];

export const RoleSelectScreen: React.FC = () => {
  const { setRole } = useRole();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.brand}>SafeSpace</Text>
        <Text style={styles.sub}>Development role selector — choose a view to preview</Text>
        {ROLES.map((r) => (
          <PrimaryButton key={r} label={getRoleLabel(r)} onPress={() => setRole(r)} />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  brand: { fontSize: 32, fontWeight: '800', color: colors.primary, textAlign: 'center', marginBottom: spacing.sm },
  sub: { textAlign: 'center', color: colors.textMuted, marginBottom: spacing.xl },
});
