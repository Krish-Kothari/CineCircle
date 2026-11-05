import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../constants/theme';
import apiClient from '../services/apiClient';
import MediaCard from '../components/MediaCard';
import MediaDetailModal from '../components/MediaDetailModal';
import GenreOnboardingModal from '../components/GenreOnboardingModal';

const OTT_FILTERS = ['For You (SQL)', 'All', 'Netflix', 'Prime Video', 'JioCinema', 'Apple TV+'];

export default function DiscoverScreen() {
  const [selectedOtt, setSelectedOtt] = useState('For You (SQL)');
  const [mediaList, setMediaList] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showTasteModal, setShowTasteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDiscoveryFeed(selectedOtt);
  }, [selectedOtt]);

  async function fetchDiscoveryFeed(ott) {
    try {
      setLoading(true);
      let endpoint = '/catalog/search';
      if (ott === 'For You (SQL)') {
        endpoint = '/catalog/recommendations/personal';
      } else if (ott !== 'All') {
        endpoint = `/catalog/by-platform/${encodeURIComponent(ott)}`;
      }
      const res = await apiClient.get(endpoint);
      setMediaList(res.data.data || []);
    } catch (err) {
      console.warn('Discover fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickAdd(item) {
    try {
      await apiClient.post('/tracker/watchlist/upsert', {
        mediaId: item.id,
        status: 'PLAN_TO_WATCH'
      });
    } catch (err) {
      console.warn('Watchlist add error:', err.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <Text style={styles.heading}>Discover & SQL Recs</Text>
        <TouchableOpacity
          style={styles.tuneBtn}
          onPress={() => setShowTasteModal(true)}
        >
          <Text style={styles.tuneBtnText}>Tune Weights ⚙</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {OTT_FILTERS.map((ott) => (
            <TouchableOpacity
              key={ott}
              style={[styles.chip, selectedOtt === ott && styles.chipActive]}
              onPress={() => setSelectedOtt(ott)}
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

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={mediaList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setSelectedMedia(item)}
            >
              <MediaCard item={item} onQuickAdd={handleQuickAdd} />
            </TouchableOpacity>
          )}
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
        onSaved={() => fetchDiscoveryFeed(selectedOtt)}
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
  heading: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
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
