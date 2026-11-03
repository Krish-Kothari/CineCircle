const express = require('express');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const {
  register,
  login,
  getMyProfile,
  updatePreferences
} = require('./auth.controller');
const {
  handleUpsertWatchlist,
  handleGetMyWatchlist,
  handleLogEpisode,
  handleCompleteMedia,
  handleGetWatchStats
} = require('./watchlist.controller');

const router = express.Router();

// Krish's 8 ASD + DE Endpoints
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/users/profile', authenticateToken, getMyProfile);
router.put('/preferences/genres', authenticateToken, updatePreferences);
router.post('/watchlist/upsert', authenticateToken, handleUpsertWatchlist);
router.get('/watchlist/my-list', authenticateToken, handleGetMyWatchlist);
router.post('/watchlist/log-episode', authenticateToken, handleLogEpisode);
router.post('/watchlist/complete-media', authenticateToken, handleCompleteMedia);
router.get('/watchlist/stats', authenticateToken, handleGetWatchStats);

module.exports = router;
