const express = require('express');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const { createRateLimiter } = require('../../middlewares/rateLimiter');
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
  handleGetWatchStats,
  handleRemoveFromWatchlist
} = require('./watchlist.controller');

const router = express.Router();
const authLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 20 });

router.post('/auth/register', authLimiter, register);
router.post('/auth/login', authLimiter, login);
router.get('/users/profile', authenticateToken, getMyProfile);
router.put('/preferences/genres', authenticateToken, updatePreferences);
router.post('/watchlist/upsert', authenticateToken, handleUpsertWatchlist);
router.get('/watchlist/my-list', authenticateToken, handleGetMyWatchlist);
router.post('/watchlist/log-episode', authenticateToken, handleLogEpisode);
router.post('/watchlist/complete-media', authenticateToken, handleCompleteMedia);
router.get('/watchlist/stats', authenticateToken, handleGetWatchStats);
router.delete('/watchlist/:mediaId', authenticateToken, handleRemoveFromWatchlist);

module.exports = router;
