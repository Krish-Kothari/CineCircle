import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import axiosClient from './api/axiosClient';
import CatalogExplorerPage from './pages/catalog/CatalogExplorerPage';
import MediaDetailPage from './pages/catalog/MediaDetailPage';
import AdminCuratorPage from './pages/catalog/AdminCuratorPage';
import RecommendationHistoryPage from './pages/catalog/RecommendationHistoryPage';
import RecsComparisonPage from './pages/catalog/RecsComparisonPage';
import FranchiseMarathonPage from './pages/catalog/FranchiseMarathonPage';
import WatchlistPage from './pages/tracker/WatchlistPage';
import TasteAnalyticsPage from './pages/tracker/TasteAnalyticsPage';
import SquadsHubPage from './pages/groups/SquadsHubPage';
import SquadRoomPage from './pages/groups/SquadRoomPage';
import VivaDiagnosticsPage from './pages/VivaDiagnosticsPage';

export default function App() {
  const [user, setUser] = useState(null);

  async function quickDemoLogin(email) {
    try {
      const res = await axiosClient.post('/tracker/auth/login', {
        emailOrUsername: email,
        password: 'password123'
      });
      const { user: loggedInUser, token } = res.data.data;
      localStorage.setItem('cinecircle_token', token);
      setUser(loggedInUser);
      window.location.reload();
    } catch {
      alert('Make sure backend server (npm run dev) and seed are running!');
    }
  }

  return (
    <div>
      <Navbar user={user} />
      <main className="container">
        <div
          className="card"
          style={{
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <strong>Viva Evaluation Account Switcher:</strong> Switch accounts to test multi-user Poll Quorum & Group Blend
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline" onClick={() => quickDemoLogin('krish@nst.edu')}>
              Use Krish Account
            </button>
            <button className="btn-outline" onClick={() => quickDemoLogin('harsh@nst.edu')}>
              Use Harsh Account
            </button>
            <button className="btn-outline" onClick={() => quickDemoLogin('aryan@nst.edu')}>
              Use Aryan Account
            </button>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<CatalogExplorerPage />} />
          <Route path="/media/:id" element={<MediaDetailPage />} />
          <Route path="/marathons" element={<FranchiseMarathonPage />} />
          <Route path="/curator" element={<AdminCuratorPage />} />
          <Route path="/rec-logs" element={<RecommendationHistoryPage />} />
          <Route path="/compare-recs" element={<RecsComparisonPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/analytics" element={<TasteAnalyticsPage />} />
          <Route path="/squads" element={<SquadsHubPage />} />
          <Route path="/squads/:id" element={<SquadRoomPage />} />
          <Route path="/viva-diagnostics" element={<VivaDiagnosticsPage />} />
        </Routes>
      </main>
    </div>
  );
}
