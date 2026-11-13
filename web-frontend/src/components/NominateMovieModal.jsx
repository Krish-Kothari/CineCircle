import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function NominateMovieModal({ groupId, onNominated }) {
  const [catalog, setCatalog] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    axiosClient.get('/catalog/search').then((res) => {
      const items = res.data.data || [];
      setCatalog(items);
      if (items.length > 0) setSelectedMediaId(items[0].id);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedMediaId) return;
    await axiosClient.post(`/groups/${groupId}/recommend-friend`, {
      mediaId: selectedMediaId,
      targetUsername: targetUsername.trim(),
      note: note.trim()
    });
    setNote('');
    setTargetUsername('');
    if (onNominated) onNominated();
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h3 style={{ marginBottom: 12 }}>Recommend a Movie to Squad / Tag a Friend</h3>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select
          value={selectedMediaId}
          onChange={(e) => setSelectedMediaId(e.target.value)}
          style={{ padding: 10, background: '#0b0f19', color: '#fff', border: '1px solid #1e293b', borderRadius: 8 }}
        >
          {catalog.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} ({item.releaseYear}) — ★ {item.avgRating}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Tag friend username (optional)"
          value={targetUsername}
          onChange={(e) => setTargetUsername(e.target.value)}
          style={{ width: 210, padding: 10, background: '#0b0f19', color: '#fff', border: '1px solid #1e293b', borderRadius: 8 }}
        />

        <input
          type="text"
          placeholder="Why should the squad watch this tonight?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ flex: 1, padding: 10, background: '#0b0f19', color: '#fff', border: '1px solid #1e293b', borderRadius: 8 }}
        />

        <button type="submit" className="btn-primary">Pitch to Squad</button>
      </div>
    </form>
  );
}

