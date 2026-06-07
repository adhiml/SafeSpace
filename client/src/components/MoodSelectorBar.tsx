import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from '../utils/constants';
import { colors, radius, spacing } from '../utils/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';

interface MoodSelectorBarProps {
  selectedLevel?: number;
  onSelect?: (level: number) => void;
  variant?: 'entry' | 'home';
}

export const MoodSelectorBar: React.FC<MoodSelectorBarProps> = ({
  selectedLevel,
  onSelect,
  variant = 'home',
}) => {
  const levels = [1, 2, 3, 4, 5];

  const isEntry = variant === 'entry';

  return(
    <View style = {[
      isEntry ? styles.verticalContainer : styles.horizontalContainer
    ]} >
      {levels.map((level) => {
        const active = selectedLevel === level;
        return (
          <TouchableOpacity
            key={level}
            style={[
              styles.item,
              isEntry ? styles.itemVertical : styles.itemHorizontal,
              active && { 
                backgroundColor: MOOD_COLORS[level], 
                borderColor: MOOD_COLORS[level] },
            ]}
            onPress={() => onSelect?.(level)}
            disabled={!onSelect}
          >

            <Image 
            source={MOOD_EMOJIS[level]} 
            style={isEntry ? styles.emojiVertical : styles.emojiHorizontal}/>

            <Text style={[isEntry ? styles.labelVertical : styles.labelHorizontal, active && styles.labelActive]}>{MOOD_LABELS[level]}</Text>

          </TouchableOpacity>
        );
      })}
      </View>
    );
};

const styles = StyleSheet.create({
  
  horizontalContainer: { 
    flexDirection: 'row',
    marginTop: spacing.sm,
    },

  verticalContainer: {
    flexDirection: 'column',
    gap: spacing.sm, 
  },

  item: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },

  itemHorizontal: {
    maxWidth: 70,
    paddingVertical: spacing.sm, 
    paddingHorizontal: spacing.sm,
    marginRight: spacing.xs,
  },

  itemVertical: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: spacing.lg, 
    paddingHorizontal: spacing.md,
  },

   emojiVertical: { 
    width: 50,
    height: 50, 
  },

  emojiHorizontal: { 
    width: 46.5,
    height: 46.5,
  },

  labelHorizontal: { 
    marginTop: 5, 
    fontSize: 12, 
    color: colors.text, 
    fontWeight: '500' 
  },

  labelVertical: { 
    marginTop: 5,
    marginLeft: spacing.md, 
    fontSize: 35, 
    color: colors.text, 
    fontWeight: '500' 
  },

  labelActive: { 
    color: colors.surface 
  },
});