import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function BingePacingCard({ pacingItem }) {
  if (!pacingItem) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>{pacingItem.title}</Text>
        <Text style={styles.badge}>{pacingItem.days_to_finish} Days Left</Text>
      </View>

      <Text style={styles.meta}>
        Target Finish: {pacingItem.estimated_finish_date}
      </Text>

      <View style={styles.statsRow}>
        <Text style={styles.statText}>
          Velocity: {pacingItem.avg_episodes_per_day} eps/day
        </Text>
        <Text style={styles.statText}>
          Remaining: {pacingItem.remaining_episodes} eps
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  badge: {
    backgroundColor: '#1E293B',
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  meta: { color: COLORS.success, fontSize: 12, marginTop: 4, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8
  },
  statText: { color: COLORS.textSecondary, fontSize: 11 }
});
