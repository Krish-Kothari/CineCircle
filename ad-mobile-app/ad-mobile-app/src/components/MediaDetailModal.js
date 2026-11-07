import React, { useState } from 'react';
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../constants/theme';
import apiClient from '../services/apiClient';

const WATCH_STATUSES = ['PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'DROPPED'];

export default function MediaDetailModal({ visible, media, onClose }) {
  const [rating, setRating] = useState('9');
  const [reviewText, setReviewText] = useState('');
  const [currentStatus, setCurrentStatus] = useState('PLAN_TO_WATCH');
  const [feedback, setFeedback] = useState('');

  if (!media) return null;

  async function handleStatusChange(status) {
    try {
      await apiClient.post('/tracker/watchlist/upsert', {
        mediaId: media.id,
        status
      });
      setCurrentStatus(status);
      setFeedback(`Watchlist updated to ${status}`);
    } catch {
      setFeedback('Failed to update status');
    }
  }

  async function handleSubmitRating() {
    try {
      const res = await apiClient.post('/catalog/reviews/submit', {
        mediaId: media.id,
        rating: Number(rating),
        reviewText
      });
      setFeedback(`Saved! Updated Avg: ★ ${res.data.data.mediaStats.avgRating}`);
      setReviewText('');
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Could not submit rating');
    }
  }

  function handleOpenOttLink(url) {
    if (url) {
      Linking.openURL(url);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{media.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Close ✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.meta}>
            {media.type} • {media.releaseYear} • ★ {media.avgRating}
          </Text>
          <Text style={styles.synopsis}>{media.synopsis}</Text>

          <Text style={styles.sectionTitle}>Set Watch Status</Text>
          <View style={styles.statusRow}>
            {WATCH_STATUSES.map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.statusBtn, currentStatus === st && styles.statusBtnActive]}
                onPress={() => handleStatusChange(st)}
              >
                <Text style={[styles.statusText, currentStatus === st && styles.statusTextActive]}>
                  {st.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Stream Now</Text>
          <View style={styles.ottRow}>
            {(media.streamingOptions || []).map((opt) => (
              <TouchableOpacity
                key={opt.platformName}
                style={styles.ottBtn}
                onPress={() => handleOpenOttLink(opt.watchUrl)}
              >
                <Text style={styles.ottBtnText}>Open {opt.platformName} ↗</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Quick Rate (1–10 ACID Tx)</Text>
          <View style={styles.rateRow}>
            <TextInput
              style={styles.rateInput}
              value={rating}
              onChangeText={setRating}
              keyboardType="numeric"
              maxLength={2}
            />
            <TextInput
              style={styles.reviewInput}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Short review..."
              placeholderTextColor={COLORS.textSecondary}
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitRating}>
              <Text style={styles.submitBtnText}>Rate</Text>
            </TouchableOpacity>
          </View>

          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  closeBtn: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 'bold' },
  meta: { color: COLORS.accent, fontSize: 13, marginTop: 4, marginBottom: 8 },
  synopsis: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  sectionTitle: { color: COLORS.textPrimary, fontWeight: 'bold', fontSize: 13, marginBottom: 8, marginTop: 4 },
  statusRow: { flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  statusBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  statusTextActive: { color: '#FFFFFF' },
  ottRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  ottBtn: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent
  },
  ottBtnText: { color: COLORS.accent, fontSize: 11, fontWeight: '600' },
  rateRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rateInput: {
    width: 44,
    backgroundColor: COLORS.background,
    color: COLORS.warning,
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  reviewInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8
  },
  submitBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  feedback: { color: COLORS.success, fontSize: 12, marginTop: 10 }
});
