function validateCreateGroupInput({ name }) {
  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    return 'Group name is required and must be at least 3 characters long';
  }
  return null;
}

function validateJoinByCodeInput({ inviteCode }) {
  if (!inviteCode || typeof inviteCode !== 'string' || inviteCode.trim().length !== 6) {
    return 'A valid 6-character group inviteCode is required';
  }
  return null;
}

function validateNominateMediaInput({ mediaId, pitchNote }) {
  if (!mediaId) {
    return 'mediaId is required to nominate a title to the group watchlist';
  }
  if (pitchNote && pitchNote.length > 280) {
    return 'pitchNote cannot exceed 280 characters';
  }
  return null;
}

module.exports = {
  validateCreateGroupInput,
  validateJoinByCodeInput,
  validateNominateMediaInput
};