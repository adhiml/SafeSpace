// import React, { useCallback, useState } from 'react';
// import { StyleSheet, View } from 'react-native';
// import { Text } from 'react-native-paper';
// import { useFocusEffect } from '@react-navigation/native';
// import { Card } from '../../components/Card';
// import { ScreenContainer } from '../../components/ScreenContainer';
// import * as moodService from '../../services/moodService';
// import { CounsellorAnalytics } from '../../types';
// import { colors, spacing } from '../../utils/theme';

// export const CounsellorInsightsScreen: React.FC = () => {
//   const [data, setData] = useState<CounsellorAnalytics | null>(null);

//   useFocusEffect(
//     useCallback(() => {
//       moodService.getCounsellorAnalytics().then(setData).catch(() => setData(null));
//     }, [])
//   );

//   return (
//     <ScreenContainer title="Insights">
//       <Text style={styles.note}>Aggregated student data — identities hidden for stress causes</Text>
//       <Card>
//         <Text style={styles.metric}>Students tracked: {data?.studentCount ?? '—'}</Text>
//         <Text style={styles.metric}>Avg stress: {data ? data.averages.stress.toFixed(1) : '—'} / 5</Text>
//         <Text style={styles.metric}>Avg mood: {data ? data.averages.mood.toFixed(1) : '—'} / 5</Text>
//       </Card>

//       <Text style={styles.section}>Stress causes (anonymous)</Text>
//       {data?.topStressCauses.map((c) => (
//         <Card key={c.cause}>
//           <Text style={styles.cause}>{c.cause}</Text>
//           <Text style={styles.count}>{c.count} reports</Text>
//         </Card>
//       ))}

//       {/* specific student (anonymous) wellbeing scores and trends */}
//       {/* <Text style={styles.section}>Student wellbeing (IDs only)</Text>
//       {data?.studentWellbeing.map((s) => (
//         <View key={s.studentId} style={styles.row}>
//           <Text style={styles.id}>Student {s.studentId.slice(-3)}</Text>
//           <Text style={styles.muted}>
//             Stress {s.avgStress.toFixed(1)} · Mood {s.avgMood.toFixed(1)} · {s.entryCount} logs
//           </Text>
//         </View>
//       ))} */}
//     </ScreenContainer>
//   );
// };

// const styles = StyleSheet.create({
//   note: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.md },
//   metric: { fontSize: 15, color: colors.text, marginVertical: 4 },
//   section: { fontSize: 16, fontWeight: '700', marginVertical: spacing.sm, color: colors.text },
//   cause: { fontWeight: '600', color: colors.text },
//   count: { color: colors.textMuted, fontSize: 12 },
//   row: {
//     backgroundColor: colors.surface,
//     padding: spacing.md,
//     borderRadius: 12,
//     marginBottom: spacing.sm,
//   },
//   id: { fontWeight: '700', color: colors.primary },
//   muted: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
// });

import React, { useCallback, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as moodService from '../../services/moodService';
import { CounsellorAnalytics } from '../../types';
import { colors, spacing } from '../../utils/theme';

type ViewMode = 'weekly' | 'monthly';

export const CounsellorInsightsScreen: React.FC = () => {
  const [data, setData] = useState<CounsellorAnalytics | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  useFocusEffect(
    useCallback(() => {
      moodService.getCounsellorAnalytics().then(setData).catch(() => setData(null));
    }, [])
  );

  if (!data) {
    return (
      <ScreenContainer title="Counsellor Insights">
        <Text style={styles.empty}>Loading aggregate counsellor metrics...</Text>
      </ScreenContainer>
    );
  }

  // ==========================================================
  // EXTRACT SYSTEM METRICS BASED ON THE SELECTOR
  // ==========================================================
  let activeAvgMood = 0;
  let activeAvgStress = 0;
  let aggregateCauses: Record<string, number> = {};

  if (viewMode === 'weekly') {
    const latestWeek = data.weekly.at(-1);
    if (latestWeek) {
      activeAvgMood = latestWeek.avgMood;
      activeAvgStress = latestWeek.avgStress;
      aggregateCauses = latestWeek.causes;
    }
  } else {
    const latestMonth = data.monthly.at(-1);
    if (latestMonth) {
      activeAvgMood = latestMonth.avgMood;
      activeAvgStress = latestMonth.avgStress;
      aggregateCauses = latestMonth.causes;
    }
  }

  // Compile individual days' keys down into a descending list
  const topTriggers = Object.entries(aggregateCauses)
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Show top 5 global problems

  return (
    <ScreenContainer title="Insights">
      <Text style={styles.note}>
        Aggregated student population data — individual identities hidden
      </Text>

      {/* View Segment Switcher */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'weekly' && styles.toggleBtnActive]}
          onPress={() => setViewMode('weekly')}
        >
          <Text style={[styles.toggleText, viewMode === 'weekly' && styles.toggleTextActive]}>Weekly Metrics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'monthly' && styles.toggleBtnActive]}
          onPress={() => setViewMode('monthly')}
        >
          <Text style={[styles.toggleText, viewMode === 'monthly' && styles.toggleTextActive]}>Monthly Metrics</Text>
        </TouchableOpacity>
      </View>

      {/* Global Metadata Block */}
      <Card>
        <Text style={styles.cardHeader}>
          Population Overview ({viewMode === 'weekly' ? 'This Week' : 'This Month'})
        </Text>
        <View style={styles.metaGrid}>
          <Text style={styles.metric}>Active Students Tracked: <Text style={styles.boldText}>{data.studentCount}</Text></Text>
          <Text style={styles.metric}>Total Logs Compiled: <Text style={styles.boldText}>{data.totalEntries}</Text></Text>
          <View style={styles.divider} />
          <Text style={styles.metric}>
            Population Avg Mood:{' '}
            <Text style={[styles.boldText, { color: colors.primary }]}>
              {activeAvgMood ? activeAvgMood.toFixed(1) : '—'}/5
            </Text>
          </Text>
          <Text style={styles.metric}>
            Population Avg Stress:{' '}
            <Text style={[styles.boldText, { color: '#FF6B6B' }]}>
              {activeAvgStress ? activeAvgStress.toFixed(1) : '—'}/5
            </Text>
          </Text>
        </View>
      </Card>

      {/* Anonymized Top Environmental Stress Triggers */}
      <Text style={styles.section}>
        Top Stress Triggers ({viewMode === 'weekly' ? 'Weekly' : 'Monthly'})
      </Text>
      
      {topTriggers.length ? (
        topTriggers.map((c) => (
          <Card key={c.cause}>
            <View style={styles.causeRow}>
              <Text style={styles.cause}>{c.cause}</Text>
              <Text style={styles.count}>{c.count} absolute reports</Text>
            </View>
          </Card>
        ))
      ) : (
        <Text style={styles.empty}>No student stress entries recorded for this scale.</Text>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  note: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#eaeaea',
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.md,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontWeight: '600',
    color: '#666',
    fontSize: 13,
  },
  toggleTextActive: {
    color: colors.primary,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  metaGrid: {
    paddingVertical: 4,
  },
  metric: { fontSize: 14, color: colors.text, marginVertical: 4 },
  boldText: { fontWeight: '700' },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: spacing.xs,
  },
  section: { fontSize: 16, fontWeight: '700', marginVertical: spacing.sm, color: colors.text, marginTop: spacing.md },
  causeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cause: { fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  count: { color: colors.textMuted, fontSize: 12 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});