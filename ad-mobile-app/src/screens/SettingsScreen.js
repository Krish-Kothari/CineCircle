import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.subtitle}>Manage your CineCircle account.</Text>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>ACCOUNT</Text>
        <Text style={styles.name}>{user?.name || user?.username || 'CineCircle member'}</Text>
        <Text style={styles.email}>{user?.email || 'Your account'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.eyebrow}>ABOUT CINECIRCLE</Text>
        <Text style={styles.description}>
          Discover something great, keep your watchlist organized, and share what you love with your circle.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
      <Text style={styles.version}>CineCircle · Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  heading: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginTop: 8 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, marginTop: 5, marginBottom: 22 },
  card: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14
  },
  eyebrow: { color: COLORS.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10 },
  name: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },
  email: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },
  description: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  logoutBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16
  },
  logoutText: { color: '#111111', fontWeight: '800', fontSize: 15 },
  version: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 12, marginBottom: 4 }
});
