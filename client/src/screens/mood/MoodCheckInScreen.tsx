import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MoodSelector } from '../../components/MoodSelector';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenContainer } from '../../components/ScreenContainer';
import { StudentStackParamList } from '../../types';
import { colors, spacing } from '../../utils/theme';

type Props = NativeStackScreenProps<StudentStackParamList, 'MoodCheckIn'>;

export const MoodCheckInScreen: React.FC<Props> = ({ navigation }) => {
  const [moodLevel, setMoodLevel] = useState<number>();

  const continueFlow = () => {
    if (!moodLevel) return;
    const stressLevel = Math.max(1, 6 - moodLevel);
    navigation.replace('StressCauses', { moodLevel, stressLevel });
  };

  return (
    <ScreenContainer title="Check-in" showHeader={false} scroll={false}>
      <View style={styles.center}>
        <Text style={styles.heading}>How are you feeling right now?</Text>
        <Text style={styles.sub}>Tap the mood that best describes you today.</Text>
        {/* <View style={{ width: '100%', alignItems:'center'}}>
          <Image
          source={require('../../assets/images/moodCheckIn.png')}
          style={{ width: 350, height: 200}} />
        </View> */}
        <MoodSelector selectedLevel={moodLevel} onSelect={setMoodLevel} variant={"entry"} />
        <PrimaryButton label="Continue" onPress={continueFlow} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    gap: 20,
    justifyContent:'center'
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  sub: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom:5,
    fontWeight: '500',
  },
});
