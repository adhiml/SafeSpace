import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { MoodSelectorBar } from '../../components/MoodSelectorBar';
import { RecommendationCarousel } from '../../components/RecommendationCarousel';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useMood } from '../../context/MoodContext';
import { useRole } from '../../context/RoleContext';
import * as moodService from '../../services/moodService';
import { MoodAnalytics, MoodEntry, StudentStackParamList } from '../../types';
import { MOOD_COLORS, MOOD_LABELS, STRESS_CAUSES } from '../../utils/constants'; // Loaded from your constants
import { getRecommendations } from '../../utils/recommendations';
import { colors, radius, spacing } from '../../utils/theme';
import { WeeklyMoodChart } from '../../components/charts/WeeklyMoodChart';

// Enable LayoutAnimation for Android devices 
// it's because Android purposely disable animations to save memory
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const MoodHomeScreen: React.FC = () => {
  const { profile } = useRole();
  const { latestMood, setLatestMood, refreshMoods, needsCheckIn } = useMood();
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);
  const [updating, setUpdating] = useState(false);

  // States to handle our folding drawer panel
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [pendingMoodLevel, setPendingMoodLevel] = useState<number | null>(null);
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      refreshMoods().catch(() => undefined);
      moodService.getMoods().then(setHistory).catch(() => setHistory([]));
      
      moodService.getMoodAnalytics()

      .then((data) => {

        // console.log("--- REAL BACKEND PAYLOAD ARRIVING ---", JSON.stringify(data, null, 2));

        setAnalytics(data);

      })

      .catch(() => undefined);

      if (needsCheckIn) {
        navigation.navigate('MoodCheckIn');
      }
    }, [refreshMoods, needsCheckIn, navigation])
  );

  const currentLevel = latestMood?.mood_level ?? 3;
  const stressLevel = latestMood?.stress_level ?? 3;

  // Triggers the smooth expand/fold transition
  const handleMoodSelect = (level: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPendingMoodLevel(level);
    setSelectedCauses([]); // Clear selections for a clean start
    setIsPanelOpen(true);
  };

  const toggleCause = (cause: string) => {
    setSelectedCauses((prev) =>
      prev.includes(cause) ? prev.filter((c) => c !== cause) : [...prev, cause]
    );
  };

  const handleSave = async (shouldSkip: boolean) => {
    if (pendingMoodLevel === null) return;

    try {
      setUpdating(true);
      // Folds the card panel up smoothly
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsPanelOpen(false);

      const entry = await moodService.createMood({
        mood_level: pendingMoodLevel,
        stress_level: shouldSkip ? 1 : stressLevel,
        stress_causes: shouldSkip ? [] : selectedCauses,
      });

      setLatestMood(entry);
      const [moods, updatedAnalytics] = await Promise.all([
        moodService.getMoods(),
        moodService.getMoodAnalytics()
      ]);
      setHistory(moods);
      setAnalytics(updatedAnalytics);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save mood');
    } finally {
      setUpdating(false);
      setPendingMoodLevel(null);
    }
  };

  return (
    <ScreenContainer title="Mood" isHome>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={styles.welcomeRow}>
          <Text style={styles.welcome}>Welcome back, </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.nameLink}>{profile?.user_name || 'Student'}</Text>
          </TouchableOpacity>
        </View>

        {/* The main interactive mood tracker */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Current's mood</Text>
          <Text style={styles.currentMood}>
            {MOOD_LABELS[currentLevel]} {updating ? '(saving...)' : ''}
          </Text>
          <MoodSelectorBar selectedLevel={currentLevel} onSelect={handleMoodSelect} variant={"home"}/>
        </Card>

        {/* Foldable Stress Causes Section --- */}
        {isPanelOpen && (
          <Card>
            <Text style={styles.foldableHeading}>What's contributing to your stress? (Optional)</Text>
            <Text style={styles.foldableSub}>Select all that apply — or skip if you prefer.</Text>
            
            <View style={styles.chips}>
              {STRESS_CAUSES.map((cause) => {
                const active = selectedCauses.includes(cause);
                return (
                  <TouchableOpacity
                    key={cause}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleCause(cause)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{cause}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actionButtonRow}>
              <PrimaryButton label="Save" onPress={() => handleSave(false) }/>
              <PrimaryButton label="Skip" 
                onPress={() => handleSave(true)} 
                mode="text" 
                color={colors.textMuted} />
            </View>
          </Card>
        )}

        {!analytics ? (
        <Card style={{ padding: spacing.md, alignItems: 'center' }}>
          <Text style={styles.empty}>
            Logging more moods will unlock your personalized weekly and monthly charts!
          </Text>
        </Card>
      ) : (
        <WeeklyMoodChart
          analytics={analytics}
        />
      )}

        <Text style={styles.sectionTitle}>Recommendations for you</Text>
        <RecommendationCarousel items={getRecommendations(stressLevel)} />

        <Text style={[styles.sectionTitle, styles.historyTitle]}>Mood history</Text>
        {history.length === 0 ? (
          <Text style={styles.empty}>No mood entries yet.</Text>
        ) : (
          history.slice(0, 7).map((entry) => (
            <View key={entry._id} style={styles.historyRow}>
              <View style={[styles.moodDot, { backgroundColor: MOOD_COLORS[entry.mood_level] }]} />
              <View style={styles.historyBody}>
                <Text style={styles.historyMood}>{MOOD_LABELS[entry.mood_level]}</Text>
                <Text style={styles.historyMeta}>
                  Stress {entry.stress_level}/5 · {new Date(entry.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  welcomeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  welcome: { fontSize: 22, color: colors.text, fontWeight: '500' },
  nameLink: { fontSize: 22, color: colors.primary, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  currentMood: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.xs },
  historyTitle: { marginTop: spacing.lg },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  moodDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.md },
  historyBody: { flex: 1 },
  historyMood: { fontWeight: '700', color: colors.text },
  historyMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },

  // --- Foldable Panel Styles ---
  foldableHeading: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  foldableSub: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12 },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  halfBtn: {
    flex: 1,
  },
});