import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function SquadTasteFingerprint({ groupId }) {
  const [divergenceList, setDivergenceList] = useState([]);

  useEffect(() => {
    if (groupId) {
      axiosClient
        .get(`/groups/${groupId}/divergence`)
        .then((res) => setDivergenceList(res.data.data || []))
        .catch(() => setDivergenceList([]));
    }
  }, [groupId]);

  if (divergenceList.length === 0) return null;

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 10, color: '#f59e0b' }}>
        Squad Taste Archetypes & Divergence (PostgreSQL Standard Deviation SQL)
      </h3>
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {divergenceList.map((m) => (
          <div
            key={m.username}
            style={{
              background: '#0b0f19',
              padding: 12,
              borderRadius: 10,
              border: '1px solid #1e293b'
            }}
          >
            <strong>@{m.username}</strong>
            <p style={{ color: '#38bdf8', fontSize: 12, margin: '4px 0' }}>
              Taste Divergence Index: {m.taste_divergence_index}
            </p>
            <span
              style={{
                fontSize: 11,
                color: m.taste_divergence_index >= 3 ? '#f59e0b' : '#22c55e',
                fontWeight: 600
              }}
            >
              {m.role_archetype}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
