import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS } from '../constants/theme';
import apiClient from '../services/apiClient';

export default function SquadsScreen() {
  const [inviteCode, setInviteCode] = useState('NST202');
  const [group, setGroup] = useState(null);
  const [blendRecs, setBlendRecs] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  async function handleJoinOrLoadSquad() {
    try {
      setStatusMessage('Joining squad...');
      const joinRes = await apiClient.post('/groups/join-by-code', { inviteCode });
      const groupId = joinRes.data.data.id;
      await fetchGroupDetails(groupId);
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Already in squad or invalid code');
    }
  }

  async function fetchGroupDetails(groupId) {
    const [feedRes, blendRes] = await Promise.all([
      apiClient.get(`/groups/${groupId}/feed`),
      apiClient.get(`/groups/${groupId}/blend-recs`)
    ]);
    setGroup(feedRes.data.data);
    setBlendRecs(blendRes.data.data || []);
    setStatusMessage('Squad synced!');
  }

  async function handleVote(groupItemId) {
    if (!group) return;
    try {
      await apiClient.post(`/groups/${group.id}/polls/vote`, { groupItemId });
      await fetchGroupDetails(group.id);
    } catch (err) {
      setStatusMessage(err.response?.data?.message || 'Vote already cast');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Friend Squads & Blend</Text>

      <View style={styles.joinRow}>
        <TextInput
          style={styles.codeInput}
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="Invite Code (e.g. NST202)"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.joinBtn} onPress={handleJoinOrLoadSquad}>
          <Text style={styles.joinBtnText}>Join Squad</Text>
        </TouchableOpacity>
      </View>

      {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}

      {group ? (
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>
            {group.name} • Watch Tonight Poll
          </Text>
          <FlatList
            data={group.sharedList || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.pollCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.movieTitle}>{item.media?.title}</Text>
                  <Text style={styles.pitch}>"{item.pitchNote}"</Text>
                  <Text style={styles.badge}>
                    Status: {item.status} • Votes: {item.voteCount}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.voteBtn}
                  onPress={() => handleVote(item.id)}
                >
                  <Text style={styles.voteBtnText}>Vote ▲</Text>
                </TouchableOpacity>
              </View>
            )}
            ListFooterComponent={
              <View style={{ marginTop: 16 }}>
                <Text style={styles.sectionTitle}>SQL Group Blend Matches</Text>
                {blendRecs.map((rec) => (
                  <View key={rec.id} style={styles.blendCard}>
                    <Text style={styles.movieTitle}>{rec.title}</Text>
                    <Text style={styles.blendScore}>
                      Shared Squad Taste Score: {rec.shared_taste_score} • ★ {rec.avgRating}
                    </Text>
                  </View>
                ))}
              </View>
            }
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 12 },
  joinRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  codeInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 10
  },
  joinBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  statusText: { color: COLORS.accent, fontSize: 12, marginBottom: 10 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginVertical: 10
  },
  pollCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  movieTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  pitch: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 2 },
  badge: { fontSize: 12, color: COLORS.warning, marginTop: 6, fontWeight: '600' },
  voteBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  voteBtnText: { color: '#0B0F19', fontWeight: 'bold', fontSize: 12 },
  blendCard: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success
  },
  blendScore: { fontSize: 12, color: COLORS.success, marginTop: 4 }
});
