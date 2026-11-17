import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, spacing } from '../../utils/theme';

interface SectionHeaderProps {
  title: string;
  caption?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, caption }) => (
  <View style={styles.row}>
    <Text style={styles.title} accessibilityRole="header">
      {title}
    </Text>
    {caption ? <Text style={styles.caption}>{caption}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  caption: { fontSize: 12, color: colors.textMuted },
});
