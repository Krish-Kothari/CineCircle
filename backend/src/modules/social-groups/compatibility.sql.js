const prisma = require('../../config/prisma');

async function getSquadTasteCompatibilitySql(groupId) {
  return prisma.$queryRaw`
    WITH squad_users AS (
      SELECT u.id, u.username
      FROM "GroupMember" gm
      INNER JOIN "User" u ON u.id = gm."userId"
      WHERE gm."groupId" = ${groupId}
    )
    SELECT 
      u1.username AS member_a,
      u2.username AS member_b,
      COUNT(p1.genre)::int AS shared_genres,
      ROUND(
        AVG(100 - (ABS(p1."weightScore" - p2."weightScore") * 10))::numeric,
        1
      )::float AS compatibility_pct
    FROM squad_users u1
    INNER JOIN squad_users u2 ON u1.id < u2.id
    INNER JOIN "UserGenrePreference" p1 ON p1."userId" = u1.id
    INNER JOIN "UserGenrePreference" p2 ON p2."userId" = u2.id AND p1.genre = p2.genre
    GROUP BY u1.username, u2.username
    ORDER BY compatibility_pct DESC;
  `;
}

module.exports = { getSquadTasteCompatibilitySql };
EOF

cat << 'EOF' > backend/src/modules/social-groups/polls.controller.js
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
  handleGetGroupBlend,
  handleGetSquadLeaderboard,
  handleGetSquadCompatibility,
  handleMarkWatchedTogether
};