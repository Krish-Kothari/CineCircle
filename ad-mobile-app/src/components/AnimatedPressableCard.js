import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback } from 'react-native';

export default function AnimatedPressableCard({ children, onPress, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  function animate(toValue) {
    Animated.spring(scale, {
      toValue,
      friction: 7,
      tension: 100,
      useNativeDriver: true
    }).start();
  }

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={() => animate(0.97)}
      onPressOut={() => animate(1)}
    >
      <Animated.View style={[styles.container, style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({ container: { width: '100%' } });
