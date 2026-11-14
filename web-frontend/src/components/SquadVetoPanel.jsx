import React, { useState } from 'react';

const COMMON_GENRES = ['Horror', 'Comedy', 'Drama', 'Action', 'Mystery'];

export default function SquadVetoPanel({ onApplyVeto }) {
  const [vetoed, setVetoed] = useState([]);

  function toggleVeto(genre) {
    const updated = vetoed.includes(genre)
      ? vetoed.filter((g) => g !== genre)
      : [...vetoed, genre];
    setVetoed(updated);
    if (onApplyVeto) onApplyVeto(updated);
  }

  return (
    <div style={{ margin: '14px 0', padding: 12, background: '#0b0f19', borderRadius: 10, border: '1px solid #1e293b' }}>
      <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
        Squad Genre Veto (Array Exclusion Filter):
      </span>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        {COMMON_GENRES.map((g) => (
          <button
            key={g}
            type="button"
            className={vetoed.includes(g) ? 'btn-primary' : 'btn-outline'}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              backgroundColor: vetoed.includes(g) ? '#ef4444' : 'transparent',
              borderColor: vetoed.includes(g) ? '#ef4444' : '#1e293b'
            }}
            onClick={() => toggleVeto(g)}
          >
            {vetoed.includes(g) ? `✕ Vetoed: ${g}` : `+ Veto ${g}`}
          </button>
        ))}
      </div>
    </div>
  );
}
