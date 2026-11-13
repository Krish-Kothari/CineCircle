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
  handleTransferAdmin,
  handleLeaveGroup
} = require('./groups.controller');
const {
  handleVoteOnPoll,
  handleCompleteWatchParty,
  handleGetGroupBlend,
  handleGetSquadDivergence,
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
router.get('/:id/divergence', requireGroupMember, handleGetSquadDivergence);
router.get('/:id/ott-coverage', requireGroupMember, handleGetSquadOttCoverage);
router.post('/:id/watchlist', requireGroupMember, handleNominateToGroup);
router.post('/:id/recommend-friend', requireGroupMember, handleRecommendToFriend);
router.patch('/:id/transfer-admin', requireGroupMember, handleTransferAdmin);
router.get('/:id/blend-recs', requireGroupMember, handleGetGroupBlend);
router.post('/:id/polls/vote', requireGroupMember, handleVoteOnPoll);
router.post('/:id/polls/complete-party', requireGroupMember, handleCompleteWatchParty);
router.get('/:id/leaderboard', requireGroupMember, handleGetSquadLeaderboard);
router.patch('/:id/mark-watched', requireGroupMember, handleMarkWatchedTogether);
router.delete('/:id/leave', requireGroupMember, handleLeaveGroup);

module.exports = router;


