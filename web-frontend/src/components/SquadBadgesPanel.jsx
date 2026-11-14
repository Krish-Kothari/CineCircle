import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function SquadBadgesPanel({ groupId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (groupId) {
      axiosClient
        .get(`/groups/${groupId}/badges`)
        .then((res) => setData(res.data.data))
        .catch(() => setData(null));
    }
  }, [groupId]);

  if (!data || !data.squad_badges || data.squad_badges.length === 0) return null;

  return (
    <div style={{ margin: '14px 0', padding: 12, background: '#0b0f19', borderRadius: 10, border: '1px solid #10b981' }}>
      <span style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>
        ★ Squad Milestones Unlocked ({data.completed_watch_parties} watch parties):
      </span>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        {data.squad_badges.map((badge, idx) => (
          <span
            key={idx}
            style={{
              fontSize: 12,
              background: '#064e3b',
              color: '#6ee7b7',
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #059669',
              fontWeight: 600
            }}
          >
            🏆 {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
