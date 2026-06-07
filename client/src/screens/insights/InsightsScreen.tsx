// import React, { useCallback, useState } from 'react';
// import { StyleSheet, View } from 'react-native';
// import { Text } from 'react-native-paper';
// import { useFocusEffect } from '@react-navigation/native';
// import { Card } from '../../components/Card';
// import { ScreenContainer } from '../../components/ScreenContainer';
// import * as moodService from '../../services/moodService';
// import { MoodAnalytics } from '../../types';
// import { MOOD_LABELS } from '../../utils/constants';
// import { colors, spacing } from '../../utils/theme';

// export const InsightsScreen: React.FC = () => {
//   const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);

//   useFocusEffect(
//     useCallback(() => {
//       moodService.getMoodAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
//     }, [])
//   );

//   const avgMoodLabel = analytics
//     ? MOOD_LABELS[Math.round(analytics.averages.mood) as keyof typeof MOOD_LABELS] || '—'
//     : '—';

//   return (
//     <ScreenContainer title="Insights">
//       <Card>
//         <Text style={styles.metricLabel}>14-day average mood</Text>
//         <Text style={styles.metricValue}>{avgMoodLabel}</Text>
//         <Text style={styles.metricSub}>
//           {/* Stress avg: {analytics ? analytics.averages.stress.toFixed(1) : '—'} / 5 */}
//           Average mood level over the past 14 days, calculated from your daily check-ins.
//         </Text>
//       </Card>

//       <Text style={styles.section}>Top stress causes</Text>
//       {analytics?.topStressCauses.length ? (
//         analytics.topStressCauses.map((c) => (
//           <Card key={c.cause}>
//             <Text style={styles.cause}>{c.cause}</Text>
//             <Text style={styles.count}>{c.count} entries</Text>
//           </Card>
//         ))
//       ) : (
//         <Text style={styles.empty}>Log moods to see insights over time.</Text>
//       )}

//       <Text style={styles.section}>Recent trend</Text>
//       {analytics?.trend.slice(0, 5).map((t, i) => (
//         <View key={i} style={styles.trendRow}>
//           <Text style={styles.trendDate}>{new Date(t.date).toLocaleDateString()}</Text>
//           <Text>Mood {t.mood} · Stress {t.stress}</Text>
//         </View>
//       ))}
//     </ScreenContainer>
//   );
// };

// const styles = StyleSheet.create({
//   metricLabel: { color: colors.textMuted },
//   metricValue: { fontSize: 28, fontWeight: '800', color: colors.primary, marginVertical: spacing.xs },
//   metricSub: { color: colors.textMuted },
//   section: { fontSize: 16, fontWeight: '700', marginVertical: spacing.sm, color: colors.text },
//   cause: { fontWeight: '600', color: colors.text },
//   count: { color: colors.textMuted, fontSize: 12 },
//   empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
//   trendRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: spacing.md,
//     backgroundColor: colors.surface,
//     borderRadius: 12,
//     marginBottom: spacing.sm,
//   },
//   trendDate: { color: colors.textMuted },
// });

import React, { useCallback, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as moodService from '../../services/moodService';
import { MoodAnalytics } from '../../types';
import { colors, spacing } from '../../utils/theme';

type ViewMode = 'weekly' | 'monthly';

export const InsightsScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  useFocusEffect(
    useCallback(() => {
      moodService.getMoodAnalytics().then(setAnalytics).catch(() => setAnalytics(null));
    }, [])
  );

  if (!analytics) {
    return (
      <ScreenContainer title="Insights">
        <Text style={styles.empty}>Loading analytics data...</Text>
      </ScreenContainer>
    );
  }

  // ==========================================
  // EXTRACT MODE SPECIFIC METRICS
  // ==========================================
  let displayAvgMood = 0;
  let displayAvgStress = 0;
  let rawCauses: Record<string, number> = {};

  if (viewMode === 'weekly') {
    // Grab the latest week object from your backend buildWeeklyStats array
    const currentWeek = analytics.weekly.at(-1);
    if (currentWeek) {
      displayAvgMood = currentWeek.avgMood;
      displayAvgStress = currentWeek.avgStress;
      rawCauses = currentWeek.causes;
    }
  } else {
    // Grab the latest month object from your backend buildMonthlyStats array
    const currentMonth = analytics.monthly.at(-1);
    if (currentMonth) {
      displayAvgMood = currentMonth.avgMood;
      displayAvgStress = currentMonth.avgStress;
      rawCauses = currentMonth.causes;
    }
  }

  // Format stress causes map into a sorted array for display
  const sortedCauses = Object.entries(rawCauses)
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3); // Top 3 causes

  return (
    <ScreenContainer title="Insights">
      
      {/* Segmented Toggle Control */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'weekly' && styles.toggleBtnActive]}
          onPress={() => setViewMode('weekly')}
        >
          <Text style={[styles.toggleText, viewMode === 'weekly' && styles.toggleTextActive]}>Weekly View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'monthly' && styles.toggleBtnActive]}
          onPress={() => setViewMode('monthly')}
        >
          <Text style={[styles.toggleText, viewMode === 'monthly' && styles.toggleTextActive]}>Monthly View</Text>
        </TouchableOpacity>
      </View>

      {/* Averages Display */}
      <Card>
        <Text style={styles.metricLabel}>
          {viewMode === 'weekly' ? 'Current Week Averages' : 'Current Month Averages'}
        </Text>
        <View style={styles.statsGrid}>
          <View>
            <Text style={[styles.metricValue, { color: colors.primary }]}>
              {displayAvgMood ? displayAvgMood.toFixed(1) : '—'}/5
            </Text>
            <Text style={styles.metricSub}>Average Mood</Text>
          </View>
          <View>
            <Text style={[styles.metricValue, { color: '#FF6B6B' }]}>
              {displayAvgStress ? displayAvgStress.toFixed(1) : '—'}/5
            </Text>
            <Text style={styles.metricSub}>Average Stress</Text>
          </View>
        </View>
      </Card>

      {/* Stress Triggers section */}
      <Text style={styles.section}>
        Top triggers {viewMode === 'weekly' ? 'this week' : 'this month'}
      </Text>
      
      {sortedCauses.length ? (
        sortedCauses.map((c) => (
          <Card key={c.cause}>
            <View style={styles.causeRow}>
              <Text style={styles.cause}>{c.cause}</Text>
              <Text style={styles.count}>{c.count} times logged</Text>
            </View>
          </Card>
        ))
      ) : (
        <Text style={styles.empty}>No stress causes logged for this period.</Text>
      )}

      {/* Dynamic Percentages & Insights Placeholder */}
      <Text style={styles.section}>Insights</Text>
      <Card>
        <Text style={styles.insightPlaceholder}>
          [Under Development!]
        </Text>
      </Card>

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
  },
  toggleTextActive: {
    color: colors.primary,
  },
  metricLabel: { 
    color: colors.textMuted, 
    marginBottom: spacing.xs,
    fontWeight: '600'
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.xs
  },
  metricValue: { 
    fontSize: 26, 
    fontWeight: '800', 
    textAlign: 'center'
  },
  metricSub: { 
    color: colors.textMuted, 
    fontSize: 12, 
    textAlign: 'center' 
  },
  section: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginVertical: spacing.sm, 
    color: colors.text, 
    marginTop: spacing.md 
  },
  causeRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 2 
  },
  cause: { 
    fontWeight: '600', 
    color: colors.text, 
    textTransform: 'capitalize' 
  },
  count: { 
    color: colors.textMuted, 
    fontSize: 12 
  },
  empty: { 
    color: colors.textMuted, 
    textAlign: 'center', 
    marginTop: spacing.md 
  },
  insightPlaceholder: {
    fontStyle: 'italic',
    color: colors.textMuted,
    lineHeight: 20
  }
});