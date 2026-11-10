import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function MonthlyWrappedCard() {
  const [wrapped, setWrapped] = useState(null);

  useEffect(() => {
    axiosClient
      .get('/tracker/watchlist/wrapped')
      .then((res) => setWrapped(res.data.data))
      .catch(() => setWrapped(null));
  }, []);

  if (!wrapped) return null;

  return (
    <div
      className="card"
      style={{
        marginBottom: 24,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #151c2c 100%)',
        borderColor: '#6366f1'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: '#818cf8' }}>Monthly Rewind (Last 30 Days SQL Wrapped)</h3>
        <span style={{ fontSize: 11, background: '#4338ca', color: '#fff', padding: '3px 8px', borderRadius: 6 }}>
          Live Habit Insights
        </span>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div style={{ background: '#0b0f19', padding: 12, borderRadius: 8 }}>
          <p style={{ fontSize: 11, color: '#94a3b8' }}>Hours Streamed</p>
          <strong style={{ fontSize: 18, color: '#38bdf8' }}>{wrapped.overview.total_monthly_hours} hrs</strong>
        </div>
        <div style={{ background: '#0b0f19', padding: 12, borderRadius: 8 }}>
          <p style={{ fontSize: 11, color: '#94a3b8' }}>Episodes Logged</p>
          <strong style={{ fontSize: 18, color: '#22c55e' }}>{wrapped.overview.monthly_episodes} eps</strong>
        </div>
        <div style={{ background: '#0b0f19', padding: 12, borderRadius: 8 }}>
          <p style={{ fontSize: 11, color: '#94a3b8' }}>Top Binge Genre</p>
          <strong style={{ fontSize: 18, color: '#f59e0b' }}>{wrapped.topGenre}</strong>
        </div>
        <div style={{ background: '#0b0f19', padding: 12, borderRadius: 8 }}>
          <p style={{ fontSize: 11, color: '#94a3b8' }}>Peak Binge Day</p>
          <strong style={{ fontSize: 18, color: '#ec4899' }}>{wrapped.peakDay}</strong>
        </div>
      </div>
    </div>
  );
}
