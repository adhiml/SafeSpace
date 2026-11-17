import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '../Card';
import { colors, palette, radius, spacing } from '../../utils/theme';

export interface Trigger {
  cause: string;
  count: number;
}

interface TriggerListProps {
  triggers: Trigger[]; // sorted, most frequent first
  countNoun: { one: string; many: string }; // "time" / "times", "report" / "reports"
  title?: string;
}

/** Ranked stress triggers with a bar sized relative to the most frequent one. */
export const TriggerList: React.FC<TriggerListProps> = ({ triggers, countNoun, title }) => {
  const heading = title ? (
    <Text style={styles.title} accessibilityRole="header">
      {title}
    </Text>
  ) : null;

  if (!triggers.length) {
    return (
      <Card style={styles.card}>
        {heading}
        <Text style={styles.empty}>No stress triggers logged for this period.</Text>
      </Card>
    );
  }

  const max = triggers[0].count || 1;
  const countLabel = (n: number) => `${n} ${n === 1 ? countNoun.one : countNoun.many}`;

  return (
    <Card style={styles.card}>
      {heading}
      {triggers.map((t, i) => {
        const isLast = i === triggers.length - 1;
        return (
          <View
            key={t.cause}
            style={!isLast && styles.divided}
            accessible
            accessibilityLabel={`${i + 1}. ${t.cause}, ${countLabel(t.count)}`}
          >
            <View style={styles.row}>
              <View style={styles.nameWrap}>
                <View style={styles.rank}>
                  <Text style={styles.rankText}>{i + 1}</Text>
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {t.cause}
                </Text>
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{countLabel(t.count)}</Text>
              </View>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(t.count / max) * 100}%` }]} />
            </View>
          </View>
        );
      })}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 0 },
  title: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  divided: {
    paddingBottom: spacing.md - 2,
    marginBottom: spacing.md - 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  nameWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  name: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  countPill: {
    marginLeft: spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: palette.surfaceAlt,
  },
  countText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  track: { height: 8, borderRadius: 4, backgroundColor: palette.accentWash, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: colors.secondary },
  empty: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xs },
});
