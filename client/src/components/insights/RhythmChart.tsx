import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '../Card';
import { STRESS_COLOR } from '../charts/MoodTrendChart';
import { InfoTip } from '../InfoTip';
import { RhythmPoint } from '../../utils/insights';
import { colors, palette, radius, spacing } from '../../utils/theme';

const BAR_AREA_HEIGHT = 54;
const MAX_SCORE = 5;

const barHeight = (value: number) => Math.max(4, Math.round((value / MAX_SCORE) * BAR_AREA_HEIGHT));

const LegendDot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <View style={styles.legendItem}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

interface RhythmChartProps {
  title: string;
  info: string;
  points: RhythmPoint[];
}

/** Paired mood / stress bars per day (weekly view) or per week (monthly view). */
export const RhythmChart: React.FC<RhythmChartProps> = ({ title, info, points }) => (
  <Card style={styles.card}>
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <InfoTip title={title} text={info} />
      </View>
      <View style={styles.legend}>
        <LegendDot color={colors.primary} label="Mood" />
        <LegendDot color={STRESS_COLOR} label="Stress" />
      </View>
    </View>

    <View style={styles.bars}>
      {points.map((point) => {
        const hasData = point.mood !== null && point.stress !== null;
        return (
          <View
            key={point.label}
            style={styles.column}
            accessible
            accessibilityLabel={
              hasData
                ? `${point.label}: mood ${point.mood!.toFixed(1)}, stress ${point.stress!.toFixed(1)}`
                : `${point.label}: no check-in`
            }
          >
            <View style={styles.barArea}>
              {hasData ? (
                <>
                  <View style={[styles.bar, { height: barHeight(point.mood!), backgroundColor: colors.primary }]} />
                  <View style={[styles.bar, { height: barHeight(point.stress!), backgroundColor: STRESS_COLOR }]} />
                </>
              ) : (
                <View style={styles.emptyBar}>
                  <Text style={styles.emptyDash}>—</Text>
                </View>
              )}
            </View>
            <Text style={[styles.day, !hasData && styles.dayEmpty]}>{point.label}</Text>
          </View>
        );
      })}
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: { marginBottom: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },

  bars: { flexDirection: 'row', gap: 8, paddingTop: spacing.sm },
  column: { flex: 1, alignItems: 'center', gap: 6 },
  barArea: {
    width: '100%',
    height: BAR_AREA_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  bar: { width: 10, borderRadius: 5 },
  emptyBar: {
    width: '100%',
    height: BAR_AREA_HEIGHT,
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDash: { fontSize: 10, fontWeight: '600', color: palette.textFaint },
  day: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
  dayEmpty: { fontWeight: '600', color: palette.textFaint },
});
