const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const {
  castGroupPollVoteTransactional,
  markGroupItemWatchedTogether
} = require('./polls.transaction');
const {
  getGroupBlendRecommendationsSql,
  getSquadLeaderboardSql
} = require('./blend.sql');

const handleVoteOnPoll = asyncHandler(async (req, res) => {
  const { groupItemId } = req.body;
  if (!groupItemId) {
    return sendError(res, 'groupItemId is required to cast a poll vote', 400);
  }

  const result = await castGroupPollVoteTransactional(req.params.id, req.user.id, groupItemId);
  return sendSuccess(
    res,
    result,
    result.quorumReached
      ? "Majority quorum reached! Locked as Tonight's Pick!"
      : 'Vote recorded successfully'
  );
});

const handleGetGroupBlend = asyncHandler(async (req, res) => {
  const blend = await getGroupBlendRecommendationsSql(req.params.id);
  return sendSuccess(res, blend, 'Generated Group Blend recommendations for squad');
});

const handleGetSquadLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await getSquadLeaderboardSql(req.params.id);
  return sendSuccess(res, leaderboard, 'Fetched squad watch-time leaderboard');
});

const handleMarkWatchedTogether = asyncHandler(async (req, res) => {
  const { groupItemId } = req.body;
  if (!groupItemId) {
    return sendError(res, 'groupItemId is required', 400);
  }

  const updated = await markGroupItemWatchedTogether(req.params.id, groupItemId);
  return sendSuccess(res, updated, 'Marked title as watched together by the squad');
});

module.exports = {
  handleVoteOnPoll,
  handleGetGroupBlend,
  handleGetSquadLeaderboard,
  handleMarkWatchedTogether
};