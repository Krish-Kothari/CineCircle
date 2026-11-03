const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess, sendError } = require('../../utils/apiResponse');
const { validateRegisterInput, validateGenrePreferences } = require('./tracker.validators');
const { registerUser, loginUser, getUserProfileById } = require('./auth.service');
const { upsertUserPreferences } = require('./preferences.service');

const register = asyncHandler(async (req, res) => {
  const validationError = validateRegisterInput(req.body);
  if (validationError) {
    return sendError(res, validationError, 400);
  }

  const result = await registerUser(req.body);
  return sendSuccess(res, result, 'User registered successfully', 201);
});

const login = asyncHandler(async (req, res) => {
  const { emailOrUsername, email, username, password } = req.body;
  const identifier = emailOrUsername || email || username;

  if (!identifier || !password) {
    return sendError(res, 'Email/username and password are required', 400);
  }

  const result = await loginUser({ emailOrUsername: identifier, password });
  return sendSuccess(res, result, 'Login successful');
});

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await getUserProfileById(req.user.id);
  return sendSuccess(res, profile, 'Fetched user profile');
});

const updatePreferences = asyncHandler(async (req, res) => {
  const { preferences, subscribedOTTs } = req.body;

  if (preferences) {
    const validationError = validateGenrePreferences(preferences);
    if (validationError) {
      return sendError(res, validationError, 400);
    }
  }

  const updated = await upsertUserPreferences(req.user.id, { preferences, subscribedOTTs });
  return sendSuccess(res, updated, 'User taste preferences updated');
});

module.exports = {
  register,
  login,
  getMyProfile,
  updatePreferences
};
