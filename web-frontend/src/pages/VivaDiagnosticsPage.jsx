import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function VivaDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axiosClient.get('/tracker/diagnostics')
      .then((response) => setDiagnostics(response.data.data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Database diagnostics unavailable.'));
  }, []);

  return (
    <section className="card">
      <h2>Database diagnostics</h2>
      {error && <p>{error}</p>}
      {diagnostics && <pre>{JSON.stringify(diagnostics, null, 2)}</pre>}
      {!diagnostics && !error && <p>Checking database...</p>}
    </section>
  );
}
