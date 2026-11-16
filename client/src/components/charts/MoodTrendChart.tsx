import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { WeekPoint } from '../../types/chart';
import { colors, spacing } from '../../utils/theme';

export const STRESS_COLOR = '#FF6B6B';

export type ChartSeries = 'mood' | 'stress';

interface MoodTrendChartProps {
  data: WeekPoint[];
  series: ChartSeries;
  height?: number;
}

const Y_AXIS_WIDTH = 34;

export const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ data, series, height = 160 }) => {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const color = series === 'mood' ? colors.primary : STRESS_COLOR;

  // Spread the 7 days across the card instead of a fixed pixel spacing.
  const spacingX = width ? Math.max(24, (width - Y_AXIS_WIDTH - 24) / (data.length - 1)) : 40;

  // Plot 0–4 and label the axis 1–5 ourselves. Using the library's yAxisOffset pushes the
  // placeholder it draws for days without a check-in to -1, which adds a negative axis section.
  const points = data.map((p) => {
    const v = series === 'mood' ? p.mood : p.stress;
    return { value: typeof v === 'number' ? v - 1 : undefined, label: p.label };
  });

  return (
    <View style={styles.container} onLayout={onLayout}>
      <LineChart
        data={points}
        height={height}
        width={Math.max(0, width - Y_AXIS_WIDTH)}
        spacing={spacingX}
        initialSpacing={12}
        endSpacing={12}
        color={color}
        dataPointsColor={color}
        thickness={2}
        dataPointsRadius={4}
        // Straight segments: smoothed curves overshoot and dip below the 1–5 scale.
        curved={false}
        onlyPositive
        // Days without a check-in stay as gaps instead of being joined by a line.
        interpolateMissingValues={false}
        // Fixed 1–5 scale so the chart reads the same all week.
        maxValue={4}
        noOfSections={4}
        yAxisLabelTexts={['1', '2', '3', '4', '5']}
        yAxisThickness={0}
        xAxisThickness={0}
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisText}
        rulesColor="#EEE5DD"
        yAxisLabelWidth={Y_AXIS_WIDTH - 10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.xs, overflow: 'hidden' },
  axisText: { fontSize: 10, color: colors.textMuted },
});
