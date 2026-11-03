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

const OTT_FILTERS = ['All', 'Netflix', 'Prime Video', 'JioCinema', 'Apple TV+'];

export default function DiscoverScreen() {
  const [selectedOtt, setSelectedOtt] = useState('All');
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDiscoveryFeed(selectedOtt);
  }, [selectedOtt]);

  async function fetchDiscoveryFeed(ott) {
    try {
      setLoading(true);
      const endpoint =
        ott === 'All'
          ? '/catalog/search'
          : `/catalog/by-platform/${encodeURIComponent(ott)}`;
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
      <Text style={styles.heading}>Discover Across OTTs</Text>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {OTT_FILTERS.map((ott) => (
            <TouchableOpacity
              key={ott}
              style={[
                styles.chip,
                selectedOtt === ott && styles.chipActive
              ]}
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
            <MediaCard item={item} onQuickAdd={handleQuickAdd} />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
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
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' }
});
