import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, OTT_BADGES } from '../constants/theme';

export const FALLBACK_POSTERS = {
  Interstellar: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  Inception: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKqB8dXUmvS7rj7rZ.jpg',
  Dark: 'https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg',
  Severance: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&q=85',
  Prisoners: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&q=85',
  'Dune: Part Two': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&q=85'
};

function posterFor(item) {
  return item.posterUrl || FALLBACK_POSTERS[item.title] || null;
}

export default function MediaCard({ item, onPress, onQuickAdd, isAdding, isAdded, index = 0 }) {
  const [poster, setPoster] = useState(posterFor(item));
  const entrance = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const platforms = item.platforms || item.streamingOptions?.map((s) => s.platform) || [];

  useEffect(() => {
    setPoster(posterFor(item));
    Animated.spring(entrance, {
      toValue: 1,
      delay: Math.min(index * 45, 240),
      friction: 8,
      tension: 55,
      useNativeDriver: true
    }).start();
  }, [item, index, entrance]);

  function setPressed(pressed) {
    Animated.spring(pressScale, {
      toValue: pressed ? 0.97 : 1,
      friction: 7,
      tension: 100,
      useNativeDriver: true
    }).start();
  }

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: entrance,
          transform: [
            { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            { scale: pressScale }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.mainPressTarget}
        activeOpacity={1}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        {poster ? (
          <Image
            source={{ uri: poster }}
            style={styles.poster}
            resizeMode="cover"
            onError={() => setPoster(null)}
          />
        ) : (
          <View style={styles.posterFallback}><Text style={styles.fallbackText}>CINE</Text></View>
        )}

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {item.avgRating || '—'}</Text>
            </View>
          </View>
          <Text style={styles.meta}>
            {item.type === 'TV_SHOW' ? `${item.releaseYear || 'Series'} · ${item.totalEpisodes || 0} episodes` : `Movie · ${item.releaseYear || '—'}`}
          </Text>
          <Text style={styles.genres} numberOfLines={1}>{(item.genres || []).join(' · ') || 'Recommended for you'}</Text>
          {item.reason_tag ? <Text style={styles.reasonTag} numberOfLines={1}>{item.reason_tag}</Text> : null}
          <View style={styles.platforms}>
            {platforms.slice(0, 2).map((ott) => (
              <View key={ott} style={[styles.ottPill, { borderColor: OTT_BADGES[ott] || COLORS.accent }]}>
                <Text style={styles.ottText}>{ott}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>

      {onQuickAdd ? (
        <TouchableOpacity
          style={[styles.addBtn, isAdded && styles.addedBtn]}
          disabled={isAdding || isAdded}
          onPress={() => onQuickAdd(item)}
        >
          <Text style={styles.addBtnText}>{isAdding ? 'Saving…' : isAdded ? '✓ Added' : '＋ Watchlist'}</Text>
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    minHeight: 132
  },
  mainPressTarget: { flex: 1, flexDirection: 'row' },
  poster: { width: 76, height: 112, borderRadius: 10, backgroundColor: COLORS.glass },
  posterFallback: { width: 76, height: 112, borderRadius: 10, backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: COLORS.primary, fontWeight: '900', letterSpacing: 1 },
  details: { flex: 1, paddingLeft: 12, paddingRight: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.2 },
  meta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  ratingBadge: { backgroundColor: '#202B40', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4 },
  ratingText: { color: COLORS.primary, fontSize: 11, fontWeight: '800' },
  genres: { color: COLORS.accent, fontSize: 12, marginTop: 10 },
  reasonTag: { color: COLORS.success, fontSize: 11, marginTop: 5 },
  platforms: { flexDirection: 'row', gap: 6, marginTop: 9 },
  ottPill: { borderWidth: 1, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  ottText: { color: COLORS.textPrimary, fontSize: 10 },
  addBtn: { position: 'absolute', right: 10, bottom: 10, backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7 },
  addedBtn: { backgroundColor: COLORS.success },
  addBtnText: { color: '#111111', fontSize: 10, fontWeight: '800' }
});
