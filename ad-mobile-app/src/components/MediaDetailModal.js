import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function MediaDetailModal({ visible, media, onClose }) {
  if (!media) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView style={styles.card}>
          <Text style={styles.title}>{media.title}</Text>
          <Text style={styles.meta}>{media.type} {media.releaseYear ? `- ${media.releaseYear}` : ''}</Text>
          <Text style={styles.body}>{media.synopsis || 'No synopsis available.'}</Text>
          <Text style={styles.meta}>{(media.genres || []).join(' - ')}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0009' },
  card: { maxHeight: '80%', backgroundColor: COLORS.surface, padding: 20, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' },
  meta: { color: COLORS.accent, marginTop: 8 },
  body: { color: COLORS.textPrimary, marginTop: 16, lineHeight: 21 },
  button: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  buttonText: { color: '#111111', fontWeight: 'bold' }
});
