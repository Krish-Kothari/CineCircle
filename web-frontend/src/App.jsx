import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import axiosClient from './api/axiosClient';

export default function App() {
  const [user, setUser] = useState(null);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    fetchInitialCatalog();
  }, []);

  async function fetchInitialCatalog() {
    try {
      const res = await axiosClient.get('/catalog/search');
      setCatalog(res.data.data || []);
    } catch (err) {
      console.warn('Catalog load error:', err.message);
    }
  }

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
      alert('Run backend server and seed first!');
    }
  }

  function handleLogout() {
    localStorage.removeItem('cinecircle_token');
    setUser(null);
  }

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <main className="container">
        <div className="card" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>One-Click Viva Demo Switcher:</strong> Switch between team accounts to test SQL Recs & Group Blend
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline" onClick={() => quickDemoLogin('krish@nst.edu')}>Login as Krish</button>
            <button className="btn-outline" onClick={() => quickDemoLogin('harsh@nst.edu')}>Login as Harsh</button>
            <button className="btn-outline" onClick={() => quickDemoLogin('aryan@nst.edu')}>Login as Aryan</button>
          </div>
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h2>Multi-OTT Catalog Explorer ({catalog.length} Titles)</h2>
                <div className="grid-cards">
                  {catalog.map((item) => (
                    <div key={item.id} className="card">
                      <h3>{item.title} ({item.releaseYear})</h3>
                      <p style={{ color: '#94a3b8', fontSize: 13, margin: '6px 0' }}>
                        {item.type} • ★ {item.avgRating} • {(item.genres || []).join(', ')}
                      </p>
                      <p style={{ fontSize: 13 }}>{item.synopsis}</p>
                    </div>
                  ))}
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}