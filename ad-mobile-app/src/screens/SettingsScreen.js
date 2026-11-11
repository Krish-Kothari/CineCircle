import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { flushOfflineEpisodeQueue } from '../services/offlineQueue';
import { getActiveApiBaseUrl, setCustomApiBaseUrl } from '../services/apiClient';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [apiUrl, setApiUrl] = useState('http://localhost:5000/api');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getActiveApiBaseUrl().then(setApiUrl);
  }, []);

  async function handleSaveApiUrl() {
    await setCustomApiBaseUrl(apiUrl);
    setMessage(`Saved Backend URL: ${apiUrl}`);
  }

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
      <Text style={styles.heading}>App Settings & Live Demo Config</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Live Classroom LAN IP Switcher</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://192.168.1.X:5000/api"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.actionBtn} onPress={handleSaveApiUrl}>
          <Text style={styles.btnText}>Update Backend API URL</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Offline Storage & Sync (@{user?.username})</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={handleForceSync}>
          <Text style={styles.btnText}>Force Sync Offline Queue →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: COLORS.primary }]}
          onPress={handleClearLocalCache}
        >
          <Text style={[styles.btnText, { color: COLORS.primary }]}>Clear AsyncStorage Cache</Text>
        </TouchableOpacity>
      </View>

      {message ? <Text style={styles.feedback}>{message}</Text> : null}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log Out of Account (v1.0.0)</Text>
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
  title: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  actionBtn: {
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  btnText: { color: COLORS.accent, fontWeight: '600', fontSize: 13 },
  feedback: { color: COLORS.success, textAlign: 'center', marginVertical: 8, fontSize: 12 },
  logoutBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16
  },
  logoutText: { color: '#FFFFFF', fontWeight: 'bold' }
});
