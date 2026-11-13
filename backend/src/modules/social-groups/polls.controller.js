
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

const { getSquadTasteCompatibilitySql } = require('./compatibility.sql');
const { getGroupEngagementMetricsSql } = require('./engagement.sql');
const { getSquadOttCoverageSql } = require('./ottOverlap.sql');

// Cast a vote on a squad poll
const handleVoteOnPoll = asyncHandler(async (req, res) => {
  const { groupItemId } = req.body;

  if (!groupItemId) {
    return sendError(res, 'groupItemId is required to cast a poll vote', 400);
  }

  const result = await castGroupPollVoteTransactional(
    req.params.id,
    req.user.id,
    groupItemId
  );

  return sendSuccess(
    res,
    result,
    result.quorumReached
      ? "Majority quorum reached! Locked as Tonight's Pick!"
      : 'Vote recorded successfully'
  );
});

// Get Group Blend recommendations and OTT coverage
const handleGetGroupBlend = asyncHandler(async (req, res) => {
  const [blend, ottCoverage] = await Promise.all([
    getGroupBlendRecommendationsSql(req.params.id),
    getSquadOttCoverageSql(req.params.id)
  ]);

  return sendSuccess(
    res,
    blend,
    'Generated Group Blend recommendations for squad',
    200,
    { ottCoverage }
  );
});

// Get squad OTT subscription overlap
const handleGetSquadOttCoverage = asyncHandler(async (req, res) => {
  const coverage = await getSquadOttCoverageSql(req.params.id);

  return sendSuccess(
    res,
    coverage,
    'Fetched squad OTT subscription overlap'
  );
});

// Get squad watch-time leaderboard
const handleGetSquadLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await getSquadLeaderboardSql(req.params.id);

  return sendSuccess(
    res,
    leaderboard,
    'Fetched squad watch-time leaderboard'
  );
});

// Get pairwise compatibility and engagement metrics
const handleGetSquadCompatibility = asyncHandler(async (req, res) => {
  const [compatibility, engagement] = await Promise.all([
    getSquadTasteCompatibilitySql(req.params.id),
    getGroupEngagementMetricsSql(req.params.id)
  ]);

  return sendSuccess(
    res,
    { compatibility, engagement },
    'Calculated pairwise squad taste compatibility and engagement view'
  );
});

// Mark a title as watched together
const handleMarkWatchedTogether = asyncHandler(async (req, res) => {
  const { groupItemId } = req.body;

  if (!groupItemId) {
    return sendError(res, 'groupItemId is required', 400);
  }

  const updated = await markGroupItemWatchedTogether(
    req.params.id,
    groupItemId
  );

  return sendSuccess(
    res,
    updated,
    'Marked title as watched together by the squad'
  );
});

module.exports = {
  handleVoteOnPoll,
  handleGetGroupBlend,
  handleGetSquadOttCoverage,
  handleGetSquadLeaderboard,
  handleGetSquadCompatibility,
  handleMarkWatchedTogether
};
