import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../constants/theme';
import apiClient from '../services/apiClient';

const GENRES = ['Sci-Fi', 'Thriller', 'Action', 'Drama', 'Mystery', 'Crime'];

export default function GenreOnboardingModal({ visible, onClose, onSaved }) {
  const [weights, setWeights] = useState({
    'Sci-Fi': 10,
    Thriller: 9,
    Action: 8,
    Drama: 7,
    Mystery: 8,
    Crime: 7
  });
  const [saving, setSaving] = useState(false);

  function cycleWeight(genre) {
    setWeights((prev) => {
      const next = prev[genre] >= 10 ? 2 : prev[genre] + 2;
      return { ...prev, [genre]: next };
    });
  }

  async function handleSavePreferences() {
    try {
      setSaving(true);
      const preferences = Object.entries(weights).map(([genre, weightScore]) => ({
        genre,
        weightScore
      }));
      await apiClient.put('/tracker/preferences/genres', { preferences });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.warn('Failed to save genre weights:', err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Tune Your Genre Weights</Text>
          <Text style={styles.subtitle}>
            Tap any genre to cycle its SQL recommendation weight (2 to 10)
          </Text>

          <View style={styles.grid}>
            {GENRES.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={styles.genreBtn}
                onPress={() => cycleWeight(genre)}
              >
                <Text style={styles.genreLabel}>{genre}</Text>
                <Text style={styles.weightBadge}>{weights[genre]} / 10</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSavePreferences}
              disabled={saving}
            >
              <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Weights'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  title: { fontSize: 19, fontWeight: 'bold', color: COLORS.textPrimary },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  genreBtn: {
    width: '47%',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  genreLabel: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 13 },
  weightBadge: { color: COLORS.accent, fontWeight: 'bold', fontSize: 13 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 14 },
  cancelText: { color: COLORS.textSecondary, fontWeight: '600' },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8
  },
  saveText: { color: '#FFFFFF', fontWeight: 'bold' }
});
