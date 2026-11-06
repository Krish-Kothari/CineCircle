const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CineCircle API Router v1.0',
    modules: {
      trackerAuth: '/api/tracker (Krish)',
      catalogRecs: '/api/catalog (Harsh)',
      socialGroups: '/api/groups (Aryan)'
    }
  });
});

module.exports = router;