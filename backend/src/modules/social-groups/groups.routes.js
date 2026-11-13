
const express = require('express');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const { requireGroupMember } = require('../../middlewares/groupAccess.middleware');

const {
  handleCreateGroup,
  handleJoinByCode,
  handleGetGroupFeed,
  handleNominateToGroup,
  handleLeaveGroup
} = require('./groups.controller');

const {
  handleVoteOnPoll,
  handleGetGroupBlend,
  handleGetSquadLeaderboard,
  handleMarkWatchedTogether
} = require('./polls.controller');

const router = express.Router();

router.use(authenticateToken);

// Social Groups: Creation, joining and membership
router.post('/create', handleCreateGroup);
router.post('/join-by-code', handleJoinByCode);
router.delete('/:id/leave', requireGroupMember, handleLeaveGroup);

// Group Feed and Shared Watchlist
router.get('/:id/feed', requireGroupMember, handleGetGroupFeed);
router.post('/:id/watchlist', requireGroupMember, handleNominateToGroup);

// Group Blend, Polls and Leaderboard
router.get('/:id/blend-recs', requireGroupMember, handleGetGroupBlend);
router.post('/:id/polls/vote', requireGroupMember, handleVoteOnPoll);
router.get('/:id/leaderboard', requireGroupMember, handleGetSquadLeaderboard);
router.patch('/:id/mark-watched', requireGroupMember, handleMarkWatchedTogether);

module.exports = router;
