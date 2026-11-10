import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import StalledBingeAlerts from '../../components/StalledBingeAlerts';
import WatchlistDeadlineTracker from '../../components/WatchlistDeadlineTracker';

const STATUS_COLUMNS = ['WATCHING', 'PLAN_TO_WATCH', 'COMPLETED', 'DROPPED'];

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [continueQueue, setContinueQueue] = useState([]);
  const [exportPreview, setExportPreview] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadWatchlist();
  }, []);

  async function loadWatchlist() {
    try {
      const [listRes, cwRes] = await Promise.all([
        axiosClient.get('/tracker/watchlist/my-list'),
        axiosClient.get('/tracker/watchlist/continue-watching')
      ]);
      setItems(listRes.data.data || []);
      setContinueQueue(cwRes.data.data || []);
    } catch {
      setMessage('Please sign in using the Demo Switcher above to view your Watchlist.');
    }
  }

  async function handleLogEpisode(mediaId, watchedEpisodes, title) {
    try {
      const nextEpisode = (watchedEpisodes || 0) + 1;
      await axiosClient.post('/tracker/watchlist/log-episode', {
        mediaId,
        seasonNumber: 1,
        episodeNumber: nextEpisode
      });
      setMessage(`Logged Episode ${nextEpisode} for "${title}"`);
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

  async function handleExport(format) {
    try {
      const res = await axiosClient.get(`/tracker/watchlist/export?format=${format}`);
      if (format === 'csv') {
        setExportPreview(res.data.data.content);
      } else {
        setExportPreview(JSON.stringify(res.data.data.items, null, 2));
      }
      setMessage(`Generated ${format.toUpperCase()} export (${res.data.data.count} rows)`);
    } catch {
      setMessage('Failed to export watchlist');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Personal Watchlist Kanban & Episode Tracker</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" onClick={() => handleExport('csv')}>Export CSV</button>
          <button className="btn-outline" onClick={() => handleExport('json')}>Export JSON</button>
        </div>
      </div>

      {message && <p style={{ color: '#22c55e', marginBottom: 14 }}>{message}</p>}

      <WatchlistDeadlineTracker />
      <StalledBingeAlerts onStatusUpdated={loadWatchlist} />

      {exportPreview && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong>Watchlist Data Export Preview</strong>
            <button className="btn-outline" onClick={() => setExportPreview('')}>Close</button>
          </div>
          <pre style={{ fontSize: 12, color: '#38bdf8', overflowX: 'auto' }}>{exportPreview}</pre>
        </div>
      )}

      {continueQueue.length > 0 && (
        <div className="card" style={{ marginBottom: 24, borderColor: '#38bdf8' }}>
          <h3 style={{ color: '#38bdf8', marginBottom: 12 }}>
            Continue Watching Queue (PostgreSQL Completion % & Remaining Time)
          </h3>
          <div className="grid-cards">
            {continueQueue.map((cw) => (
              <div key={cw.watchlist_id} style={{ background: '#0b0f19', padding: 14, borderRadius: 10 }}>
                <strong>{cw.title}</strong>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0' }}>
                  Ep {cw.watchedEpisodes}/{cw.totalEpisodes} ({cw.completion_pct}%) • {cw.remaining_minutes} mins left
                </p>
                <button
                  className="btn-primary"
                  style={{ marginTop: 6 }}
                  onClick={() => handleLogEpisode(cw.media_id, cw.watchedEpisodes, cw.title)}
                >
                  Log Ep {cw.watchedEpisodes + 1} (+1)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {STATUS_COLUMNS.map((statusKey) => {
          const columnItems = items.filter((i) => i.status === statusKey);
          return (
            <div key={statusKey} className="card">
              <h3 style={{ marginBottom: 14, color: '#38bdf8', fontSize: 15 }}>
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

                  {statusKey === 'WATCHING' && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        className="btn-outline"
                        style={{ fontSize: 11 }}
                        onClick={() => handleLogEpisode(entry.mediaId, entry.watchedEpisodes, entry.media?.title)}
                      >
                        +1 Ep
                      </button>
                      <button
                        className="btn-primary"
                        style={{ fontSize: 11 }}
                        onClick={() => handleCompleteTransactional(entry.mediaId, entry.media?.title)}
                      >
                        Complete
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
