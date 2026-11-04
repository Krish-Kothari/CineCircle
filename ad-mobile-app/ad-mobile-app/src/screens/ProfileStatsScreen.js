import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

export default function ProfileStatsScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await apiClient.get('/tracker/watchlist/stats');
      setStats(res.data.data);
    } catch (err) {
      console.warn('Stats fetch error:', err.message);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Profile & SQL Watch Analytics</Text>

      <View style={styles.profileCard}>
        <Text style={styles.name}>{user?.name} (@{user?.username})</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.ottList}>
          Subscribed OTTs: {(user?.subscribedOTTs || []).join(', ') || 'None set'}
        </Text>
      </View>

      {stats?.summaryView ? (
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{stats.summaryView.total_watch_hours}h</Text>
            <Text style={styles.metricLabel}>Watched</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{stats.summaryView.completed_items}</Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{stats.summaryView.currently_watching}</Text>
            <Text style={styles.metricLabel}>Watching</Text>
          </View>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Top Genres by Watch Time</Text>
      {(stats?.genreBreakdown || []).map((g) => (
        <View key={g.genre} style={styles.genreRow}>
          <Text style={styles.genreName}>{g.genre}</Text>
          <Text style={styles.genreMinutes}>{g.minutes_watched} mins ({g.completed_titles} done)</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.refreshBtn} onPress={loadStats}>
        <Text style={styles.refreshBtnText}>Refresh SQL Stats</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  profileCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14
  },
  name: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  email: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  ottList: { fontSize: 13, color: COLORS.accent, marginTop: 8 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  metricBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  metricValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  metricLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 10 },
  genreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8
  },
  genreName: { color: COLORS.textPrimary, fontWeight: '600' },
  genreMinutes: { color: COLORS.success, fontSize: 13 },
  refreshBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 30
  },
  refreshBtnText: { color: '#FFFFFF', fontWeight: 'bold' }
});
