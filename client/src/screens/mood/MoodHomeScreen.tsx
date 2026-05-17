import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card } from '../../components/Card';
import { MoodSelectorBar } from '../../components/MoodSelectorBar';
import { RecommendationCarousel } from '../../components/RecommendationCarousel';
import { ScreenContainer } from '../../components/ScreenContainer';
import { currentUser } from '../../constants/currentUser';
import { useMood } from '../../context/MoodContext';
import * as moodService from '../../services/moodService';
import { MoodEntry, RootStackParamList } from '../../types';
import { MOOD_COLORS, MOOD_LABELS } from '../../utils/constants';
import { getRecommendations } from '../../utils/recommendations';
import { colors, radius, spacing } from '../../utils/theme';

export const MoodHomeScreen: React.FC = () => {
  const { latestMood, setLatestMood, refreshMoods } = useMood();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [updating, setUpdating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshMoods().catch(() => undefined);
      moodService.getMoods().then(setHistory).catch(() => setHistory([]));
    }, [refreshMoods])
  );

  const currentLevel = latestMood?.mood_level ?? 3;
  const stressLevel = latestMood?.stress_level ?? 3;

  const handleMoodSelect = async (level: number) => {
    try {
      setUpdating(true);
      const entry = await moodService.createMood({
        mood_level: level,
        stress_level: stressLevel,
        stress_causes: latestMood?.stress_causes,
      });
      setLatestMood(entry);
      const moods = await moodService.getMoods();
      setHistory(moods);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save mood');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScreenContainer title="Mood" isHome>
      <View style={styles.welcomeRow}>
        <Text style={styles.welcome}>Welcome back, </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.nameLink}>{currentUser.user_name}</Text>
        </TouchableOpacity>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Today's mood</Text>
        <Text style={styles.currentMood}>
          {MOOD_LABELS[currentLevel]} {updating ? '(saving...)' : ''}
        </Text>
        <MoodSelectorBar selectedLevel={currentLevel} onSelect={handleMoodSelect} />
      </Card>

      <Text style={styles.sectionTitle}>Recommendations for you</Text>
      <RecommendationCarousel items={getRecommendations(stressLevel)} />

      <Text style={[styles.sectionTitle, styles.historyTitle]}>Mood history</Text>
      {history.length === 0 ? (
        <Text style={styles.empty}>No mood entries yet — complete today's check-in.</Text>
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
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  welcomeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  welcome: { fontSize: 22, color: colors.text, fontWeight: '500' },
  nameLink: { fontSize: 22, color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  currentMood: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.sm },
  historyTitle: { marginTop: spacing.lg },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  moodDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.md },
  historyBody: { flex: 1 },
  historyMood: { fontWeight: '700', color: colors.text },
  historyMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
