const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const {
  validateCreateGroupInput,
  validateJoinByCodeInput,
  validateNominateMediaInput
} = require('./groups.validators');
const {
  createFriendGroup,
  joinGroupByInviteCode,
  leaveFriendGroup
} = require('./groups.service');
const {
  getGroupFeedById,
  nominateMediaToGroup
} = require('./watchlist.group.service');
const {
  getSquadActivityStreamSql,
  getUserJoinedGroups
} = require('./activity.sql');
const { recommendTitleToSquadFriend } = require('./recommend.friend.service');
const { transferSquadAdminRoleTransactional } = require('./admin.transaction');

const handleGetMyGroups = asyncHandler(async (req, res) => {
  const groups = await getUserJoinedGroups(req.user.id);
  return sendSuccess(res, groups, 'Fetched user friend squads');
});

const handleCreateGroup = asyncHandler(async (req, res) => {
  const validationError = validateCreateGroupInput(req.body);
  if (validationError) {
    return sendError(res, validationError, 400);
  }

  const group = await createFriendGroup(req.user.id, req.body);
  return sendSuccess(res, group, 'Friend squad created successfully', 201);
});

const handleJoinByCode = asyncHandler(async (req, res) => {
  const validationError = validateJoinByCodeInput(req.body);
  if (validationError) {
    return sendError(res, validationError, 400);
  }

  const group = await joinGroupByInviteCode(req.user.id, req.body.inviteCode);
  return sendSuccess(res, group, `Joined squad: ${group.name}`);
});

const handleGetGroupFeed = asyncHandler(async (req, res) => {
  const group = await getGroupFeedById(req.params.id);
  return sendSuccess(res, group, 'Fetched friend squad feed');
});

const handleGetGroupActivity = asyncHandler(async (req, res) => {
  const activity = await getSquadActivityStreamSql(req.params.id);
  return sendSuccess(res, activity, 'Fetched squad live activity stream');
});

const handleNominateToGroup = asyncHandler(async (req, res) => {
  const validationError = validateNominateMediaInput(req.body);
  if (validationError) {
    return sendError(res, validationError, 400);
  }

  const nominated = await nominateMediaToGroup(req.params.id, req.user.id, req.body);
  return sendSuccess(res, nominated, 'Title nominated to squad watchlist', 201);
});

const handleRecommendToFriend = asyncHandler(async (req, res) => {
  if (!req.body.mediaId) {
    return sendError(res, 'mediaId is required', 400);
  }

  const rec = await recommendTitleToSquadFriend(req.params.id, req.user.id, req.body);
  return sendSuccess(res, rec, 'Sent recommendation to friend squad', 201);
});

const handleTransferAdmin = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  if (!targetUserId) {
    return sendError(res, 'targetUserId is required to transfer admin role', 400);
  }

  const result = await transferSquadAdminRoleTransactional(req.params.id, req.user.id, targetUserId);
  return sendSuccess(res, result, `Squad admin leadership transferred to @${result.newAdmin}`);
});

const handleLeaveGroup = asyncHandler(async (req, res) => {
  const result = await leaveFriendGroup(req.user.id, req.params.id);
  return sendSuccess(res, result, 'Left friend squad successfully');
});

module.exports = {
  handleGetMyGroups,
  handleCreateGroup,
  handleJoinByCode,
  handleGetGroupFeed,
  handleGetGroupActivity,
  handleNominateToGroup,
  handleRecommendToFriend,
  handleTransferAdmin,
  handleLeaveGroup
};
