import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function DeadlineFeasibilityBadge({ feasibility }) {
  if (!feasibility) return null;

  const isAchievable = feasibility.includes('Easily');

  return (
    <View style={[styles.badge, { borderColor: isAchievable ? COLORS.success : COLORS.warning }]}>
      <Text style={[styles.badgeText, { color: isAchievable ? COLORS.success : COLORS.warning }]}>
        {feasibility}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: COLORS.background,
    alignSelf: 'flex-start',
    marginTop: 6
  },
  badgeText: { fontSize: 11, fontWeight: '600' }
});
