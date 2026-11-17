import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { Card } from '../Card';
import { STRESS_COLOR } from '../charts/MoodTrendChart';
import { Badge } from '../../utils/insights';
import { colors, palette, radius } from '../../utils/theme';

type Tone = 'mood' | 'stress';

// Same series colors as the home-screen trend charts
const TONES = {
  mood: { accent: colors.primary, track: colors.primaryLight },
  stress: { accent: STRESS_COLOR, track: colors.stressed },
} as const;

// Ring geometry (matches a 32×32 viewBox)
const SIZE = 28;
const RADIUS = 12;
const STROKE = 3.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface MetricCardProps {
  label: string;
  value: number; // 0–5
  tone: Tone;
  badge: Badge;
}

/** Average value on a 0–5 scale, with a mini ring gauge and a change-vs-previous pill. */
export const MetricCard: React.FC<MetricCardProps> = ({ label, value, tone, badge }) => {
  const { accent, track } = TONES[tone];
  const ratio = Math.min(Math.max(value / 5, 0), 1);

  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityLabel={`${label}: ${value.toFixed(1)} out of 5. ${badge.text}`}
      >
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Svg width={SIZE} height={SIZE} viewBox="0 0 32 32">
            <Circle cx={16} cy={16} r={RADIUS} fill="none" stroke={track} strokeWidth={STROKE} />
            <Circle
              cx={16}
              cy={16}
              r={RADIUS}
              fill="none"
              stroke={accent}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
              rotation={-90}
              origin="16, 16"
            />
          </Svg>
        </View>

        <View style={styles.valueRow}>
          <Text style={styles.value}>{value.toFixed(1)}</Text>
          <Text style={styles.scale}>/ 5</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]} numberOfLines={1}>
            {badge.text}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { flex: 1, marginBottom: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  value: { fontSize: 32, fontWeight: '800', color: colors.text, lineHeight: 38 },
  scale: { fontSize: 14, fontWeight: '600', color: palette.textFaint },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
