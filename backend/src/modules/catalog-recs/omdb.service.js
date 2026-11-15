const OMDB_API_BASE = process.env.OMDB_API_BASE || 'https://www.omdbapi.com/';

function getOmdbKey() {
  const key = process.env.OMDB_API_KEY;
  if (!key) {
    const error = new Error('OMDB_API_KEY is not configured');
    error.statusCode = 503;
    throw error;
  }
  return key;
}

function normalizeSearchResult(item) {
  return {
    imdbId: item.imdbID,
    title: item.Title,
    year: item.Year,
    type: item.Type,
    posterUrl: item.Poster && item.Poster !== 'N/A' ? item.Poster : null
  };
}

async function searchOmdb(query, page = 1, type) {
  const params = new URLSearchParams({
    apikey: getOmdbKey(),
    s: query,
    page: String(Math.min(Math.max(Number(page) || 1, 1), 100))
  });
  if (type) params.set('type', type);

  const response = await fetch(`${OMDB_API_BASE}?${params}`);
  if (!response.ok) {
    const error = new Error(`OMDb request failed with status ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  const payload = await response.json();
  if (payload.Response !== 'True') {
    return { items: [], totalResults: 0, message: payload.Error || 'No results found' };
  }

  return {
    items: payload.Search.map(normalizeSearchResult),
    totalResults: Number(payload.totalResults) || payload.Search.length
  };
}

async function getOmdbTitle(imdbId) {
  const params = new URLSearchParams({ apikey: getOmdbKey(), i: imdbId, plot: 'full' });
  const response = await fetch(`${OMDB_API_BASE}?${params}`);
  if (!response.ok) {
    const error = new Error(`OMDb request failed with status ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  const payload = await response.json();
  if (payload.Response !== 'True') {
    const error = new Error(payload.Error || 'Title not found');
    error.statusCode = 404;
    throw error;
  }
  return payload;
}

module.exports = { searchOmdb, getOmdbTitle };
