import React from 'react';

export default function TonightsPickHero({ item, onCompleteParty }) {
  if (!item) return null;

  return (
    <div
      className="card"
      style={{
        marginBottom: 24,
        borderColor: '#22c55e',
        background: 'linear-gradient(90deg, #151c2c 0%, #064e3b 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <div>
        <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 12 }}>
          ★ QUORUM WINNER LOCKED — TONIGHT'S SQUAD PICK
        </span>
        <h3 style={{ marginTop: 4 }}>{item.media?.title}</h3>
        <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>
          "{item.pitchNote}" • {item.voteCount} Squad Votes
        </p>
      </div>

      <button
        type="button"
        className="btn-primary"
        style={{ background: '#22c55e', color: '#0b0f19' }}
        onClick={() => onCompleteParty(item.id)}
      >
        Complete Watch Party (Sync All Members ACID Tx)
      </button>
    </div>
  );
}
