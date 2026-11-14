import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import SquadActivityTimeline from '../../components/SquadActivityTimeline';
import NominateMovieModal from '../../components/NominateMovieModal';
import TonightsPickHero from '../../components/TonightsPickHero';
import SquadVetoPanel from '../../components/SquadVetoPanel';
import SquadBadgesPanel from '../../components/SquadBadgesPanel';
import SquadSchedulePlanner from '../../components/SquadSchedulePlanner';
import SquadRosterModal from '../../components/SquadRosterModal';

export default function SquadRoomPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [blendRecs, setBlendRecs] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadSquadRoom();
  }, [id]);

  async function loadSquadRoom() {
    const [feedRes, blendRes, lbRes] = await Promise.all([
      axiosClient.get(`/groups/${id}/feed`),
      axiosClient.get(`/groups/${id}/blend-recs`),
      axiosClient.get(`/groups/${id}/leaderboard`)
    ]);
    setGroup(feedRes.data.data);
    setBlendRecs(blendRes.data.data || []);
    setLeaderboard(lbRes.data.data || []);
  }

  async function handleApplyVeto(vetoedList) {
    if (vetoedList.length === 0) {
      const res = await axiosClient.get(`/groups/${id}/blend-recs`);
      setBlendRecs(res.data.data || []);
      return;
    }
    const res = await axiosClient.get(`/groups/${id}/blend-veto?veto=${vetoedList.join(',')}`);
    setBlendRecs(res.data.data || []);
    setFeedback(`Applied Veto: Excluded ${vetoedList.join(', ')} from squad blend.`);
  }

  async function handleVote(groupItemId) {
    try {
      const res = await axiosClient.post(`/groups/${id}/polls/vote`, { groupItemId });
      setFeedback(res.data.message);
      loadSquadRoom();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'You already voted for this nomination');
    }
  }

  async function handleCompleteWatchParty(groupItemId) {
    try {
      const res = await axiosClient.post(`/groups/${id}/polls/complete-party`, { groupItemId });
      setFeedback(res.data.message);
      loadSquadRoom();
    } catch {
      setFeedback('Failed to complete watch party');
    }
  }

  async function handleNominateFromBlend(mediaId, title) {
    try {
      await axiosClient.post(`/groups/${id}/watchlist`, {
        mediaId,
        pitchNote: `Matched via SQL Group Blend for our squad!`
      });
      setFeedback(`Nominated "${title}" to the Watch Tonight Poll!`);
      loadSquadRoom();
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Already nominated in this squad');
    }
  }

  if (!group) return <p>Loading Squad Room...</p>;

  const tonightsPick = (group.sharedList || []).find((i) => i.status === 'TONIGHTS_PICK');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>{group.name} (Invite Code: {group.inviteCode})</h2>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>{group.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {feedback && <span style={{ color: '#22c55e', fontWeight: 600 }}>{feedback}</span>}
          <button className="btn-outline" onClick={() => setShowRosterModal(true)}>
            View Squad Roster ({group.members?.length || 0})
          </button>
        </div>
      </div>

      <SquadBadgesPanel groupId={id} />

      <TonightsPickHero
        item={tonightsPick}
        onCompleteParty={handleCompleteWatchParty}
      />

      <NominateMovieModal
        groupId={id}
        onNominated={() => {
          setFeedback('Pitch added to Squad Watchlist!');
          loadSquadRoom();
        }}
      />

      <div className="grid-cards" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: 28 }}>
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Watch Tonight Poll (ACID Quorum Auto-Lock)</h3>
          {(group.sharedList || []).map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 14,
                background: '#0b0f19',
                borderRadius: 10,
                marginBottom: 10,
                border: item.status === 'TONIGHTS_PICK' ? '2px solid #22c55e' : '1px solid #1e293b'
              }}
            >
              <div>
                <strong>{item.media?.title}</strong>{' '}
                <span style={{ color: '#38bdf8', fontSize: 12 }}>({item.status})</span>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  "{item.pitchNote}" — Nominated by @{item.addedBy?.username}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <strong>{item.voteCount} Votes</strong>
                {item.status !== 'WATCHED_TOGETHER' && (
                  <button className="btn-primary" onClick={() => handleVote(item.id)}>
                    Vote ▲
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Squad Leaderboard (SQL RANK)</h3>
          {leaderboard.map((member) => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #1e293b'
              }}
            >
              <span>#{member.squad_rank} @{member.username}</span>
              <span style={{ color: '#38bdf8' }}>{member.totalWatchMinutes} mins</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Group Blend Matchmaker (Collective Squad Taste)</h3>
        <SquadVetoPanel onApplyVeto={handleApplyVeto} />
        <div className="grid-cards">
          {blendRecs.map((rec) => (
            <div key={rec.id} style={{ background: '#0b0f19', padding: 14, borderRadius: 10, border: '1px solid #1e293b' }}>
              <h4>{rec.title} ({rec.releaseYear})</h4>
              <p style={{ color: '#22c55e', fontSize: 12, margin: '6px 0' }}>
                Shared Taste: {rec.shared_taste_score} • ★ {rec.avgRating}
              </p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                {(rec.genres || []).join(' • ')}
              </p>
              <button
                className="btn-outline"
                onClick={() => handleNominateFromBlend(rec.id, rec.title)}
              >
                + Nominate to Squad Poll
              </button>
            </div>
          ))}
        </div>
      </div>

      <SquadSchedulePlanner groupId={id} />
      <SquadActivityTimeline groupId={id} />

      {showRosterModal && (
        <SquadRosterModal
          group={group}
          onClose={() => setShowRosterModal(false)}
        />
      )}
    </div>
  );
}
