import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InfoTip } from '../InfoTip';
import { StressAnalysis } from '../../types';
import { colors, palette, radius, spacing } from '../../utils/theme';

export const STRESS_LABELS = ['Very low', 'Low', 'Moderate', 'High', 'Very high'];

export const effectiveScore = (a: StressAnalysis) =>
  a.review === 'corrected' && a.user_score ? a.user_score : (a.ai_score as number);

/** True when a stress tag has something to show (still reading, or finished). */
export const hasStressTag = (a?: StressAnalysis) => a?.status === 'pending' || a?.status === 'success';

interface Props {
  analysis?: StressAnalysis;
  /** Persist the student's decision; the parent updates its own state. Should throw on failure. */
  onReview: (action: 'affirm' | 'correct', score?: number) => Promise<void>;
  /** Re-fetch this item; called every few seconds while the AI is still reading. */
  onRefresh?: () => Promise<void>;
  /** Extra privacy note shown in the ⓘ popup (e.g. who can see this). */
  info?: string;
}

const BASE_INFO =
  'This is an AI estimate based only on your words. Tap Accurate to confirm it, or Change to set your own rating. Your rating always replaces the AI’s.';

const POLL_MS = 3000;
const MAX_POLLS = 40;

/**
 * Small, quiet row under an entry:
 *   [AI estimate · Stress 3/5]   ✓ Accurate   ✎ Change
 * After the student responds it becomes  [Stress 3/5 · confirmed]  ✎ Change.
 */
export const StressReview: React.FC<Props> = ({ analysis, onReview, onRefresh, info }) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState(3);

  // Poll while the model is still working, without restarting the timer on every render.
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;
  const isPending = analysis?.status === 'pending';
  useEffect(() => {
    if (!isPending) return;
    let polls = 0;
    const timer = setInterval(() => {
      if (++polls > MAX_POLLS) {
        clearInterval(timer);
        return;
      }
      refreshRef.current?.().catch(() => undefined);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [isPending]);

  if (!analysis) return null;

  if (isPending) {
    return (
      <View style={styles.row}>
        <View style={[styles.pill, styles.pillMuted]}>
          <Text style={styles.pillTextMuted}>Reading your entry…</Text>
        </View>
      </View>
    );
  }

  if (analysis.status !== 'success' || !analysis.ai_score) return null;

  const score = effectiveScore(analysis);
  const reviewed = analysis.review !== 'pending';

  const run = async (action: 'affirm' | 'correct', value?: number) => {
    try {
      setBusy(true);
      await onReview(action, value);
      setSheetOpen(false);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  const openSheet = () => {
    setPicked(score);
    setSheetOpen(true);
  };

  return (
    <View style={styles.row}>
      <View style={[styles.pill, reviewed && styles.pillDone]}>
        <Text style={[styles.pillText, reviewed && styles.pillTextDone]}>
          {reviewed
            ? `Stress ${score}/5 · ${analysis.review === 'affirmed' ? 'confirmed' : 'your rating'}`
            : `AI estimate · Stress ${score}/5`}
        </Text>
      </View>

      {!reviewed && (
        <Pressable
          onPress={() => run('affirm')}
          disabled={busy}
          hitSlop={8}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel="Accurate: confirm this stress estimate"
        >
          <Ionicons name="checkmark" size={13} color={palette.okText} />
          <Text style={[styles.actionText, { color: palette.okText }]}>Accurate</Text>
        </Pressable>
      )}
      <Pressable
        onPress={openSheet}
        disabled={busy}
        hitSlop={8}
        style={styles.action}
        accessibilityRole="button"
        accessibilityLabel="Change the stress rating"
      >
        <Ionicons name="pencil" size={12} color={colors.secondary} />
        <Text style={[styles.actionText, { color: colors.secondary }]}>Change</Text>
      </Pressable>
      <InfoTip title="About this estimate" text={info ? `${BASE_INFO}\n\n${info}` : BASE_INFO} size={15} />

      <Modal visible={sheetOpen} transparent animationType="fade" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          {/* inner Pressable swallows taps so the sheet doesn't close when touched */}
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.title}>How stressed did you feel?</Text>
            <Text style={styles.sub}>The AI guessed {analysis.ai_score}/5. Pick what fits you best.</Text>

            <View style={styles.scale}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  key={n}
                  onPress={() => setPicked(n)}
                  accessibilityLabel={`${n}, ${STRESS_LABELS[n - 1]}`}
                  style={[styles.dot, picked === n && styles.dotActive]}
                >
                  <Text style={[styles.dotText, picked === n && styles.dotTextActive]}>{n}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.scaleEnds}>
              <Text style={styles.scaleEnd}>Not stress</Text>
              <Text style={styles.scaleEnd}>Very stress</Text>
            </View>
            <Text style={styles.scaleLabel}>{STRESS_LABELS[picked - 1]}</Text>

            <Pressable style={styles.save} disabled={busy} onPress={() => run('correct', picked)}>
              <Text style={styles.saveText}>{busy ? 'Saving...' : 'Save'}</Text>
            </Pressable>
            <Pressable onPress={() => setSheetOpen(false)} hitSlop={8}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },

  // Same look as the peer card's tag badges so it blends into existing cards.
  pill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  pillDone: { backgroundColor: palette.okBg },
  pillMuted: { backgroundColor: palette.surfaceAlt },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  pillTextDone: { color: palette.okText },
  pillTextMuted: { fontSize: 11, color: colors.textMuted },

  action: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  actionText: { fontSize: 11, fontWeight: '700' },

  backdrop: { flex: 1, backgroundColor: palette.overlay, justifyContent: 'center', padding: spacing.lg },
  sheet: { backgroundColor: palette.white, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md, textAlign: 'center' },
  scale: { flexDirection: 'row', gap: spacing.sm },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
  },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotText: { fontSize: 16, fontWeight: '700', color: colors.text },
  dotTextActive: { color: palette.white },
  scaleEnds: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: 6 },
  scaleEnd: { fontSize: 11, color: colors.textMuted },
  scaleLabel: { marginTop: spacing.xs, fontSize: 13, fontWeight: '700', color: colors.text },
  save: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  saveText: { color: palette.white, fontWeight: '700' },
  cancel: { marginTop: spacing.sm, color: colors.textMuted, fontSize: 13 },
});
