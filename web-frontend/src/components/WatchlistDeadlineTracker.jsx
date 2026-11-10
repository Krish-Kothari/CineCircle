import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function WatchlistDeadlineTracker() {
  const [feasibilityList, setFeasibilityList] = useState([]);

  useEffect(() => {
    axiosClient
      .get('/tracker/watchlist/feasibility')
      .then((res) => setFeasibilityList(res.data.data || []))
      .catch(() => setFeasibilityList([]));
  }, []);

  if (feasibilityList.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: 20, borderColor: '#38bdf8' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ color: '#38bdf8' }}>Target Completion Feasibility (SQL Velocity Engine)</h3>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          Historical Capacity: ~{feasibilityList[0]?.historical_daily_capacity_minutes || 0} mins/day
        </span>
      </div>

      <div className="grid-cards">
        {feasibilityList.slice(0, 4).map((item) => (
          <div
            key={item.watchlist_id}
            style={{
              background: '#0b0f19',
              padding: 12,
              borderRadius: 10,
              border: '1px solid #1e293b'
            }}
          >
            <strong>{item.title}</strong>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0' }}>
              {item.remaining_minutes} mins remaining
            </p>
            <p style={{ fontSize: 11, color: '#38bdf8' }}>
              7d target: {item.required_daily_minutes_7d_target}m/day
            </p>
            <span
              style={{
                display: 'inline-block',
                marginTop: 6,
                fontSize: 11,
                fontWeight: 600,
                color: item.target_feasibility.includes('Easily') ? '#22c55e' : '#f59e0b'
              }}
            >
              {item.target_feasibility}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
