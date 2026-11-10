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
const { handleGetRecommendations } = require('./recs.controller');
const { handleByPlatform, handleSubmitReview } = require('./mobile.controller');

const router = express.Router();

// Fixed paths must come before /:id
router.get('/platforms', handleListPlatforms);
router.get('/recommendations', authenticateToken, handleGetRecommendations);

// Aliases used by the mobile app (Krish's ad-mobile-app)
router.get('/recommendations/personal', authenticateToken, handleGetRecommendations);
router.get('/search', handleListCatalog);
router.get('/by-platform/:ott', handleByPlatform);
router.post('/reviews/submit', authenticateToken, handleSubmitReview);

router.get('/', handleListCatalog);
router.get('/:id', handleGetMedia);

// Community reviews
router.get('/:id/reviews', handleListReviews);
router.post('/:id/reviews', authenticateToken, handleUpsertReview);
router.delete('/:id/reviews', authenticateToken, handleDeleteReview);

module.exports = router;
