import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { TrendPoint } from '../../types/chart';
import { colors, spacing } from '../../utils/theme';

interface MoodTrendChartProps {
  data: TrendPoint[];
  title?: string;
  height?: number;
  showLegend?: boolean;
}

export const MoodTrendChart: React.FC<MoodTrendChartProps> = ({
  data,
  title = 'Mood Trend',
  height = 180,
  showLegend = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>No data available</Text>
      </View>
    );
  }

  // Convert TrendPoint → Gifted Charts format
  const moodData = data.map((item) => ({
    value: item.mood,
    label: item.date.slice(5, 10), // "MM-DD" -> change to day
  }));

  const stressData = data.map((item) => ({
    value: item.stress,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {showLegend && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text>Mood</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
            <Text>Stress</Text>
          </View>
        </View>
      )}

      <LineChart
        data={moodData}
        data2={stressData}
        height={height}
        spacing={40}
        initialSpacing={10}
        color1={colors.primary}
        color2="#FF6B6B"
        thickness={2}
        dataPointsColor1={colors.primary}
        dataPointsColor2="#FF6B6B"
        hideDataPoints={false}
        curved
        areaChart={false}
        yAxisThickness={0}
        xAxisThickness={0}
        noOfSections={4}
      />

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  empty: {
    padding: spacing.md,
    alignItems: 'center',
  },
});
