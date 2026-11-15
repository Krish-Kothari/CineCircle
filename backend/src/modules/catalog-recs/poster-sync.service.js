const prisma = require('../../config/prisma');

const OMDB_API_BASE = process.env.OMDB_API_BASE || 'https://www.omdbapi.com/';

function isPlaceholderPoster(posterUrl) {
  if (!posterUrl || posterUrl === 'N/A') return true;
  return /placeholder|placehold\.co|via\.placeholder/i.test(posterUrl);
}

function getOmdbKey() {
  const key = process.env.OMDB_API_KEY;
  if (!key) {
    const error = new Error('OMDB_API_KEY is not configured');
    error.statusCode = 503;
    throw error;
  }
  return key;
}

async function fetchOmdbPoster(title) {
  const params = new URLSearchParams({
    t: title,
    apikey: getOmdbKey()
  });
  const response = await fetch(`${OMDB_API_BASE}?${params}`);
  if (!response.ok) {
    throw new Error(`OMDb poster request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (payload.Response !== 'True' || isPlaceholderPoster(payload.Poster)) {
    return null;
  }
  return payload.Poster;
}

async function syncPosterForMediaItem(item) {
  if (!isPlaceholderPoster(item.posterUrl)) {
    return { updated: false, posterUrl: item.posterUrl };
  }

  const posterUrl = await fetchOmdbPoster(item.title);
  if (!posterUrl) return { updated: false, posterUrl: null };

  await prisma.mediaItem.update({
    where: { id: item.id },
    data: { posterUrl }
  });
  return { updated: true, posterUrl };
}

async function syncMissingPosters(items) {
  const results = [];
  for (const item of items) {
    if (!isPlaceholderPoster(item.posterUrl)) continue;
    try {
      results.push({ item, ...(await syncPosterForMediaItem(item)) });
    } catch (error) {
      console.warn(`OMDb poster sync failed for "${item.title}": ${error.message}`);
    }
  }
  return results;
}

module.exports = {
  isPlaceholderPoster,
  fetchOmdbPoster,
  syncPosterForMediaItem,
  syncMissingPosters
};
