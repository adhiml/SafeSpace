import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useMood } from '../../context/MoodContext';
import * as moodService from '../../services/moodService';
import { RootStackParamList } from '../../types';
import { STRESS_CAUSES } from '../../utils/constants';
import { colors, radius, spacing } from '../../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'StressCauses'>;

export const StressCausesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { moodLevel, stressLevel } = route.params;
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { setLatestMood, setNeedsCheckIn } = useMood();

  const toggle = (cause: string) => {
    setSelected((prev) =>
      prev.includes(cause) ? prev.filter((c) => c !== cause) : [...prev, cause]
    );
  };

  const save = async (causes: string[]) => {
    try {
      setLoading(true);
      const entry = await moodService.createMood({
        mood_level: moodLevel,
        stress_level: stressLevel,
        stress_causes: causes,
      });
      setLatestMood(entry);
      setNeedsCheckIn(false);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer title="Stress causes" showHeader={false}>
      <Text style={styles.heading}>What's contributing to your stress?</Text>
      <Text style={styles.sub}>Select all that apply — or skip if you prefer.</Text>
      <View style={styles.chips}>
        {STRESS_CAUSES.map((cause) => {
          const active = selected.includes(cause);
          return (
            <TouchableOpacity
              key={cause}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggle(cause)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{cause}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <PrimaryButton label="Save check-in" onPress={() => save(selected)} loading={loading} />
      <PrimaryButton label="Skip" onPress={() => save([])} mode="text" color={colors.textMuted} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heading: { fontSize: 22, fontWeight: '700', color: colors.text },
  sub: { color: colors.textMuted, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13 },
  chipTextActive: { color: '#fff' },
});
