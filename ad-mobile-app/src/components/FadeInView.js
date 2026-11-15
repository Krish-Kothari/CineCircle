import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function FadeInView({ children, delay = 0, style }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(progress, {
        toValue: 1,
        friction: 8,
        tension: 55,
        useNativeDriver: true
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}
