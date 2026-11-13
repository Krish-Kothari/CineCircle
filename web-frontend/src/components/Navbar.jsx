import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user }) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <Link to="/" className="brand-logo">CineCircle</Link>
        <span className="brand-badge">ASD + DE Full-Stack Portal</span>
      </div>

      <nav className="nav-links">
        <Link to="/">Catalog & Recs (Harsh)</Link>
        <Link to="/watchlist">Watchlist (Krish)</Link>
        <Link to="/analytics">SQL Stats (Krish)</Link>
        <Link to="/squads">Squad Blend (Aryan)</Link>
      </nav>

      <div className="nav-user">
        {user ? (
          <span className="brand-badge">Signed in: @{user.username}</span>
        ) : (
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Select Demo Account Below</span>
        )}
      </div>
    </header>
  );
}

