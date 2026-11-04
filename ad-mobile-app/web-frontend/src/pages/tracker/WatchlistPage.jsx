import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';

const STATUS_COLUMNS = ['WATCHING', 'PLAN_TO_WATCH', 'COMPLETED'];

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadWatchlist();
  }, []);

  async function loadWatchlist() {
    try {
      const res = await axiosClient.get('/tracker/watchlist/my-list');
      setItems(res.data.data || []);
    } catch (err) {
      setMessage('Please sign in using the Demo Switcher above to view your Watchlist.');
    }
  }

  async function handleLogEpisode(entry) {
    try {
      const nextEpisode = (entry.watchedEpisodes || 0) + 1;
      await axiosClient.post('/tracker/watchlist/log-episode', {
        mediaId: entry.mediaId,
        seasonNumber: 1,
        episodeNumber: nextEpisode
      });
      setMessage(`Logged Episode ${nextEpisode} for ${entry.media?.title}`);
      loadWatchlist();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error logging episode');
    }
  }

  async function handleCompleteTransactional(mediaId, title) {
    try {
      const res = await axiosClient.post('/tracker/watchlist/complete-media', { mediaId });
      setMessage(
        `ACID Transaction Complete: Marked "${title}" Completed (+${res.data.data.addedWatchMinutes} mins synced)`
      );
      loadWatchlist();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error completing media');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Personal Watchlist Kanban & Episode Tracker</h2>
        {message && <span style={{ color: '#38bdf8', fontSize: 14 }}>{message}</span>}
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {STATUS_COLUMNS.map((statusKey) => {
          const columnItems = items.filter((i) => i.status === statusKey);
          return (
            <div key={statusKey} className="card">
              <h3 style={{ marginBottom: 14, color: '#38bdf8' }}>
                {statusKey.replace(/_/g, ' ')} ({columnItems.length})
              </h3>

              {columnItems.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    background: '#0b0f19',
                    padding: 14,
                    borderRadius: 10,
                    marginBottom: 12,
                    border: '1px solid #1e293b'
                  }}
                >
                  <strong>{entry.media?.title}</strong>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 10px' }}>
                    Progress: {entry.watchedEpisodes} / {entry.media?.totalEpisodes} Episodes
                  </p>

                  {statusKey !== 'COMPLETED' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-outline" onClick={() => handleLogEpisode(entry)}>
                        +1 Ep
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => handleCompleteTransactional(entry.mediaId, entry.media?.title)}
                      >
                        Complete (ACID Tx)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
