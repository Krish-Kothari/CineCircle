const asyncHandler = require('../../utils/asyncHandler');
const { upsertReview, listReviews, deleteReview } = require('./reviews.service');

const handleUpsertReview = asyncHandler(async (req, res) => {
  const { rating, body } = req.body || {};

  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    return res.status(400).json({
      success: false,
      message: 'rating must be an integer between 1 and 10'
    });
  }
  if (body !== undefined && body !== null) {
    if (typeof body !== 'string' || body.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'body must be a string of at most 1000 characters'
      });
    }
  }

  const result = await upsertReview(req.user.id, req.params.id, { rating, body });
  if (!result) {
    return res.status(404).json({ success: false, message: 'Media not found' });
  }
  return res.status(201).json({
    success: true,
    message: 'Review saved',
    data: result
  });
});

const handleListReviews = asyncHandler(async (req, res) => {
  const result = await listReviews(req.params.id, req.query);
  if (!result) {
    return res.status(404).json({ success: false, message: 'Media not found' });
  }
  return res.json({
    success: true,
    message: 'Fetched reviews',
    data: result.items,
    mediaAvgRating: result.mediaAvgRating,
    pagination: result.pagination
  });
});

const handleDeleteReview = asyncHandler(async (req, res) => {
  const result = await deleteReview(req.user.id, req.params.id);
  if (!result) {
    return res.status(404).json({
      success: false,
      message: 'You have no review for this media'
    });
  }
  return res.json({ success: true, message: 'Review deleted', data: result });
});

module.exports = { handleUpsertReview, handleListReviews, handleDeleteReview };
