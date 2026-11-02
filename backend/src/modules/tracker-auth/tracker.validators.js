const VALID_WATCH_STATUSES = ['PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'DROPPED'];

function validateRegisterInput({ name, username, email, password }) {
  if (!name || !username || !email || !password) {
    return 'name, username, email, and password are all required';
  }
  if (typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  if (!email.includes('@')) {
    return 'Please provide a valid email address';
  }
  return null;
}

function validateGenrePreferences(preferences) {
  if (!Array.isArray(preferences) || preferences.length === 0) {
    return 'preferences must be a non-empty array of { genre, weightScore }';
  }
  for (const pref of preferences) {
    const score = Number(pref.weightScore);
    if (!pref.genre || !Number.isInteger(score) || score < 1 || score > 10) {
      return 'Each genre preference requires a genre name and integer weightScore between 1 and 10';
    }
  }
  return null;
}

function validateWatchlistUpsert({ mediaId, status }) {
  if (!mediaId) {
    return 'mediaId is required';
  }
  if (status && !VALID_WATCH_STATUSES.includes(status)) {
    return `status must be one of: ${VALID_WATCH_STATUSES.join(', ')}`;
  }
  return null;
}

module.exports = {
  VALID_WATCH_STATUSES,
  validateRegisterInput,
  validateGenrePreferences,
  validateWatchlistUpsert
};
