import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '../../components/Card';
import { EmptyInsights } from '../../components/insights/EmptyInsights';
import { InsightsDashboard } from '../../components/insights/InsightsDashboard';
import { InsightsLoadState } from '../../components/insights/InsightsLoadState';
import { useInsightsData } from '../../components/insights/useInsightsData';
import { ScreenContainer } from '../../components/ScreenContainer';
import * as moodService from '../../services/moodService';
import { AnalyticsSource } from '../../utils/insights';
import { colors, palette, spacing } from '../../utils/theme';

const CoverageStat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.coverageStat} accessible accessibilityLabel={`${label}: ${value}`}>
    <Text style={styles.coverageValue}>{value}</Text>
    <Text style={styles.coverageLabel}>{label}</Text>
  </View>
);

/** Population-level mood and stress across all students, with identities hidden. */
export const CounsellorInsightsScreen: React.FC = () => {
  const { data, error, reload } = useInsightsData(moodService.getCounsellorAnalytics);

  // The counsellor endpoint calls the per-day series `daily`; the shared dashboard expects `trend`.
  const source = useMemo<AnalyticsSource | null>(
    () => (data ? { trend: data.daily, weekly: data.weekly, monthly: data.monthly } : null),
    [data]
  );

  return (
    <ScreenContainer title="insights.">
      {data && source ? (
        <InsightsDashboard
          source={source}
          audience="counsellor"
          intro={
            <Text style={styles.note}>
              Aggregated student data — individual identities are hidden.
            </Text>
          }
          underNavigator={
            <Card style={styles.coverageCard}>
              <View style={styles.coverageRow}>
                <CoverageStat label="Students tracked" value={data.studentCount} />
                <View style={styles.coverageDivider} />
                <CoverageStat label="Logs compiled" value={data.totalEntries} />
              </View>
            </Card>
          }
          renderEmpty={(unit) => (
            <EmptyInsights
              title="No student data yet"
              body={`Once students start checking in, their ${unit}ly averages, triggers and patterns will show up here.`}
            />
          )}
        />
      ) : (
        <InsightsLoadState error={error} onRetry={reload} />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  note: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md },
  coverageCard: { marginBottom: 0 },
  coverageRow: { flexDirection: 'row', alignItems: 'center' },
  coverageStat: { flex: 1, alignItems: 'center' },
  coverageDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: palette.border },
  coverageValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  coverageLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  coverageCaption: { fontSize: 11, color: palette.textFaint, textAlign: 'center', marginTop: spacing.sm },
});
