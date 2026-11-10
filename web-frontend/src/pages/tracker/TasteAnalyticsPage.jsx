import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import MonthlyWrappedCard from '../../components/MonthlyWrappedCard';

const GENRES = ['Sci-Fi', 'Thriller', 'Action', 'Drama', 'Mystery', 'Crime'];

export default function TasteAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('Sci-Fi');
  const [weightScore, setWeightScore] = useState(9);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await axiosClient.get('/tracker/watchlist/stats');
      setStats(res.data.data);
    } catch {
      setFeedback('Log in above to view your PostgreSQL watch analytics.');
    }
  }

  async function handleSavePreference(e) {
    e.preventDefault();
    try {
      await axiosClient.put('/tracker/preferences/genres', {
        preferences: [{ genre: selectedGenre, weightScore: Number(weightScore) }]
      });
      setFeedback(`Updated ${selectedGenre} affinity weight to ${weightScore}/10`);
      fetchStats();
    } catch {
      setFeedback('Failed to update genre preference');
    }
  }

  return (
    <div>
      <h2>SQL Watch-Time Analytics & Genre Taste Weights</h2>
      {feedback && <p style={{ color: '#22c55e', margin: '8px 0' }}>{feedback}</p>}

      <MonthlyWrappedCard />

      {stats?.summaryView && (
        <div className="grid-cards" style={{ marginBottom: 24 }}>
          <div className="card">
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Total Watch Time (PostgreSQL View)</p>
            <h2 style={{ color: '#e50914', marginTop: 6 }}>
              {stats.summaryView.totalWatchMinutes} mins ({stats.summaryView.total_watch_hours} hrs)
            </h2>
          </div>
          <div className="card">
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Completed Titles</p>
            <h2 style={{ color: '#22c55e', marginTop: 6 }}>{stats.summaryView.completed_items}</h2>
          </div>
          <div className="card">
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Currently Watching</p>
            <h2 style={{ color: '#38bdf8', marginTop: 6 }}>{stats.summaryView.currently_watching}</h2>
          </div>
        </div>
      )}

      <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>PostgreSQL unnest(genres) Breakdown</h3>
          {(stats?.genreBreakdown || []).map((row) => (
            <div
              key={row.genre}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #1e293b'
              }}
            >
              <span><strong>{row.genre}</strong> ({row.completed_titles}/{row.total_titles} completed)</span>
              <span style={{ color: '#38bdf8' }}>{row.minutes_watched} mins</span>
            </div>
          ))}
        </div>

        <form className="card" onSubmit={handleSavePreference}>
          <h3 style={{ marginBottom: 12 }}>Adjust Genre Recommendation Weight (1–10)</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Select Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              style={{ width: '100%', padding: 10, background: '#0b0f19', color: '#fff', border: '1px solid #1e293b', borderRadius: 8 }}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>
              Weight Score: {weightScore} / 10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={weightScore}
              onChange={(e) => setWeightScore(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="btn-primary">Save Taste Weight</button>
        </form>
      </div>
    </div>
  );
}
