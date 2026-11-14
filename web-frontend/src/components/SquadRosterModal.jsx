import React, { useState } from 'react';

export default function SquadRosterModal({ group, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!group) return null;

  function copyCode() {
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50
      }}
    >
      <div className="card" style={{ width: 420, maxWidth: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3>{group.name} Roster</h3>
          <button className="btn-outline" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: 16, padding: 10, background: '#0b0f19', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Squad Invite Code:</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <strong style={{ fontSize: 18, color: '#38bdf8', letterSpacing: 2 }}>{group.inviteCode}</strong>
            <button className="btn-primary" style={{ fontSize: 12 }} onClick={copyCode}>
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        <h4>Active Squad Members ({(group.members || []).length})</h4>
        <div style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto' }}>
          {(group.members || []).map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #1e293b'
              }}
            >
              <div>
                <strong>@{m.user?.username}</strong>
                <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>({m.role})</span>
              </div>
              <span style={{ fontSize: 12, color: '#22c55e' }}>{m.user?.totalWatchMinutes || 0} mins</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
