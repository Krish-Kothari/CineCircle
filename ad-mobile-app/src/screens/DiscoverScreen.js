import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import apiClient from '../services/apiClient';
import MediaCard, { FALLBACK_POSTERS } from '../components/MediaCard';
import MediaDetailModal from '../components/MediaDetailModal';
import GenreOnboardingModal from '../components/GenreOnboardingModal';
import FadeInView from '../components/FadeInView';

const PERSONALIZED_FILTER = 'For You';
const ALL_TITLES_FILTER = 'All titles';
const OTT_FILTERS = [PERSONALIZED_FILTER, ALL_TITLES_FILTER, 'Netflix', 'Prime Video', 'JioCinema', 'Apple TV+'];

export default function DiscoverScreen() {
  const [selectedOtt, setSelectedOtt] = useState(PERSONALIZED_FILTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showTasteModal, setShowTasteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [addingMediaId, setAddingMediaId] = useState(null);
  const [addedMediaIds, setAddedMediaIds] = useState(new Set());
  const [feedback, setFeedback] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const timer = setTimeout(() => {
        fetchCatalogSearch(searchQuery.trim(), 1, true);
      }, 350);
      return () => clearTimeout(timer);
    }
    fetchDiscoveryFeed(selectedOtt, 1, true);
  }, [selectedOtt, searchQuery]);

  async function fetchCatalogSearch(query, nextPage = 1, replace = nextPage === 1) {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);
      const res = await apiClient.get('/catalog/search', {
        params: { search: query, page: nextPage, limit: 20 }
      });
      const items = res.data.data || [];
      const pagination = res.data.pagination;
      setMediaList((current) => (replace ? items : [...current, ...items]));
      setPage(nextPage);
      setHasMore(Boolean(pagination && nextPage < pagination.totalPages));
    } catch (err) {
      console.warn('Search error:', err.message);
      if (replace) setMediaList([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function fetchDiscoveryFeed(ott, nextPage = 1, replace = nextPage === 1) {
    try {
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      let endpoint = '/catalog/search';
      if (ott === PERSONALIZED_FILTER) {
        endpoint = '/catalog/recommendations/personal';
      } else if (ott !== ALL_TITLES_FILTER) {
        endpoint = `/catalog/by-platform/${encodeURIComponent(ott)}`;
      }
      const params = ott === PERSONALIZED_FILTER
        ? undefined
        : { page: nextPage, limit: 20 };
      const res = await apiClient.get(endpoint, { params });
      const items = res.data.data || [];
      const pagination = res.data.pagination;

      setMediaList((current) => (replace ? items : [...current, ...items]));
      setPage(nextPage);
      setHasMore(Boolean(pagination && nextPage < pagination.totalPages));
    } catch (err) {
      console.warn('Discover fetch error:', err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchDiscoveryFeed(selectedOtt, 1, true);
    setRefreshing(false);
  }

  function loadMore() {
    if (!loading && !loadingMore && hasMore) {
      if (searchQuery.trim().length > 1) {
        fetchCatalogSearch(searchQuery.trim(), page + 1, false);
      } else {
        fetchDiscoveryFeed(selectedOtt, page + 1, false);
      }
    }
  }

  function handleFilterChange(filter) {
    setSearchQuery('');
    setSelectedOtt(filter);
  }

  const featured = mediaList[0];
  const featuredPoster = featured?.posterUrl || FALLBACK_POSTERS[featured?.title];

  async function handleQuickAdd(item) {
    try {
      setAddingMediaId(item.id);
      await apiClient.post('/tracker/watchlist/upsert', {
        mediaId: item.id,
        status: 'PLAN_TO_WATCH'
      });
      setAddedMediaIds((current) => new Set(current).add(item.id));
      setFeedback(`${item.title} added to your watchlist`);
      setTimeout(() => setFeedback(''), 2600);
    } catch (err) {
      console.warn('Watchlist add error:', err.message);
      setFeedback(err.response?.data?.message || 'Could not update your watchlist');
      setTimeout(() => setFeedback(''), 3000);
    } finally {
      setAddingMediaId(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.kicker}>CINECIRCLE</Text>
          <Text style={styles.heading}>Discover</Text>
          <Text style={styles.subtitle}>Find something worth watching.</Text>
        </View>
        <TouchableOpacity
          style={styles.tuneBtn}
          onPress={() => setShowTasteModal(true)}
        >
          <Text style={styles.tuneBtnText}>Personalize</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search movies and shows"
          placeholderTextColor={COLORS.textSecondary}
          style={styles.searchInput}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
            <Text style={styles.clearSearchText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {!searchQuery && featured ? (
        <FadeInView style={styles.heroWrap}>
          <Image source={{ uri: featuredPoster }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.matchPill}><Text style={styles.matchText}>98% MATCH</Text></View>
            <Text style={styles.heroTitle} numberOfLines={2}>{featured.title}</Text>
            <Text style={styles.heroMeta}>{featured.releaseYear || 'New favorite'} · {(featured.genres || []).slice(0, 2).join(' · ')}</Text>
            <View style={styles.heroActions}>
              <TouchableOpacity style={styles.heroPrimary} onPress={() => handleQuickAdd(featured)}>
                <Ionicons name="bookmark-outline" size={16} color="#111111" />
                <Text style={styles.heroPrimaryText}>Watchlist</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroSecondary} onPress={() => setSelectedMedia(featured)}>
                <Text style={styles.heroSecondaryText}>Details</Text>
                <Ionicons name="arrow-forward" size={15} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </FadeInView>
      ) : null}

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {OTT_FILTERS.map((ott) => (
            <TouchableOpacity
              key={ott}
              style={[styles.chip, selectedOtt === ott && styles.chipActive]}
              onPress={() => handleFilterChange(ott)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedOtt === ott && styles.chipTextActive
                ]}
              >
                {ott}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={mediaList.slice(featured && !searchQuery ? 1 : 0)}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item, index }) => (
            <MediaCard
              item={item}
              index={index}
              onPress={() => setSelectedMedia(item)}
              onQuickAdd={handleQuickAdd}
              isAdding={addingMediaId === item.id}
              isAdded={addedMediaIds.has(item.id)}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={COLORS.primary} style={{ paddingVertical: 16 }} />
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}

      <MediaDetailModal
        visible={Boolean(selectedMedia)}
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />

      <GenreOnboardingModal
        visible={showTasteModal}
        onClose={() => setShowTasteModal(false)}
        onSaved={() => fetchDiscoveryFeed(selectedOtt, 1, true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: COLORS.primary },
  heading: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginTop: 2 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 3 },
  heroWrap: { height: 224, borderRadius: 18, overflow: 'hidden', marginBottom: 16, backgroundColor: COLORS.glass },
  heroImage: { ...StyleSheet.absoluteFillObject, opacity: 0.7 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9,10,15,0.42)' },
  heroContent: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  matchPill: { alignSelf: 'flex-start', backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  matchText: { color: '#111111', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  heroTitle: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  heroMeta: { color: '#D5D8E0', fontSize: 12, marginTop: 5 },
  heroActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  heroPrimary: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9 },
  heroPrimaryText: { color: '#111111', fontSize: 12, fontWeight: '800' },
  heroSecondary: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 9 },
  heroSecondaryText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 16,
    marginBottom: 12
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  clearSearch: { paddingHorizontal: 12 },
  clearSearchText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  feedback: {
    backgroundColor: COLORS.surface,
    color: COLORS.success,
    borderColor: COLORS.success,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '600'
  },
  tuneBtn: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent
  },
  tuneBtnText: { color: COLORS.accent, fontSize: 12, fontWeight: 'bold' },
  filterContainer: { marginBottom: 14 },
  chip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' }
});
