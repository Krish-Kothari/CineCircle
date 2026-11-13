import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function SquadsHubPage() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('NST202');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadMyGroups();
  }, []);

  async function loadMyGroups() {
    try {
      const res = await axiosClient.get('/groups/my-groups');
      setGroups(res.data.data || []);
    } catch (err) {
      setMessage('Use the Demo Switcher above to sign in and view your Friend Squads.');
    }
  }

  async function handleCreateSquad(e) {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/groups/create', { name, description });
      setMessage(`Created squad "${res.data.data.name}" (Code: ${res.data.data.inviteCode})`);
      setName('');
      setDescription('');
      loadMyGroups();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create squad');
    }
  }

  async function handleJoinSquad(e) {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/groups/join-by-code', { inviteCode });
      setMessage(`Joined squad "${res.data.data.name}"!`);
      loadMyGroups();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Already a member or invalid code');
    }
  }

  return (
    <div>
      <h2>Friend Squads Hub</h2>
      {message && <p style={{ color: '#38bdf8', margin: '10px 0' }}>{message}</p>}

      <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 28 }}>
        <form className="card" onSubmit={handleCreateSquad}>
          <h3 style={{ marginBottom: 12 }}>Create a New Watch Squad</h3>
          <input
            type="text"
            placeholder="Squad Name (e.g. Hostel Sci-Fi Club)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 10, background: '#0b0f19', color: '#fff', border: '1px solid #1e293b', borderRadius: 8 }}
          />
          <input
            type="text"
            placeholder="Short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 12, background: '#0b0f19', color: '#fff', border: '1px solid #1e293b', borderRadius: 8 }}
          />
          <button type="submit" className="btn-primary">Create Squad</button>
        </form>

        <form className="card" onSubmit={handleJoinSquad}>
          <h3 style={{ marginBottom: 12 }}>Join Friend Squad via Invite Code</h3>
          <input
            type="text"
            placeholder="6-Char Invite Code (e.g. NST202)"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            style={{ width: '100%', padding: 10, marginBottom: 12, background: '#0b0f19', color: '#fff', border: '1px solid #1e293b', borderRadius: 8 }}
          />
          <button type="submit" className="btn-primary">Join by Code</button>
        </form>
      </div>

      <h3>My Active Squads ({groups.length})</h3>
      <div className="grid-cards">
        {groups.map((g) => (
          <div key={g.id} className="card">
            <h3>{g.name}</h3>
            <p style={{ color: '#38bdf8', fontSize: 13, margin: '6px 0' }}>
              Invite Code: <strong>{g.inviteCode}</strong> • {g._count?.members || 1} Members
            </p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 14 }}>{g.description}</p>
            <Link to={`/squads/${g.id}`} className="btn-primary">
              Open Group Blend & Polls →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
