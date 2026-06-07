import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as moodService from '../../services/moodService';
import { CounsellorAnalytics } from '../../types';
import { colors, spacing } from '../../utils/theme';

export const CounsellorInsightsScreen: React.FC = () => {
  const [data, setData] = useState<CounsellorAnalytics | null>(null);

  useFocusEffect(
    useCallback(() => {
      moodService.getCounsellorAnalytics().then(setData).catch(() => setData(null));
    }, [])
  );

  return (
    <ScreenContainer title="Insights">
      <Text style={styles.note}>Aggregated student data — identities hidden for stress causes</Text>
      <Card>
        <Text style={styles.metric}>Students tracked: {data?.studentCount ?? '—'}</Text>
        <Text style={styles.metric}>Avg stress: {data ? data.averages.stress.toFixed(1) : '—'} / 5</Text>
        <Text style={styles.metric}>Avg mood: {data ? data.averages.mood.toFixed(1) : '—'} / 5</Text>
      </Card>

      <Text style={styles.section}>Stress causes (anonymous)</Text>
      {data?.topStressCauses.map((c) => (
        <Card key={c.cause}>
          <Text style={styles.cause}>{c.cause}</Text>
          <Text style={styles.count}>{c.count} reports</Text>
        </Card>
      ))}

      {/* specific student (anonymous) wellbeing scores and trends */}
      {/* <Text style={styles.section}>Student wellbeing (IDs only)</Text>
      {data?.studentWellbeing.map((s) => (
        <View key={s.studentId} style={styles.row}>
          <Text style={styles.id}>Student {s.studentId.slice(-3)}</Text>
          <Text style={styles.muted}>
            Stress {s.avgStress.toFixed(1)} · Mood {s.avgMood.toFixed(1)} · {s.entryCount} logs
          </Text>
        </View>
      ))} */}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  note: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.md },
  metric: { fontSize: 15, color: colors.text, marginVertical: 4 },
  section: { fontSize: 16, fontWeight: '700', marginVertical: spacing.sm, color: colors.text },
  cause: { fontWeight: '600', color: colors.text },
  count: { color: colors.textMuted, fontSize: 12 },
  row: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  id: { fontWeight: '700', color: colors.primary },
  muted: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
