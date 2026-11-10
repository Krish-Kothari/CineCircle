const asyncHandler = require('../../utils/asyncHandler');
const { getRecommendations } = require('./recs.service');

const handleGetRecommendations = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 20);
  const items = await getRecommendations(req.user.id, limit);
  return res.json({ success: true, message: 'Fetched recommendations', data: items });
});

module.exports = { handleGetRecommendations };
