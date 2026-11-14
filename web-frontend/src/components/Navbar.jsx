import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user }) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <Link to="/" className="brand-logo">CineCircle</Link>
        <span className="brand-badge">v1.0.0</span>
      </div>

      <nav className="nav-links">
        <Link to="/">Catalog</Link>
        <Link to="/marathons">Marathons</Link>
        <Link to="/compare-recs">Algo Compare</Link>
        <Link to="/curator">Curator</Link>
        <Link to="/watchlist">Watchlist</Link>
        <Link to="/analytics">SQL Stats</Link>
        <Link to="/squads">Squad Blend</Link>
        <Link to="/viva-diagnostics" style={{ color: '#22c55e' }}>DB Diagnostics</Link>
      </nav>

      <div className="nav-user">
        {user ? (
          <span className="brand-badge">@{user.username}</span>
        ) : (
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Select Demo Account</span>
        )}
      </div>
    </header>
  );
}
