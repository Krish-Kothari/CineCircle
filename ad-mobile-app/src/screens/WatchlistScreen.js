import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, LayoutAnimation, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';
import { COLORS } from '../constants/theme';
import { FALLBACK_POSTERS } from '../components/MediaCard';
import FadeInView from '../components/FadeInView';

const TABS = [
  { label: 'All', value: undefined },
  { label: 'Planned', value: 'PLAN_TO_WATCH' },
  { label: 'Watching', value: 'WATCHING' },
  { label: 'Completed', value: 'COMPLETED' }
];

export default function WatchlistScreen() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [items, setItems] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async (nextPage = 1, replace = true) => {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);
      const listResponse = await apiClient.get('/tracker/watchlist/my-list', {
        params: { ...(activeTab.value ? { status: activeTab.value } : {}), page: nextPage, limit: 20 }
      });
      const pagination = listResponse.data.pagination;
      setItems((current) => (replace ? (listResponse.data.data || []) : [...current, ...(listResponse.data.data || [])]));
      setPage(nextPage);
      setHasMore(Boolean(pagination && nextPage < pagination.totalPages));
      if (replace) {
        const continueResponse = await apiClient.get('/tracker/watchlist/continue-watching');
        setContinueWatching(continueResponse.data.data || []);
      }
    } catch (error) {
      console.warn('Watchlist fetch error:', error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  function loadMore() {
    if (!loading && !loadingMore && hasMore) load(page + 1, false);
  }

  useEffect(() => { load(); }, [load]);

  async function addEpisode(item) {
    if (!item.media?.totalEpisodes || savingId) return;
    const nextEpisode = (item.watchedEpisodes || 0) + 1;
    try {
      setSavingId(item.mediaId);
      await apiClient.post('/tracker/watchlist/log-episode', {
        mediaId: item.mediaId,
        episodeNumber: nextEpisode
      });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await load(1, true);
    } catch (error) {
      console.warn('Episode progress error:', error.message);
      setError(error.response?.data?.message || 'Could not update episode progress');
    } finally {
      setSavingId(null);
    }
  }

  function posterFor(media) {
    return media.posterUrl || FALLBACK_POSTERS[media.title] || null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>YOUR LIBRARY</Text>
          <Text style={styles.heading}>Watchlist</Text>
        </View>
        <Ionicons name="bookmark" size={25} color={COLORS.primary} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {continueWatching.length > 0 ? (
        <View style={styles.continueSection}>
          <Text style={styles.sectionTitle}>Continue watching</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {continueWatching.map((item) => (
              <FadeInView key={item.media_id} style={styles.continueCard}>
                {posterFor(item) ? <Image source={{ uri: posterFor(item) }} style={styles.continuePoster} /> : <View style={styles.posterFallback} />}
                <Text style={styles.continueTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(item.completion_pct || 0, 100)}%` }]} /></View>
                <Text style={styles.progressText}>{Math.round(item.completion_pct || 0)}% watched</Text>
              </FadeInView>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.tab, activeTab.label === tab.label && styles.activeTab]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab(tab);
            }}
          >
            <Text style={[styles.tabText, activeTab.label === tab.label && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={COLORS.primary} style={{ paddingVertical: 16 }} /> : null}
          ListEmptyComponent={<Text style={styles.empty}>Your watchlist is waiting for its next great pick.</Text>}
          renderItem={({ item, index }) => {
            const media = item.media;
            return (
              <FadeInView delay={index * 45} style={styles.row}>
                {posterFor(media) ? <Image source={{ uri: posterFor(media) }} style={styles.rowPoster} /> : <View style={styles.rowPosterFallback} />}
                <View style={styles.rowDetails}>
                  <Text style={styles.rowTitle}>{media.title}</Text>
                  <Text style={styles.rowMeta}>{media.type === 'TV_SHOW' ? `${item.watchedEpisodes || 0}/${media.totalEpisodes || 0} episodes` : media.releaseYear}</Text>
                  <Text style={styles.rowStatus}>{item.status.replace(/_/g, ' ')}</Text>
                </View>
                {media.type === 'TV_SHOW' && item.status !== 'COMPLETED' ? (
                  <TouchableOpacity style={styles.episodeButton} onPress={() => addEpisode(item)} disabled={savingId === item.mediaId}>
                    <Text style={styles.episodeText}>{savingId === item.mediaId ? '…' : '+1 Ep'}</Text>
                  </TouchableOpacity>
                ) : null}
              </FadeInView>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 18 },
  kicker: { color: COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  heading: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '900', marginTop: 3 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 10, paddingHorizontal: 16 },
  continueSection: { marginBottom: 18 },
  continueCard: { width: 118, marginLeft: 16 },
  continuePoster: { width: 118, height: 154, borderRadius: 12, backgroundColor: COLORS.glass },
  posterFallback: { width: 118, height: 154, borderRadius: 12, backgroundColor: COLORS.glass },
  continueTitle: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700', marginTop: 7 },
  progressTrack: { height: 4, backgroundColor: COLORS.glass, borderRadius: 4, marginTop: 7 },
  progressFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 4 },
  progressText: { color: COLORS.textSecondary, fontSize: 10, marginTop: 4 },
  tabs: { paddingHorizontal: 16, paddingBottom: 14, gap: 8, alignItems: 'flex-start' },
  tab: { backgroundColor: COLORS.surface, borderRadius: 18, paddingHorizontal: 15, paddingVertical: 9, borderWidth: 1, borderColor: COLORS.border },
  activeTab: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  activeTabText: { color: '#111111' },
  loader: { marginTop: 40 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 15, padding: 10, marginBottom: 10 },
  rowPoster: { width: 54, height: 76, borderRadius: 8, backgroundColor: COLORS.glass },
  rowPosterFallback: { width: 54, height: 76, borderRadius: 8, backgroundColor: COLORS.glass },
  rowDetails: { flex: 1, paddingHorizontal: 12 },
  rowTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800' },
  rowMeta: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  rowStatus: { color: COLORS.accent, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginTop: 7 },
  episodeButton: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 8 },
  episodeText: { color: '#111111', fontSize: 11, fontWeight: '900' },
  empty: { color: COLORS.textSecondary, textAlign: 'center', padding: 30, lineHeight: 20 },
  error: { color: COLORS.crimson, backgroundColor: COLORS.surface, borderRadius: 10, padding: 10, marginHorizontal: 16, marginBottom: 10, fontSize: 12 }
});
