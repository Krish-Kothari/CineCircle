import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function EpisodeProgressBar({ watchedEpisodes = 0, totalEpisodes = 1, onIncrement }) {
  const safeTotal = Math.max(1, totalEpisodes);
  const percentage = Math.min(100, Math.round((watchedEpisodes / safeTotal) * 100));

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.progressText}>
          Progress: {watchedEpisodes} / {safeTotal} Episodes ({percentage}%)
        </Text>
        {watchedEpisodes < safeTotal && onIncrement ? (
          <TouchableOpacity style={styles.plusBtn} onPress={onIncrement}>
            <Text style={styles.plusBtnText}>+1 Ep</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 10 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  progressText: { color: COLORS.textSecondary, fontSize: 12 },
  plusBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  plusBtnText: { color: '#0B0F19', fontSize: 11, fontWeight: 'bold' },
  track: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.success
  }
});
