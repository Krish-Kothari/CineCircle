import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { COLORS } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.card}>
        <Text style={styles.title}>CineCircle Mobile</Text>
        <Text style={styles.subtitle}>Personal Movie Tracker & Social Squad Blend</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 24, backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary }
});
