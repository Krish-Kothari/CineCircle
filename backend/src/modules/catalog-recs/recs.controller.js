const asyncHandler = require('../../utils/asyncHandler');
const { getRecommendations } = require('./recs.service');

function isMalformedLimit(value) {
  return typeof value !== 'string' || (value !== '' && (
    !/^-?\d+$/.test(value) || !Number.isSafeInteger(Number(value))
  ));
}

const handleGetRecommendations = asyncHandler(async (req, res) => {
  if (req.query.limit !== undefined && isMalformedLimit(req.query.limit)) {
    return res.status(400).json({ success: false, message: 'limit must be an integer' });
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 20);
  const items = await getRecommendations(req.user.id, limit);
  return res.json({ success: true, message: 'Fetched recommendations', data: items });
});

module.exports = { handleGetRecommendations };
