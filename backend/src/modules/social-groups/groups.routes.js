
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
  handleGetSquadLeaderboard,
  handleGetSquadCompatibility,
  handleMarkWatchedTogether
} = require('./polls.controller');

const router = express.Router();

// Authenticate every request to the Social Groups module
router.use(authenticateToken);

// User's friend squads
router.get('/my-groups', handleGetMyGroups);

// Social Groups: Creation, joining and membership
router.post('/create', handleCreateGroup);
router.post('/join-by-code', handleJoinByCode);
router.delete('/:id/leave', requireGroupMember, handleLeaveGroup);

// Group Feed and Activity
router.get('/:id/feed', requireGroupMember, handleGetGroupFeed);
router.get('/:id/activity', requireGroupMember, handleGetGroupActivity);

// Squad Compatibility
router.get('/:id/compatibility', requireGroupMember, handleGetSquadCompatibility);

// Shared Watchlist
router.post('/:id/watchlist', requireGroupMember, handleNominateToGroup);

// Friend-to-friend recommendations
router.post('/:id/recommend-friend', requireGroupMember, handleRecommendToFriend);

// Group Blend, Polls and Leaderboard
router.get('/:id/blend-recs', requireGroupMember, handleGetGroupBlend);
router.post('/:id/polls/vote', requireGroupMember, handleVoteOnPoll);
router.get('/:id/leaderboard', requireGroupMember, handleGetSquadLeaderboard);
router.patch('/:id/mark-watched', requireGroupMember, handleMarkWatchedTogether);

module.exports = router;
