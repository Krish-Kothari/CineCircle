const express = require('express');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const { createRateLimiter } = require('../../middlewares/rateLimiter');
const {
  register,
  login,
  getMyProfile,
  handleUpdateProfile,
  updatePreferences
} = require('./auth.controller');
const {
  handleUpsertWatchlist,
  handleGetMyWatchlist,
  handleGetContinueWatching,
  handleGetBingePacing,
  handleGetStalledAlerts,
  handleGetMonthlyWrapped,
  handleLogEpisode,
  handleCompleteMedia,
  handleGetWatchStats,
  handleExportWatchlist,
  handleRemoveFromWatchlist
} = require('./watchlist.controller');

const router = express.Router();
const authLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 20 });

router.post('/auth/register', authLimiter, register);
router.post('/auth/login', authLimiter, login);
router.get('/users/profile', authenticateToken, getMyProfile);
router.patch('/users/profile', authenticateToken, handleUpdateProfile);
router.put('/preferences/genres', authenticateToken, updatePreferences);
router.post('/watchlist/upsert', authenticateToken, handleUpsertWatchlist);
router.get('/watchlist/my-list', authenticateToken, handleGetMyWatchlist);
router.get('/watchlist/continue-watching', authenticateToken, handleGetContinueWatching);
router.get('/watchlist/pacing', authenticateToken, handleGetBingePacing);
router.get('/watchlist/stalled-alerts', authenticateToken, handleGetStalledAlerts);
router.get('/watchlist/wrapped', authenticateToken, handleGetMonthlyWrapped);
router.get('/watchlist/export', authenticateToken, handleExportWatchlist);
router.post('/watchlist/log-episode', authenticateToken, handleLogEpisode);
router.post('/watchlist/complete-media', authenticateToken, handleCompleteMedia);
router.get('/watchlist/stats', authenticateToken, handleGetWatchStats);
router.delete('/watchlist/:mediaId', authenticateToken, handleRemoveFromWatchlist);

module.exports = router;
