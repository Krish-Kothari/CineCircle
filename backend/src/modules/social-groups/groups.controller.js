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

const handleNominateToGroup = asyncHandler(async (req, res) => {
  const validationError = validateNominateMediaInput(req.body);
  if (validationError) {
    return sendError(res, validationError, 400);
  }

  const nominated = await nominateMediaToGroup(req.params.id, req.user.id, req.body);
  return sendSuccess(res, nominated, 'Title nominated to squad watchlist', 201);
});

const handleLeaveGroup = asyncHandler(async (req, res) => {
  const result = await leaveFriendGroup(req.user.id, req.params.id);
  return sendSuccess(res, result, 'Left friend squad successfully');
});

module.exports = {
  handleCreateGroup,
  handleJoinByCode,
  handleGetGroupFeed,
  handleNominateToGroup,
  handleLeaveGroup
};