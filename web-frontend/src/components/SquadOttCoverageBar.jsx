import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function SquadOttCoverageBar({ groupId }) {
  const [coverage, setCoverage] = useState([]);

  useEffect(() => {
    if (groupId) {
      axiosClient
        .get(`/groups/${groupId}/ott-coverage`)
        .then((res) => setCoverage(res.data.data || []))
        .catch(() => setCoverage([]));
    }
  }, [groupId]);

  if (coverage.length === 0) return null;

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 10, color: '#22c55e' }}>
        Squad OTT Subscription Coverage (PostgreSQL unnest Aggregation)
      </h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {coverage.map((item) => (
          <div
            key={item.platform_name}
            style={{
              background: '#0b0f19',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #1e293b'
            }}
          >
            <strong>{item.platform_name}</strong>:{' '}
            <span style={{ color: '#38bdf8' }}>
              {item.subscribed_members}/{item.total_members} members
            </span>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              ({(item.member_usernames || []).join(', ')})
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
