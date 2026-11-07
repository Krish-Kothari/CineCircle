import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { flushOfflineEpisodeQueue } from '../services/offlineQueue';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [message, setMessage] = useState('');

  async function handleForceSync() {
    const res = await flushOfflineEpisodeQueue();
    setMessage(`Flushed ${res.flushedCount} pending offline episode logs!`);
  }

  async function handleClearLocalCache() {
    await AsyncStorage.removeItem('@cinecircle_watchlist_cache');
    await AsyncStorage.removeItem('@cinecircle_offline_episode_queue');
    setMessage('Local offline storage & watchlist cache cleared.');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>App Settings & Offline Storage</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Account Info</Text>
        <Text style={styles.meta}>Username: @{user?.username}</Text>
        <Text style={styles.meta}>Email: {user?.email}</Text>
        <Text style={styles.meta}>OTTs: {(user?.subscribedOTTs || []).join(', ')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Offline Storage & Sync</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={handleForceSync}>
          <Text style={styles.btnText}>Force Sync Offline Queue →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { borderColor: COLORS.primary }]} onPress={handleClearLocalCache}>
          <Text style={[styles.btnText, { color: COLORS.primary }]}>Clear AsyncStorage Cache</Text>
        </TouchableOpacity>
      </View>

      {message ? <Text style={styles.feedback}>{message}</Text> : null}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log Out of Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 14 },
  card: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14
  },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 },
  meta: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  actionBtn: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  btnText: { color: COLORS.accent, fontWeight: '600', fontSize: 13 },
  feedback: { color: COLORS.success, textAlign: 'center', marginVertical: 10 },
  logoutBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20
  },
  logoutText: { color: '#FFFFFF', fontWeight: 'bold' }
});
