import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function StalledBingeAlerts({ onStatusUpdated }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const res = await axiosClient.get('/tracker/watchlist/stalled-alerts');
      setAlerts(res.data.data || []);
    } catch {
      setAlerts([]);
    }
  }

  async function handleMarkDropped(mediaId) {
    await axiosClient.post('/tracker/watchlist/upsert', {
      mediaId,
      status: 'DROPPED',
      personalNotes: 'Marked dropped due to extended inactivity alert'
    });
    loadAlerts();
    if (onStatusUpdated) onStatusUpdated();
  }

  if (alerts.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: 20, borderColor: '#f59e0b', background: '#1c1917' }}>
      <h3 style={{ color: '#f59e0b', marginBottom: 8 }}>
        ⚠ Stalled Binge Alerts (PostgreSQL Churn Risk Engine)
      </h3>
      <p style={{ fontSize: 12, color: '#d6d3d1', marginBottom: 14 }}>
        You have active shows that haven't been touched in over 14 days. Resume watching or mark as dropped to keep your completion stats accurate.
      </p>

      <div className="grid-cards">
        {alerts.map((item) => (
          <div key={item.watchlist_id} style={{ background: '#0c0a09', padding: 12, borderRadius: 10, border: '1px solid #292524' }}>
            <strong>{item.title}</strong>
            <p style={{ fontSize: 12, color: '#f59e0b', margin: '4px 0' }}>
              {item.days_since_last_watch} days inactive • {item.abandoned_episodes} eps left
            </p>
            <p style={{ fontSize: 11, color: '#a8a29e', marginBottom: 10 }}>
              {item.churn_risk_level}
            </p>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: 12, borderColor: '#ef4444', color: '#ef4444' }}
              onClick={() => handleMarkDropped(item.media_id)}
            >
              Mark as Dropped
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
