import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function RewindBanner({ wrapped }) {
  if (!wrapped) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>30-Day Monthly Rewind (SQL Wrapped)</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.value}>{wrapped.overview?.total_monthly_hours || 0}h</Text>
          <Text style={styles.label}>Streamed</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.value}>{wrapped.topGenre || 'Sci-Fi'}</Text>
          <Text style={styles.label}>Top Genre</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.value}>{wrapped.peakDay || 'Friday'}</Text>
          <Text style={styles.label}>Binge Day</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1B4B',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6366F1',
    marginBottom: 16
  },
  title: { fontSize: 15, fontWeight: 'bold', color: '#A5B4FC', marginBottom: 12 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metricItem: { alignItems: 'center', flex: 1 },
  value: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC' },
  label: { fontSize: 11, color: '#94A3B8', marginTop: 2 }
});
