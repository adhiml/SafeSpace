import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../Card';
import { InfoTip } from '../InfoTip';
import { DailyStress } from '../../types';
import { colors, palette, radius, spacing } from '../../utils/theme';

interface Props {
  data: DailyStress | null;
  /** Shown as a soft link when today's stress is 4 or higher. */
  onSupportPress?: () => void;
}

const Source: React.FC<{ label: string; value: number | null; sub: string }> = ({ label, value, sub }) => (
  <View style={styles.source}>
    <Text style={styles.sourceLabel}>{label}</Text>
    <Text style={styles.sourceValue}>{value ?? '–'}</Text>
    <Text style={styles.sourceSub}>{sub}</Text>
  </View>
);

export const DailyStressCard: React.FC<Props> = ({ data, onSupportPress }) => {
  if (!data || data.final === null) return null;

  const pct = ((data.final - 1) / 4) * 100;
  const textSub = data.textCount
    ? `${data.textCount} ${data.textCount > 1 ? 'entries' : 'entry'}${data.hasUnreviewed ? ' · review to refine' : ' · confirmed'}`
    : 'No entries today';

  return (
    <Card style={styles.card}>
      <View style={styles.kickerRow}>
        <Text style={styles.kicker}>Today's stress</Text>
        <InfoTip
          title="How this is calculated"
          text="Mostly your own check-ins today (averaged if you checked in more than once), adjusted by the stress score of what you wrote today (journals you analyzed and peer posts). Scores you confirmed or changed count more than unreviewed AI estimates. Only you can see this."
        />
      </View>
      <Text style={styles.big}>
        {data.final.toFixed(1)} <Text style={styles.band}>· {data.band}</Text>
      </Text>

      <View style={styles.track}>
        <View style={[styles.marker, { left: `${pct}%` }]} />
      </View>

      <View style={styles.sources}>
        <Source label="Your check-in" value={data.explicit} sub={data.explicit === null ? 'Not checked in yet' : 'what you rated'} />
        <Source label="From your writing" value={data.text} sub={textSub} />
      </View>

      {data.source === 'text-only' && (
        <Text style={styles.note}>Based on your writing only. A check-in gives a fuller picture.</Text>
      )}

      {data.final >= 4 && onSupportPress && (
        <Pressable onPress={onSupportPress} hitSlop={8}>
          <Text style={styles.support}>Need someone to talk to? Book a counsellor →</Text>
        </Pressable>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kicker: { fontSize: 16,  color: colors.text, marginBottom: spacing.xs, fontWeight: '700'},
  big: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 2 },
  band: { fontSize: 16, fontWeight: '600', color: colors.textMuted },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: palette.accentSoft,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    justifyContent: 'center',
  },
  marker: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: palette.white,
  },
  sources: { flexDirection: 'row', gap: spacing.sm },
  source: { flex: 1, backgroundColor: palette.surfaceAlt, borderRadius: radius.sm, padding: spacing.xs },
  sourceLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  sourceValue: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 2 },
  sourceSub: { fontSize: 11, color: colors.textMuted, },
  note: { fontSize: 12, color: colors.textMuted, marginTop: spacing.sm },
  support: { fontSize: 13, fontWeight: '700', color: colors.secondary, marginTop: spacing.md },
});
