import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import apiClient from '../services/apiClient';
import { FALLBACK_POSTERS } from './MediaCard';

const STATUSES = [
  { label: 'Plan to watch', value: 'PLAN_TO_WATCH' },
  { label: 'Watching', value: 'WATCHING' },
  { label: 'Completed', value: 'COMPLETED' }
];

export default function MediaDetailModal({ visible, media, onClose }) {
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState('PLAN_TO_WATCH');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [poster, setPoster] = useState(null);

  useEffect(() => {
    setPoster(media?.posterUrl || FALLBACK_POSTERS[media?.title] || null);
    setRating(0);
    setMessage('');
  }, [media]);

  if (!media) return null;

  async function saveStatus() {
    try {
      setSaving(true);
      await apiClient.post('/tracker/watchlist/upsert', { mediaId: media.id, status });
      if (rating > 0) {
        await apiClient.post('/catalog/reviews/submit', { mediaId: media.id, rating });
      }
      setMessage('Saved to your library');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save this title');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.header}>
              {poster ? <Image source={{ uri: poster }} style={styles.poster} onError={() => setPoster(null)} /> : <View style={styles.posterFallback}><Text style={styles.fallbackText}>CINE</Text></View>}
              <View style={styles.headerDetails}>
                <Text style={styles.title}>{media.title}</Text>
                <Text style={styles.meta}>{media.type === 'TV_SHOW' ? 'Series' : 'Movie'} · {media.releaseYear || '—'}</Text>
                <Text style={styles.genres}>{(media.genres || []).join(' · ') || 'Cinema pick'}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>YOUR RATING</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity key={value} style={[styles.ratingPill, rating === value && styles.ratingPillActive]} onPress={() => setRating(value)}>
                  <Text style={[styles.ratingValue, rating === value && styles.ratingValueActive]}>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>ADD TO YOUR LIBRARY</Text>
            <View style={styles.statusRow}>
              {STATUSES.map((option) => (
                <TouchableOpacity key={option.value} style={[styles.statusChip, status === option.value && styles.statusChipActive]} onPress={() => setStatus(option.value)}>
                  <Text style={[styles.statusText, status === option.value && styles.statusTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.synopsis}>{media.synopsis || 'A new title to add to your next movie night.'}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
            <TouchableOpacity style={styles.saveButton} onPress={saveStatus} disabled={saving}>
              {saving ? <ActivityIndicator color="#111111" /> : <><Ionicons name="bookmark-outline" size={18} color="#111111" /><Text style={styles.saveText}>Save to library</Text></>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.72)' },
  sheet: { maxHeight: '88%', backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: COLORS.border },
  handle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 5, backgroundColor: COLORS.textSecondary, marginTop: 10 },
  content: { padding: 20, paddingBottom: 34 },
  header: { flexDirection: 'row', marginTop: 16 },
  poster: { width: 96, height: 140, borderRadius: 12, backgroundColor: COLORS.glass },
  posterFallback: { width: 96, height: 140, borderRadius: 12, backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: COLORS.primary, fontWeight: '900' },
  headerDetails: { flex: 1, paddingHorizontal: 14, paddingTop: 6 },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  meta: { color: COLORS.textSecondary, fontSize: 13, marginTop: 8 },
  genres: { color: COLORS.accent, fontSize: 12, marginTop: 10, lineHeight: 18 },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 24, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingPill: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center' },
  ratingPillActive: { backgroundColor: COLORS.primary },
  ratingValue: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '800' },
  ratingValueActive: { color: '#111111' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  statusChipActive: { backgroundColor: COLORS.glass, borderColor: COLORS.primary },
  statusText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700' },
  statusTextActive: { color: COLORS.primary },
  synopsis: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 21, marginTop: 22 },
  message: { color: COLORS.success, fontSize: 12, marginTop: 12 },
  saveButton: { flexDirection: 'row', gap: 8, backgroundColor: COLORS.primary, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, marginTop: 18 },
  saveText: { color: '#111111', fontWeight: '900' }
});
