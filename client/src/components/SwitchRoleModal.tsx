import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { getRoleLabel } from '../constants/roleUsers';
import { AppRole } from '../types';
import { colors, radius, spacing } from '../utils/theme';

const ROLES: AppRole[] = ['counsellor', 'student1', 'student2'];

interface SwitchRoleModalProps {
  visible: boolean;
  currentRole: AppRole | null;
  onSelect: (role: AppRole) => void;
  onClose: () => void;
}

export const SwitchRoleModal: React.FC<SwitchRoleModalProps> = ({
  visible,
  currentRole,
  onSelect,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
        <Text style={styles.title}>Switch role (dev)</Text>
        <Text style={styles.sub}>UI preview only — not saved after restart</Text>
        {ROLES.map((r) => (
          <Pressable
            key={r}
            style={[styles.option, currentRole === r && styles.optionActive]}
            onPress={() => onSelect(r)}
          >
            <Text style={[styles.optionText, currentRole === r && styles.optionTextActive]}>
              {getRoleLabel(r)}
            </Text>
          </Pressable>
        ))}
        <Pressable style={styles.cancel} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },
  option: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },
  optionActive: { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: colors.primary },
  optionText: { fontSize: 16, color: colors.text, fontWeight: '600' },
  optionTextActive: { color: colors.primary },
  cancel: { marginTop: spacing.sm, alignItems: 'center', padding: spacing.md },
  cancelText: { color: colors.textMuted, fontWeight: '600' },
});
