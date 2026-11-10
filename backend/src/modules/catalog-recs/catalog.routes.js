const express = require('express');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const {
  handleListCatalog,
  handleGetMedia,
  handleListPlatforms
} = require('./catalog.controller');
const {
  handleUpsertReview,
  handleListReviews,
  handleDeleteReview
} = require('./reviews.controller');

const router = express.Router();

// Order matters: /platforms must come before /:id
router.get('/platforms', handleListPlatforms);
router.get('/', handleListCatalog);
router.get('/:id', handleGetMedia);

// Community reviews
router.get('/:id/reviews', handleListReviews);
router.post('/:id/reviews', authenticateToken, handleUpsertReview);
router.delete('/:id/reviews', authenticateToken, handleDeleteReview);

module.exports = router;
