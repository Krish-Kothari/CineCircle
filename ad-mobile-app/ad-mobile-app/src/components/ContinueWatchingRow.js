import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ContinueWatchingRow({ items = [], onQuickEpisode }) {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Continue Watching (SQL Binge Queue)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.watchlist_id} style={styles.card}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.meta}>
              Ep {item.watchedEpisodes}/{item.totalEpisodes} ({item.completion_pct}%)
            </Text>
            <Text style={styles.remaining}>
              {item.remaining_minutes} mins left
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, item.completion_pct)}%` }
                ]}
              />
            </View>

            <TouchableOpacity
              style={styles.epBtn}
              onPress={() => onQuickEpisode && onQuickEpisode(item)}
            >
              <Text style={styles.epBtnText}>Log Next Ep (+1)</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 18 },
  heading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 10
  },
  card: {
    width: 210,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  title: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  remaining: { fontSize: 11, color: COLORS.warning, marginTop: 2 },
  progressTrack: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 10
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success
  },
  epBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center'
  },
  epBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }
});
