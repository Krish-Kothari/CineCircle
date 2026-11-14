import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function SquadSchedulePlanner({ groupId }) {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (groupId) {
      axiosClient
        .get(`/groups/${groupId}/optimal-slot`)
        .then((res) => setSlots(res.data.data || []))
        .catch(() => setSlots([]));
    }
  }, [groupId]);

  if (slots.length === 0) return null;

  return (
    <div className="card" style={{ marginTop: 20, borderColor: '#38bdf8' }}>
      <h3 style={{ color: '#38bdf8', marginBottom: 8 }}>
        Optimal Watch Party Time Slot (SQL Habit Overlap Engine)
      </h3>
      <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
        Aggregates past viewing hours across squad members to determine the time slot where everyone is most likely free.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {slots.map((s, idx) => (
          <div
            key={idx}
            style={{
              background: '#0b0f19',
              padding: 12,
              borderRadius: 8,
              border: idx === 0 ? '2px solid #22c55e' : '1px solid #1e293b',
              flex: 1
            }}
          >
            <strong>{s.binge_day}</strong>
            <p style={{ fontSize: 12, color: '#22c55e', margin: '4px 0' }}>
              {s.optimal_slot_window}
            </p>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              {s.aligned_members_count} member(s) active during this window
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
