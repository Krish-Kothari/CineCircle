const express = require('express');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const {
  register,
  login,
  getMyProfile,
  updatePreferences
} = require('./auth.controller');

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/users/profile', authenticateToken, getMyProfile);
router.put('/preferences/genres', authenticateToken, updatePreferences);

module.exports = router;
