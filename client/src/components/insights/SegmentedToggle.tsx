import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, palette, radius } from '../../utils/theme';

const PADDING = 4;

interface Option<T extends string> {
  key: T;
  label: string;
}

interface SegmentedToggleProps<T extends string> {
  options: Option<T>[]; // two or more
  value: T;
  onChange: (key: T) => void;
}

/** Segmented control whose white "pill" slides to the selected option. */
export function SegmentedToggle<T extends string>({ options, value, onChange }: SegmentedToggleProps<T>) {
  const [trackWidth, setTrackWidth] = useState(0);
  const selected = Math.max(0, options.findIndex((o) => o.key === value));
  const slide = useRef(new Animated.Value(selected)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: selected,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selected, slide]);

  const thumbWidth = trackWidth ? (trackWidth - PADDING * 2) / options.length : 0;

  return (
    <View
      style={styles.track}
      accessibilityRole="tablist"
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      {thumbWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              width: thumbWidth,
              transform: [
                {
                  translateX: slide.interpolate({
                    inputRange: [0, options.length - 1],
                    outputRange: [0, thumbWidth * (options.length - 1)],
                  }),
                },
              ],
            },
          ]}
        />
      )}
      {options.map((option) => {
        const active = option.key === value;
        return (
          <TouchableOpacity
            key={option.key}
            style={styles.option}
            activeOpacity={0.7}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: palette.accentWash,
    padding: PADDING,
    borderRadius: radius.sm,
  },
  thumb: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    backgroundColor: palette.white,
    borderRadius: radius.sm - 2,
    shadowColor: palette.shadowStrong,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  option: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  label: { fontSize: 15, fontWeight: '600', color: palette.textSoft },
  labelActive: { color: colors.primary },
});
