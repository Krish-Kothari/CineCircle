
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import axiosClient from './api/axiosClient';

// Catalog pages
import CatalogExplorerPage from './pages/catalog/CatalogExplorerPage';
import MediaDetailPage from './pages/catalog/MediaDetailPage';
import AdminCuratorPage from './pages/catalog/AdminCuratorPage';
import RecommendationHistoryPage from './pages/catalog/RecommendationHistoryPage';

// Tracker pages
import WatchlistPage from './pages/tracker/WatchlistPage';
import TasteAnalyticsPage from './pages/tracker/TasteAnalyticsPage';

// Social Groups pages
import SquadsHubPage from './pages/groups/SquadsHubPage';
import SquadRoomPage from './pages/groups/SquadRoomPage';

export default function App() {
  const [user, setUser] = useState(null);

  // Quick demo login for viva evaluation
  async function quickDemoLogin(email) {
    try {
      const res = await axiosClient.post('/tracker/auth/login', {
        emailOrUsername: email,
        password: 'password123'
      });

      const { user: loggedInUser, token } = res.data.data;

      localStorage.setItem('cinecircle_token', token);
      setUser(loggedInUser);
    } catch (err) {
      console.error('Demo login error:', err.message);
      alert('Make sure the backend server (npm run dev) and seed are running!');
    }
  }

  // Logout the current user
  function handleLogout() {
    localStorage.removeItem('cinecircle_token');
    setUser(null);
  }

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />

      <main className="container">

        {/* Viva Evaluation Account Switcher */}
        <div
          className="card"
          style={{
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div>
            <strong>Viva Evaluation Account Switcher:</strong>
            {' '}Switch accounts to test multi-user Poll Quorum and Group Blend.
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn-outline"
              onClick={() => quickDemoLogin('krish@nst.edu')}
            >
              Use Krish Account
            </button>

            <button
              className="btn-outline"
              onClick={() => quickDemoLogin('harsh@nst.edu')}
            >
              Use Harsh Account
            </button>

            <button
              className="btn-outline"
              onClick={() => quickDemoLogin('aryan@nst.edu')}
            >
              Use Aryan Account
            </button>
          </div>
        </div>

        {/* Application Routes */}
        <Routes>
          {/* Catalog */}
          <Route path="/" element={<CatalogExplorerPage />} />
          <Route path="/media/:id" element={<MediaDetailPage />} />
          <Route path="/curator" element={<AdminCuratorPage />} />
          <Route path="/rec-logs" element={<RecommendationHistoryPage />} />

          {/* Tracker */}
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/analytics" element={<TasteAnalyticsPage />} />

          {/* Social Groups */}
          <Route path="/squads" element={<SquadsHubPage />} />
          <Route path="/squads/:id" element={<SquadRoomPage />} />
        </Routes>

      </main>
    </div>
  );
}
