import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

interface FadeSlideInProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Fades and nudges its content up on mount. Give it a changing `key` to replay on data change. */
export const FadeSlideIn: React.FC<FadeSlideInProps> = ({ children, style }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
