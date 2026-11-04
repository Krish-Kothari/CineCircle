const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const { validateWatchlistUpsert } = require('./tracker.validators');
const {
  upsertWatchlistItem,
  getUserWatchlist,
  logEpisodeWatched,
  removeWatchlistItem
} = require('./watchlist.service');
const { markMediaCompletedTransactional } = require('./tracker.transaction');
const { getUserWatchAnalyticsSql } = require('./analytics.sql');
const { getUserWatchSummaryFromSql } = require('./views.sql');

const handleUpsertWatchlist = asyncHandler(async (req, res) => {
  const validationError = validateWatchlistUpsert(req.body);
  if (validationError) {
    return sendError(res, validationError, 400);
  }

  const entry = await upsertWatchlistItem(req.user.id, req.body);
  return sendSuccess(res, entry, 'Watchlist updated successfully');
});

const handleGetMyWatchlist = asyncHandler(async (req, res) => {
  const list = await getUserWatchlist(req.user.id, req.query.status);
  return sendSuccess(res, list, 'Fetched user watchlist');
});

const handleLogEpisode = asyncHandler(async (req, res) => {
  const result = await logEpisodeWatched(req.user.id, req.body);
  return sendSuccess(res, result, 'Episode progress logged', 201);
});

const handleCompleteMedia = asyncHandler(async (req, res) => {
  const { mediaId } = req.body;
  if (!mediaId) {
    return sendError(res, 'mediaId is required', 400);
  }

  const result = await markMediaCompletedTransactional(req.user.id, mediaId);
  return sendSuccess(res, result, 'Media marked completed and watch time synced');
});

const handleGetWatchStats = asyncHandler(async (req, res) => {
  const [stats, summaryView] = await Promise.all([
    getUserWatchAnalyticsSql(req.user.id),
    getUserWatchSummaryFromSql(req.user.id)
  ]);
  return sendSuccess(res, { ...stats, summaryView }, 'Fetched SQL watch-time and genre analytics');
});

const handleRemoveFromWatchlist = asyncHandler(async (req, res) => {
  await removeWatchlistItem(req.user.id, req.params.mediaId);
  return sendSuccess(res, { mediaId: req.params.mediaId }, 'Removed title from watchlist');
});

module.exports = {
  handleUpsertWatchlist,
  handleGetMyWatchlist,
  handleLogEpisode,
  handleCompleteMedia,
  handleGetWatchStats,
  handleRemoveFromWatchlist
};
