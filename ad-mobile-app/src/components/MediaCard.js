import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, OTT_BADGES } from '../constants/theme';

export default function MediaCard({ item, onQuickAdd }) {
  const platforms = item.platforms || item.streamingOptions?.map((s) => s.platformName) || [];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            {item.type === 'TV_SHOW' ? `TV Series • ${item.totalEpisodes} Eps` : `Movie • ${item.releaseYear}`}
          </Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>★ {item.avgRating}</Text>
        </View>
      </View>

      <Text style={styles.genres}>{(item.genres || []).join(' • ')}</Text>

      {item.reason_tag ? (
        <Text style={styles.reasonTag}>{item.reason_tag}</Text>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.ottRow}>
          {platforms.map((ott) => (
            <View
              key={ott}
              style={[styles.ottPill, { borderColor: OTT_BADGES[ott] || COLORS.accent }]}
            >
              <Text style={styles.ottText}>{ott}</Text>
            </View>
          ))}
        </View>

        {onQuickAdd ? (
          <TouchableOpacity style={styles.addBtn} onPress={() => onQuickAdd(item)}>
            <Text style={styles.addBtnText}>+ Watchlist</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  titleBlock: { flex: 1, paddingRight: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  ratingBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  ratingText: { color: COLORS.warning, fontWeight: 'bold', fontSize: 13 },
  genres: { fontSize: 12, color: COLORS.accent, marginTop: 8 },
  reasonTag: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 6,
    fontStyle: 'italic'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  ottRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  ottPill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  ottText: { color: COLORS.textPrimary, fontSize: 11 },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8
  },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }
});
