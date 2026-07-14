import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { MoodCard } from './MoodCard';
import Carousel from 'react-native-reanimated-carousel';
import { useSharedValue } from "react-native-reanimated";

interface Props {
  selectedLevel?: number;
  onSelect?: (level: number) => void;
  variant?: 'entry' | 'home';
}

export const MoodSelector: React.FC<Props> = ({
  variant = 'home',
  selectedLevel,
  onSelect,
}) => {
  const levels = [1, 2, 3, 4, 5];
  const { width: screenWidth } = useWindowDimensions();

  if (variant === 'entry') {
    const itemWidth = screenWidth * 0.75;
    const itemHeight = 250;
    const progress = useSharedValue<number>(0);

    return (
      <View style={{ width: '100%', height: 230, alignItems: 'center' }}>
        <Carousel
          data={levels}
          loop={true}
          pagingEnabled={true}
          snapEnabled={true}
          width={itemWidth * 0.75}
          height={itemHeight}
          style={{
            width: screenWidth,
            height: itemHeight,
            justifyContent: 'center'
          }}
          mode={'parallax'}
          modeConfig={{
            parallaxScrollingScale: 0.88,
            parallaxScrollingOffset: 90,
          }}
          onProgressChange={(offsetProgress, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          renderItem={({ item }) => (
            <MoodCard
              level={item}
              active={selectedLevel === item}
              variant={variant}
              onPress={() => onSelect?.(item)}
            />
          )}
        />
      </View>
    );
  }

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 2,
    }}>
      {levels.map((level) => (
        <MoodCard
          key={level}
          level={level}
          active={selectedLevel === level}
          variant={variant}
          onPress={() => onSelect?.(level)}
        />
      ))}
    </View>
  );
};