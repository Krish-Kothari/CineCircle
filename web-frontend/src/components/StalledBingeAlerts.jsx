import React from 'react';

export default function StalledBingeAlerts({ alerts = [] }) {
  if (!alerts.length) return null;
  return (
    <div className="card">
      <h3>Stalled watchlist alerts</h3>
      {alerts.map((alert, index) => <p key={alert.id || index}>{alert.title || alert.message || 'Watchlist item needs attention.'}</p>)}
    </div>
  );
}
