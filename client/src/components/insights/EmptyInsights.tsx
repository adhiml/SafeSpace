import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../Card';
import { PrimaryButton } from '../PrimaryButton';
import { colors, spacing } from '../../utils/theme';

interface EmptyInsightsProps {
  title: string;
  body: string;
  /** Omit for audiences with nothing to act on (e.g. counsellors). */
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyInsights: React.FC<EmptyInsightsProps> = ({ title, body, actionLabel, onAction }) => (
  <Card style={styles.card}>
    <View style={styles.iconBox}>
      <Ionicons name="bar-chart-outline" size={30} color={colors.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.body}>{body}</Text>
    {actionLabel && onAction ? (
      <View style={styles.cta}>
        <PrimaryButton label={actionLabel} onPress={onAction} />
      </View>
    ) : null}
  </Card>
);

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: spacing.xl, marginBottom: 0 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 270,
    marginBottom: spacing.md,
  },
  cta: { width: '100%' },
});
