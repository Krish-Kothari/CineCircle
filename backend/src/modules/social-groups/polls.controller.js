const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const {
  castGroupPollVoteTransactional,
  markGroupItemWatchedTogether
} = require('./polls.transaction');
const { completeSquadWatchPartyTransactional } = require('./consensus.transaction');
const {
  getGroupBlendRecommendationsSql,
  getSquadLeaderboardSql
} = require('./blend.sql');
const { getSquadTasteCompatibilitySql } = require('./compatibility.sql');
const { getGroupEngagementMetricsSql } = require('./engagement.sql');
const { getSquadOttCoverageSql } = require('./ottOverlap.sql');
const { getSquadTasteDivergenceSql } = require('./divergence.sql');

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

const handleCompleteWatchParty = asyncHandler(async (req, res) => {
  const { groupItemId } = req.body;
  if (!groupItemId) {
    return sendError(res, 'groupItemId is required', 400);
  }

  const result = await completeSquadWatchPartyTransactional(req.params.id, groupItemId);
  return sendSuccess(
    res,
    result,
    `Watch Party Completed! Synced +${result.minutesAddedPerMember} mins across all ${result.syncedMemberCount} squad members.`
  );
});

const handleGetGroupBlend = asyncHandler(async (req, res) => {
  const [blend, ottCoverage, divergence] = await Promise.all([
    getGroupBlendRecommendationsSql(req.params.id),
    getSquadOttCoverageSql(req.params.id),
    getSquadTasteDivergenceSql(req.params.id)
  ]);
  return sendSuccess(
    res,
    blend,
    'Generated Group Blend recommendations for squad',
    200,
    { ottCoverage, divergence }
  );
});

const handleGetSquadDivergence = asyncHandler(async (req, res) => {
  const divergence = await getSquadTasteDivergenceSql(req.params.id);
  return sendSuccess(res, divergence, 'Calculated squad taste divergence and outlier archetypes');
});

const handleGetSquadOttCoverage = asyncHandler(async (req, res) => {
  const coverage = await getSquadOttCoverageSql(req.params.id);
  return sendSuccess(res, coverage, 'Fetched squad OTT subscription overlap');
});

const handleGetSquadLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await getSquadLeaderboardSql(req.params.id);
  return sendSuccess(res, leaderboard, 'Fetched squad watch-time leaderboard');
});

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
  handleCompleteWatchParty,
  handleGetGroupBlend,
  handleGetSquadDivergence,
  handleGetSquadOttCoverage,
  handleGetSquadLeaderboard,
  handleGetSquadCompatibility,
  handleMarkWatchedTogether
};
