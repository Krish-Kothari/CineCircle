const asyncHandler = require('../../utils/asyncHandler');
const { listCatalog, getMediaById, listPlatforms } = require('./catalog.service');

const VALID_TYPES = ['MOVIE', 'TV_SHOW'];

const handleListCatalog = asyncHandler(async (req, res) => {
  const { search, platform, genre, page, limit } = req.query;
  const type = req.query.type ? String(req.query.type).toUpperCase() : undefined;

  if (type && !VALID_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `type must be one of: ${VALID_TYPES.join(', ')}`
    });
  }

  const result = await listCatalog({ search, platform, genre, type, page, limit });
  return res.json({
    success: true,
    message: 'Fetched catalog',
    data: result.items,
    pagination: result.pagination
  });
});

const handleGetMedia = asyncHandler(async (req, res) => {
  const item = await getMediaById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Media not found' });
  }
  return res.json({ success: true, message: 'Fetched media', data: item });
});

const handleListPlatforms = asyncHandler(async (req, res) => {
  const platforms = await listPlatforms();
  return res.json({ success: true, message: 'Fetched platforms', data: platforms });
});

module.exports = { handleListCatalog, handleGetMedia, handleListPlatforms };
