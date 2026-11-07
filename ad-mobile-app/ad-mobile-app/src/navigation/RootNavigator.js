import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import SearchScreen from '../screens/SearchScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import SquadsScreen from '../screens/SquadsScreen';
import ProfileStatsScreen from '../screens/ProfileStatsScreen';
import SettingsScreen from '../screens/SettingsScreen';

export default function RootNavigator() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('DISCOVER');

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>CineCircle</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>@{user.username} (Logout)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.screenArea}>
        {activeTab === 'DISCOVER' && <DiscoverScreen />}
        {activeTab === 'SEARCH' && <SearchScreen />}
        {activeTab === 'WATCHLIST' && <WatchlistScreen />}
        {activeTab === 'SQUADS' && <SquadsScreen />}
        {activeTab === 'PROFILE' && <ProfileStatsScreen />}
        {activeTab === 'SETTINGS' && <SettingsScreen />}
      </View>

      <View style={styles.bottomNav}>
        {[
          { id: 'DISCOVER', label: 'Feed' },
          { id: 'SEARCH', label: 'Search' },
          { id: 'WATCHLIST', label: 'Watchlist' },
          { id: 'SQUADS', label: 'Squads' },
          { id: 'PROFILE', label: 'Stats' },
          { id: 'SETTINGS', label: 'Settings' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.navLabel,
                activeTab === tab.id && styles.navLabelActive
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  logo: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  logoutText: { fontSize: 12, color: COLORS.textSecondary },
  screenArea: { flex: 1 },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 10
  },
  navItem: { flex: 1, alignItems: 'center' },
  navLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  navLabelActive: { color: COLORS.primary, fontWeight: 'bold' }
});
