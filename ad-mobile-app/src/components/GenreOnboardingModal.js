import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import apiClient from '../services/apiClient';

export default function GenreOnboardingModal({ visible, onClose, onSaved }) {
  const [genre, setGenre] = useState('Sci-Fi');
  const [weightScore, setWeightScore] = useState('10');
  const [error, setError] = useState('');

  async function savePreference() {
    try {
      await apiClient.put('/tracker/preferences/genres', {
        preferences: [{ genre: genre.trim(), weightScore: Number(weightScore) }]
      });
      setError('');
      onSaved();
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save preference.');
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Tune your taste</Text>
          <TextInput style={styles.input} value={genre} onChangeText={setGenre} placeholder="Genre" placeholderTextColor={COLORS.textSecondary} />
          <TextInput style={styles.input} value={weightScore} onChangeText={setWeightScore} keyboardType="number-pad" placeholder="Weight 1-10" placeholderTextColor={COLORS.textSecondary} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={savePreference}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#0009' },
  card: { backgroundColor: COLORS.surface, padding: 20, borderRadius: 16 },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold', marginBottom: 14 },
  input: { color: COLORS.textPrimary, borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  error: { color: COLORS.primary, marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16 },
  cancel: { color: COLORS.textSecondary },
  button: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});
