const asyncHandler = require('../../utils/asyncHandler');
const { listCatalog, getMediaById, listPlatforms } = require('./catalog.service');

const VALID_TYPES = ['MOVIE', 'TV_SHOW'];
const TEXT_FILTERS = ['search', 'platform', 'region', 'genre'];

function isMalformedIntegerParam(value) {
  return typeof value !== 'string' || (value !== '' && !/^-?\d+$/.test(value));
}

const handleListCatalog = asyncHandler(async (req, res) => {
  const { search, platform, region, genre, page, limit } = req.query;
  for (const name of TEXT_FILTERS) {
    if (req.query[name] !== undefined && typeof req.query[name] !== 'string') {
      return res.status(400).json({
        success: false,
        message: `${name} must be a single string`
      });
    }
    if (['platform', 'region'].includes(name) && req.query[name]?.trim() === '' && req.query[name] !== '') {
      return res.status(400).json({ success: false, message: `${name} cannot be blank` });
    }
  }

  for (const name of ['page', 'limit']) {
    if (req.query[name] !== undefined && isMalformedIntegerParam(req.query[name])) {
      return res.status(400).json({
        success: false,
        message: `${name} must be an integer`
      });
    }
  }

  const rawType = req.query.type;
  const type = typeof rawType === 'string' && rawType ? rawType.toUpperCase() : undefined;

  if (rawType !== undefined && (typeof rawType !== 'string' || (type && !VALID_TYPES.includes(type)))) {
    return res.status(400).json({
      success: false,
      message: `type must be one of: ${VALID_TYPES.join(', ')}`
    });
  }

  const result = await listCatalog({ search, platform, region, genre, type, page, limit });
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
