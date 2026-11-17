import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FadeSlideIn } from './FadeSlideIn';
import { MetricCard } from './MetricCard';
import { PeriodNavigator } from './PeriodNavigator';
import { RhythmChart } from './RhythmChart';
import { SectionHeader } from './SectionHeader';
import { SegmentedToggle } from './SegmentedToggle';
import { TakeawayList } from './TakeawayList';
import { TriggerList } from './TriggerList';
import {
  AnalyticsSource,
  Audience,
  COPY,
  MODES,
  Unit,
  ViewMode,
  buildRhythm,
  buildTakeaways,
  deltaBadge,
  rhythmInfo,
  toPeriods,
} from '../../utils/insights';
import { spacing } from '../../utils/theme';

interface InsightsDashboardProps {
  /** Memoise this in the caller: periods are recomputed whenever the reference changes. */
  source: AnalyticsSource;
  audience: Audience;
  /** What to show when there is no data at all. */
  renderEmpty: (unit: Unit) => React.ReactNode;
  /** Rendered above the Weekly/Monthly toggle. */
  intro?: React.ReactNode;
  /** Rendered directly beneath the period navigator (only when there is data). */
  underNavigator?: React.ReactNode;
}

/**
 * Weekly / monthly mood-and-stress dashboard shared by the student and counsellor Insights screens.
 * Render it inside a ScreenContainer.
 */
export const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  source,
  audience,
  renderEmpty,
  intro,
  underNavigator,
}) => {
  const copy = COPY[audience];
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  // How many periods back from the latest one we're looking at (0 = latest).
  // Stored as an offset so a refresh that appends a new period doesn't shift the selection.
  const [stepsBack, setStepsBack] = useState(0);

  const periods = useMemo(() => toPeriods(source, viewMode), [source, viewMode]);
  const { unit, unitShort } = MODES.find((m) => m.key === viewMode)!;

  const index = Math.max(0, periods.length - 1 - stepsBack);
  const current = periods[index];
  const previous = periods[index - 1];

  const changeMode = (mode: ViewMode) => {
    setViewMode(mode);
    setStepsBack(0);
  };

  return (
    <>
      {intro}

      <View style={styles.toggleWrap}>
        <SegmentedToggle
          options={MODES.map(({ key, label }) => ({ key, label }))}
          value={viewMode}
          onChange={changeMode}
        />
      </View>

      {!current ? (
        renderEmpty(unit)
      ) : (
        <View style={styles.stack}>
          <PeriodNavigator
            label={current.label}
            meta={copy.daysMeta(current.daysLogged)}
            canGoPrev={index > 0}
            canGoNext={stepsBack > 0}
            onPrev={() => setStepsBack((n) => n + 1)}
            onNext={() => setStepsBack((n) => Math.max(0, n - 1))}
          />

          {underNavigator}

          {/* Re-keyed so the content replays its fade/slide when the period or mode changes */}
          <FadeSlideIn key={`${viewMode}-${current.id}`} style={styles.stack}>
            <View style={styles.heroRow}>
              <MetricCard
                label="Mood"
                tone="mood"
                value={current.avgMood}
                badge={deltaBadge(
                  previous ? current.avgMood - previous.avgMood : null,
                  true,
                  unit,
                  unitShort
                )}
              />
              <MetricCard
                label="Stress"
                tone="stress"
                value={current.avgStress}
                badge={deltaBadge(
                  previous ? current.avgStress - previous.avgStress : null,
                  false,
                  unit,
                  unitShort
                )}
              />
            </View>

            <RhythmChart
              title={viewMode === 'weekly' ? 'Daily rhythm' : 'Weekly rhythm'}
              info={rhythmInfo(audience, viewMode)}
              points={buildRhythm(current, viewMode, source.trend)}
            />

            {/* Last section: how the period compares, plus what is driving the stress */}
            <View>
              {/* <SectionHeader title="Key takeaways" caption="At a glance" /> */}
              <View style={styles.takeaways}>
                {/* <TakeawayList items={buildTakeaways(current, previous, unit, audience)} unit={unit} /> */}
                <TriggerList
                  title="Top stress triggers"
                  countNoun={copy.countNoun}
                  triggers={Object.entries(current.causes)
                    .map(([cause, count]) => ({ cause, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, copy.maxTriggers)}
                />
              </View>
            </View>
          </FadeSlideIn>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  toggleWrap: { marginBottom: spacing.md },
  stack: { gap: spacing.md },
  heroRow: { flexDirection: 'row', gap: spacing.sm + 4 },
  takeaways: { gap: spacing.sm },
});
