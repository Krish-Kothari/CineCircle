const asyncHandler = require('../../utils/asyncHandler');
const { listCatalog } = require('./catalog.service');
const { upsertReview } = require('./reviews.service');

// GET /catalog/by-platform/:ott (mobile Discover screen)
const handleByPlatform = asyncHandler(async (req, res) => {
  const result = await listCatalog({ platform: req.params.ott, page: 1, limit: 50 });
  return res.json({
    success: true,
    message: 'Fetched catalog by platform',
    data: result.items,
    pagination: result.pagination
  });
});

// POST /catalog/reviews/submit body: { mediaId, rating, reviewText } (mobile MediaDetailModal)
const handleSubmitReview = asyncHandler(async (req, res) => {
  const { mediaId, rating, reviewText } = req.body || {};

  if (typeof mediaId !== 'string' || mediaId.length === 0) {
    return res.status(400).json({ success: false, message: 'mediaId is required' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    return res.status(400).json({
      success: false,
      message: 'rating must be an integer between 1 and 10'
    });
  }
  if (reviewText != null && (typeof reviewText !== 'string' || reviewText.length > 1000)) {
    return res.status(400).json({
      success: false,
      message: 'reviewText must be a string of at most 1000 characters'
    });
  }

  const result = await upsertReview(req.user.id, mediaId, { rating, body: reviewText });
  if (!result) {
    return res.status(404).json({ success: false, message: 'Media not found' });
  }
  const { mediaAvgRating, ...review } = result;
  return res.status(201).json({
    success: true,
    message: 'Review saved',
    data: { review, mediaStats: { avgRating: mediaAvgRating } }
  });
});

module.exports = { handleByPlatform, handleSubmitReview };
