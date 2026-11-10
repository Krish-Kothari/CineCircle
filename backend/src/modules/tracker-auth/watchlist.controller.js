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
const { getWeeklyWatchVelocitySql } = require('./streak.sql');
const { exportUserWatchlistData } = require('./export.service');
const { getContinueWatchingSql } = require('./binge.sql');
const { getUserMilestonesSql } = require('./milestone.sql');
const { getBingePacingEstimatesSql } = require('./pacing.sql');
const { getStalledWatchlistAlertsSql } = require('./churn.sql');
const { getMonthlyWrappedSql } = require('./wrapped.sql');
const { getWatchlistDeadlineFeasibilitySql } = require('./priority.sql');

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

const handleGetContinueWatching = asyncHandler(async (req, res) => {
  const queue = await getContinueWatchingSql(req.user.id);
  return sendSuccess(res, queue, 'Fetched Continue Watching queue with remaining minutes');
});

const handleGetBingePacing = asyncHandler(async (req, res) => {
  const pacing = await getBingePacingEstimatesSql(req.user.id);
  return sendSuccess(res, pacing, 'Calculated show completion pacing and target finish dates');
});

const handleGetStalledAlerts = asyncHandler(async (req, res) => {
  const alerts = await getStalledWatchlistAlertsSql(req.user.id);
  return sendSuccess(res, alerts, 'Fetched stalled binge and dormant watchlist risk alerts');
});

const handleGetDeadlineFeasibility = asyncHandler(async (req, res) => {
  const feasibility = await getWatchlistDeadlineFeasibilitySql(req.user.id);
  return sendSuccess(res, feasibility, 'Calculated required daily minutes and target deadline feasibility');
});

const handleGetMonthlyWrapped = asyncHandler(async (req, res) => {
  const wrapped = await getMonthlyWrappedSql(req.user.id);
  return sendSuccess(res, wrapped, 'Calculated 30-day monthly rewind and binge habits');
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
  const [stats, summaryView, weeklyVelocity, continueWatching, milestones, pacing, stalled, wrapped, feasibility] = await Promise.all([
    getUserWatchAnalyticsSql(req.user.id),
    getUserWatchSummaryFromSql(req.user.id),
    getWeeklyWatchVelocitySql(req.user.id),
    getContinueWatchingSql(req.user.id),
    getUserMilestonesSql(req.user.id),
    getBingePacingEstimatesSql(req.user.id),
    getStalledWatchlistAlertsSql(req.user.id),
    getMonthlyWrappedSql(req.user.id),
    getWatchlistDeadlineFeasibilitySql(req.user.id)
  ]);
  return sendSuccess(
    res,
    { ...stats, summaryView, weeklyVelocity, continueWatching, milestones, pacing, stalled, wrapped, feasibility },
    'Fetched comprehensive SQL watch-time, pacing feasibility, and habit analytics'
  );
});

const handleExportWatchlist = asyncHandler(async (req, res) => {
  const format = req.query.format || 'json';
  const exported = await exportUserWatchlistData(req.user.id, format);
  return sendSuccess(res, exported, `Exported watchlist in ${format.toUpperCase()} format`);
});

const handleRemoveFromWatchlist = asyncHandler(async (req, res) => {
  await removeWatchlistItem(req.user.id, req.params.mediaId);
  return sendSuccess(res, { mediaId: req.params.mediaId }, 'Removed title from watchlist');
});

module.exports = {
  handleUpsertWatchlist,
  handleGetMyWatchlist,
  handleGetContinueWatching,
  handleGetBingePacing,
  handleGetStalledAlerts,
  handleGetDeadlineFeasibility,
  handleGetMonthlyWrapped,
  handleLogEpisode,
  handleCompleteMedia,
  handleGetWatchStats,
  handleExportWatchlist,
  handleRemoveFromWatchlist
};
