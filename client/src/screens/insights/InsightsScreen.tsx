import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as moodService from '../../services/moodService';
import { MoodAnalytics } from '../../types';
import { MOOD_LABELS } from '../../utils/constants';
import { colors, spacing } from '../../utils/theme';

export const InsightsScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);

  useFocusEffect(
    useCallback(() => {
      moodService.getMoodAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
    }, [])
  );

  const avgMoodLabel = analytics
    ? MOOD_LABELS[Math.round(analytics.averages.mood) as keyof typeof MOOD_LABELS] || '—'
    : '—';

  return (
    <ScreenContainer title="Insights">
      <Card>
        <Text style={styles.metricLabel}>14-day average mood</Text>
        <Text style={styles.metricValue}>{avgMoodLabel}</Text>
        <Text style={styles.metricSub}>
          Stress avg: {analytics ? analytics.averages.stress.toFixed(1) : '—'} / 5
        </Text>
      </Card>

      <Text style={styles.section}>Top stress causes</Text>
      {analytics?.topStressCauses.length ? (
        analytics.topStressCauses.map((c) => (
          <Card key={c.cause}>
            <Text style={styles.cause}>{c.cause}</Text>
            <Text style={styles.count}>{c.count} entries</Text>
          </Card>
        ))
      ) : (
        <Text style={styles.empty}>Log moods to see insights over time.</Text>
      )}

      <Text style={styles.section}>Recent trend</Text>
      {analytics?.trend.slice(0, 5).map((t, i) => (
        <View key={i} style={styles.trendRow}>
          <Text style={styles.trendDate}>{new Date(t.date).toLocaleDateString()}</Text>
          <Text>Mood {t.mood_level} · Stress {t.stress_level}</Text>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  metricLabel: { color: colors.textMuted },
  metricValue: { fontSize: 28, fontWeight: '800', color: colors.primary, marginVertical: spacing.xs },
  metricSub: { color: colors.textMuted },
  section: { fontSize: 16, fontWeight: '700', marginVertical: spacing.sm, color: colors.text },
  cause: { fontWeight: '600', color: colors.text },
  count: { color: colors.textMuted, fontSize: 12 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  trendDate: { color: colors.textMuted },
});
