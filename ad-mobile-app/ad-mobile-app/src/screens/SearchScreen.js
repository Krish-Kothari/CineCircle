import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../constants/theme';
import apiClient from '../services/apiClient';
import MediaCard from '../components/MediaCard';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else if (query.trim().length === 0) {
        setResults([]);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [query]);

  async function performSearch(searchTerm) {
    try {
      setLoading(true);
      const res = await apiClient.get(`/catalog/search?search=${encodeURIComponent(searchTerm)}`);
      setResults(res.data.data || []);
    } catch (err) {
      console.warn('Search error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickAdd(item) {
    await apiClient.post('/tracker/watchlist/upsert', {
      mediaId: item.id,
      status: 'PLAN_TO_WATCH'
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search Movie & Show Catalog</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Type title (e.g. Inception, Dark)..."
        placeholderTextColor={COLORS.textSecondary}
        value={query}
        onChangeText={setQuery}
        autoFocus
      />

      {loading && <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 14 }} />}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MediaCard item={item} onQuickAdd={handleQuickAdd} />
        )}
        ListEmptyComponent={
          !loading && query.trim().length >= 2 ? (
            <Text style={styles.emptyText}>No matching titles found.</Text>
          ) : (
            <Text style={styles.emptyText}>Search across Netflix, Prime Video, Hotstar & more</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  heading: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  searchInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    fontSize: 15
  },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 13 }
});
