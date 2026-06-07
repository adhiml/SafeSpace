import React from 'react';
import { View, Text, TouchableOpacity , StyleSheet} from 'react-native';

import { toTrendPoints } from '../../utils/mapper';
import { MoodTrendChart } from './MoodTrendChart';

import { MoodAnalytics } from '../../types';
import { colors, spacing } from '../../utils/theme';
import { Card } from '../Card';
import { NavigationProp, useNavigation } from '@react-navigation/native';

interface WeeklyMoodChartProps {
  analytics: MoodAnalytics;
}

export const WeeklyMoodChart: React.FC<WeeklyMoodChartProps> = ({ analytics }) => {

  const navigation = useNavigation<any>();

  // 1. Grab the exact same last 7 days used for the chart line
  const currentWeekData = analytics.trend.slice(-7);

  // 2. Calculate the averages safely inline
  const totalDays = currentWeekData.length;
  const avgMood = totalDays 
    ? currentWeekData.reduce((sum, item) => sum + item.mood, 0) / totalDays 
    : 0;
  const avgStress = totalDays 
    ? currentWeekData.reduce((sum, item) => sum + item.stress, 0) / totalDays 
    : 0;
    
  return (
    <Card>
      <View>
        <MoodTrendChart
          data={toTrendPoints(analytics.trend.slice(-7))}
          title="Current Week Progress"
        />

      {/* Footer / metadata */}
      <View style={styles.chartFooter}>
        <View style={styles.metaColumn}>
          <Text style={styles.avgLabel}>Avg Mood</Text>

          <Text style={[styles.avgValue, { color: colors.primary }]}>
            {(avgMood || 0).toFixed(1)}/5
          </Text>
        </View>

        <View style={styles.metaColumn}>
          <Text style={styles.avgLabel}>Avg Stress</Text>

          <Text style={[styles.avgValue, { color: '#FF6B6B' }]}>
            {(avgStress || 0).toFixed(1)}/5
          </Text>
        </View>

        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => {navigation.navigate('Insights')}}
        >
          <Text style={styles.detailsBtnText}>
            View Insights
          </Text>
        </TouchableOpacity>
      </View>
    </View></Card>
  );
};

const styles = StyleSheet.create({
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  metaColumn: {
    flexDirection: 'column',
  },
  avgLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  avgValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailsBtn: {
    borderWidth: 1,
    borderColor: colors.border || '#ccc',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});