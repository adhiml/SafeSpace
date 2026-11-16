import React, { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChartSeries, MoodTrendChart, STRESS_COLOR } from './MoodTrendChart';
import { InfoTip } from '../InfoTip';
import { Card } from '../Card';
import { MoodAnalytics } from '../../types';
import { WeekPoint } from '../../types/chart';
import { colors, palette, radius, spacing } from '../../utils/theme';

interface WeeklyMoodChartProps {
  analytics: MoodAnalytics;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PAGES: { series: ChartSeries; title: string; info: string; color: string }[] = [
  {
    series: 'mood',
    title: 'Mood this week',
    color: colors.primary,
    info: 'One dot per day, Sunday to Saturday of the current week. If you check in more than once in a day, your check-ins are averaged. Days without a check-in are left blank.',
  },
  {
    series: 'stress',
    title: 'Stress this week',
    color: STRESS_COLOR,
    info: 'One dot per day. It blends the average of that day\'s check-ins with what you wrote that day, the same way Today\'s stress does. Days without a check-in are left blank.',
  },
];

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Sunday–Saturday of the current calendar week (same week start as the server's weekly stats). */
const buildCurrentWeek = (trend: MoodAnalytics['trend']): WeekPoint[] => {
  const byDate = new Map(trend.map((t) => [t.date, t]));
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return DAY_LABELS.map((label, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const entry = byDate.get(dateKey(day));
    return { label, mood: entry?.mood, stress: entry?.stress };
  });
};

const avg = (xs: (number | undefined)[]) => {
  const vals = xs.filter((x): x is number => typeof x === 'number');
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
};

/** Two swipeable cards: one for mood, one for stress. */
export const WeeklyMoodChart: React.FC<WeeklyMoodChartProps> = ({ analytics }) => {
  const navigation = useNavigation<any>();
  const [pageWidth, setPageWidth] = useState(0);
  const [page, setPage] = useState(0);

  const week = useMemo(() => buildCurrentWeek(analytics.trend), [analytics.trend]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth) setPage(Math.round(e.nativeEvent.contentOffset.x / pageWidth));
  };

  return (
    <View onLayout={(e: LayoutChangeEvent) => setPageWidth(e.nativeEvent.layout.width)}>
      {pageWidth > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          // room for the card shadow, which a scroll view would otherwise clip
          contentContainerStyle={styles.pagerContent}
          style={styles.pager}
        >
          {PAGES.map(({ series, title, info, color }) => {
            const values = week.map((p) => p[series]);
            const average = avg(values);
            return (
              <View key={series} style={{ width: pageWidth }}>
                <Card style={styles.card}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{title}</Text>
                    <InfoTip title={title} text={info} />
                  </View>

                  {average === null ? (
                    <Text style={styles.empty}>No check-ins yet this week.</Text>
                  ) : (
                    <MoodTrendChart data={week} series={series} />
                  )}

                  <View style={styles.footer}>
                    <View>
                      <Text style={styles.avgLabel}>Avg {series}</Text>
                      <Text style={[styles.avgValue, { color }]}>
                        {average === null ? '–' : `${average.toFixed(1)}/5`}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.detailsBtn} onPress={() => navigation.navigate('Insights')}>
                      <Text style={styles.detailsBtnText}>View Insights</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.dots}>
        {PAGES.map((p, i) => (
          <View key={p.series} style={[styles.pageDot, i === page && styles.pageDotActive]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pager: { flexGrow: 0 },
  pagerContent: { paddingBottom: spacing.xs},
  card: { marginBottom: 0 },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  empty: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  avgLabel: { fontSize: 11, color: colors.textMuted, textTransform: 'capitalize' },
  avgValue: { fontSize: 16, fontWeight: '700' },
  detailsBtn: {
    borderWidth: 1,
    borderColor: colors.border || '#ccc',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  detailsBtnText: { fontSize: 12, fontWeight: '600', color: colors.text },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: spacing.sm },
  pageDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.surfaceAlt },
  pageDotActive: { width: 16, backgroundColor: colors.primary },
});
