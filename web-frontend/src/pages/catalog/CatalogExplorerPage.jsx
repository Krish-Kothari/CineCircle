import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function CatalogExplorerPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function loadCatalog() {
    try {
      const response = await axiosClient.get('/catalog/search', { params: { search } });
      setItems(response.data.data || []);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load catalog.');
    }
  }

  useEffect(() => { loadCatalog(); }, []);

  return (
    <section>
      <div className="card">
        <h2>Discover movies and shows</h2>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search titles" />
          <button className="btn-primary" onClick={loadCatalog}>Search</button>
        </div>
      </div>
      {error && <p>{error}</p>}
      <div className="grid-cards">
        {items.map((item) => (
          <article className="card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.type} {item.avgRating ? `- ${item.avgRating}/10` : ''}</p>
            <Link className="btn-outline" to={`/media/${item.id}`}>Details</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
