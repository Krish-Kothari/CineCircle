
import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

import SquadOttCoverageBar from './SquadOttCoverageBar';

export default function SquadActivityTimeline({ groupId }) {
  const [activities, setActivities] = useState([]);
  const [compatibility, setCompatibility] = useState([]);

  useEffect(() => {
    if (groupId) {
      loadExtras();
    }
  }, [groupId]);

  async function loadExtras() {
    try {
      const [actRes, compRes] = await Promise.all([
        axiosClient.get(`/groups/${groupId}/activity`),
        axiosClient.get(`/groups/${groupId}/compatibility`)
      ]);

      setActivities(actRes.data.data || []);
      setCompatibility(compRes.data.data?.compatibility || []);
    } catch (err) {
      console.error(
        'Failed to load squad activity and compatibility:',
        err.response?.data?.message || err.message
      );
    }
  }

  return (
    <div>
      {/* Squad OTT Subscription Coverage */}
      <SquadOttCoverageBar groupId={groupId} />

      {/* Pairwise Compatibility and Live Activity */}
      <div
        className="grid-cards"
        style={{
          gridTemplateColumns: '1fr 1fr',
          marginTop: 28
        }}
      >
        {/* Pairwise Taste Compatibility */}
        <div className="card">
          <h3 style={{ marginBottom: 12, color: '#38bdf8' }}>
            Pairwise Taste Compatibility (SQL Self-Join)
          </h3>

          {compatibility.map((pair, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #1e293b'
              }}
            >
              <span>
                @{pair.member_a} × @{pair.member_b} (
                {pair.shared_genres} shared genres)
              </span>

              <strong style={{ color: '#22c55e' }}>
                {pair.compatibility_pct}% Match
              </strong>
            </div>
          ))}
        </div>

        {/* Live Squad Activity Stream */}
        <div className="card">
          <h3 style={{ marginBottom: 12, color: '#e50914' }}>
            Live Squad Activity Stream (SQL UNION ALL)
          </h3>

          {activities.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>
              No recent reviews or watchlist updates from squad members yet.
            </p>
          ) : (
            activities.map((act, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #1e293b',
                  fontSize: 13
                }}
              >
                <strong>@{act.username}</strong> — {act.media_title} (
                {act.detail})
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
