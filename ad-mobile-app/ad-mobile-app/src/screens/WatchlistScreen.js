import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../constants/theme';
import apiClient from '../services/apiClient';
import { cacheWatchlistOffline, getCachedWatchlist } from '../utils/storage';
import EpisodeProgressBar from '../components/EpisodeProgressBar';

const STATUS_TABS = [
  { key: 'WATCHING', label: 'Watching' },
  { key: 'PLAN_TO_WATCH', label: 'Planned' },
  { key: 'COMPLETED', label: 'Completed' }
];

export default function WatchlistScreen() {
  const [activeTab, setActiveTab] = useState('WATCHING');
  const [entries, setEntries] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWatchlist();
  }, [activeTab]);

  async function loadWatchlist() {
    try {
      setLoading(true);
      setIsOffline(false);
      const res = await apiClient.get(`/tracker/watchlist/my-list?status=${activeTab}`);
      const list = res.data.data || [];
      setEntries(list);
      await cacheWatchlistOffline(list);
    } catch (err) {
      setIsOffline(true);
      const cached = await getCachedWatchlist();
      setEntries(cached.filter((item) => item.status === activeTab));
    } finally {
      setLoading(false);
    }
  }

  async function handleIncrementEpisode(entry) {
    try {
      const nextEp = (entry.watchedEpisodes || 0) + 1;
      await apiClient.post('/tracker/watchlist/log-episode', {
        mediaId: entry.mediaId,
        seasonNumber: 1,
        episodeNumber: nextEp
      });
      loadWatchlist();
    } catch (err) {
      console.warn('Failed to log episode:', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Watchlist</Text>

      {isOffline ? (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline Mode — Showing cached watchlist</Text>
        </View>
      ) : null}

      <View style={styles.tabRow}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.media?.title}</Text>
              <Text style={styles.subtitle}>
                {item.media?.type} • {item.media?.runtimeMinutes} mins/ep
              </Text>
              <EpisodeProgressBar
                watchedEpisodes={item.watchedEpisodes}
                totalEpisodes={item.media?.totalEpisodes || 1}
                onIncrement={() => handleIncrementEpisode(item)}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No titles in this tab yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  offlineBanner: {
    backgroundColor: '#78350F',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10
  },
  offlineText: { color: '#FDE68A', fontSize: 12, textAlign: 'center' },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  tabBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  title: { fontSize: 17, fontWeight: 'bold', color: COLORS.textPrimary },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 }
});
