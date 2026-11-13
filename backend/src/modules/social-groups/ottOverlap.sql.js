const prisma = require('../../config/prisma');

// ARYAN DE VIVA SHOWCASE: Aggregates unnest(u."subscribedOTTs") across squad members
// Shows which OTT platforms the squad collectively has access to for watch parties
async function getSquadOttCoverageSql(groupId) {
  return prisma.$queryRaw`
    WITH squad_users AS (
      SELECT u.id, u.username, u."subscribedOTTs"
      FROM "GroupMember" gm
      INNER JOIN "User" u ON u.id = gm."userId"
      WHERE gm."groupId" = ${groupId}
    ),
    total_squad AS (
      SELECT COUNT(*)::int AS total_members FROM squad_users
    )
    SELECT 
      unnest(su."subscribedOTTs") AS platform_name,
      COUNT(DISTINCT su.id)::int AS subscribed_members,
      (SELECT total_members FROM total_squad) AS total_members,
      ARRAY_AGG(su.username) AS member_usernames
    FROM squad_users su
    GROUP BY platform_name
    ORDER BY subscribed_members DESC, platform_name ASC;
  `;
}

module.exports = { getSquadOttCoverageSql };

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
const { getSquadOttCoverageSql } = require('./ottOverlap.sql');

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
  handleGetGroupBlend,
  handleGetSquadOttCoverage,
  handleGetSquadLeaderboard,
  handleGetSquadCompatibility,
  handleMarkWatchedTogether
};
EOF

cat << 'EOF' > backend/src/modules/social-groups/groups.routes.js
const express = require('express');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const { requireGroupMember } = require('../../middlewares/groupAccess.middleware');
const {
  handleGetMyGroups,
  handleCreateGroup,
  handleJoinByCode,
  handleGetGroupFeed,
  handleGetGroupActivity,
  handleNominateToGroup,
  handleRecommendToFriend,
  handleLeaveGroup
} = require('./groups.controller');
const {
  handleVoteOnPoll,
  handleGetGroupBlend,
  handleGetSquadOttCoverage,
  handleGetSquadLeaderboard,
  handleGetSquadCompatibility,
  handleMarkWatchedTogether
} = require('./polls.controller');

const router = express.Router();

router.use(authenticateToken);

router.get('/my-groups', handleGetMyGroups);
router.post('/create', handleCreateGroup);
router.post('/join-by-code', handleJoinByCode);
router.get('/:id/feed', requireGroupMember, handleGetGroupFeed);
router.get('/:id/activity', requireGroupMember, handleGetGroupActivity);
router.get('/:id/compatibility', requireGroupMember, handleGetSquadCompatibility);
router.get('/:id/ott-coverage', requireGroupMember, handleGetSquadOttCoverage);
router.post('/:id/watchlist', requireGroupMember, handleNominateToGroup);
router.post('/:id/recommend-friend', requireGroupMember, handleRecommendToFriend);
router.get('/:id/blend-recs', requireGroupMember, handleGetGroupBlend);
router.post('/:id/polls/vote', requireGroupMember, handleVoteOnPoll);
router.get('/:id/leaderboard', requireGroupMember, handleGetSquadLeaderboard);
router.patch('/:id/mark-watched', requireGroupMember, handleMarkWatchedTogether);
router.delete('/:id/leave', requireGroupMember, handleLeaveGroup);

module.exports = router;
EOF

git add backend/src/modules/social-groups/ottOverlap.sql.js backend/src/modules/social-groups/polls.controller.js backend/src/modules/social-groups/groups.routes.js
git commit -m "feat(de-groups): add PostgreSQL unnest squad OTT subscription coverage query and route"