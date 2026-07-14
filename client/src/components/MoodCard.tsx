import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import {Image} from 'expo-image';
import { MOOD_COLORS, MOOD_GIFS, MOOD_LABELS } from '../utils/constants';
import { colors, radius, spacing } from '../utils/theme';

interface Props {
  level: number;
  active?: boolean;
  variant?: 'home' |'entry';
  onPress?: () => void;
}

export const MoodCard: React.FC<Props> = ({
  level,
  active,
  variant = 'home',
  onPress,
}) => {
  const isEntry = variant === 'entry';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.base,
        isEntry ? styles.entry : styles.horizontal,
        active && {
          backgroundColor: MOOD_COLORS[level],
          borderColor: MOOD_COLORS[level],
          
        },
      ]}
    >
      <Image
        source={MOOD_GIFS[level]}
        style={isEntry ? styles.emojiVertical : styles.emojiHorizontal}
      />

      <Text
        style={[
          isEntry ? styles.labelEntry : styles.labelHorizontal,
          active && styles.activeLabel,
        ]}
      >
        {MOOD_LABELS[level]}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },

  horizontal: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: spacing.sm,
    paddingHorizontal: 2,
  },

  entry: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: 10
  },

  emojiHorizontal: { width: 46, height: 46 },
  emojiVertical: { width: 120, height: 120 },

  labelHorizontal: {
    marginTop: 5,
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },

  labelEntry: {
    fontSize: 21,
    color: colors.text,
    fontWeight: '500',
  },

  activeLabel: {
    color: colors.primary,
  },
});