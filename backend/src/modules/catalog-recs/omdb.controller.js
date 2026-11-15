const asyncHandler = require('../../utils/asyncHandler');
const { searchOmdb, getOmdbTitle } = require('./omdb.service');

const handleOmdbSearch = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (query.length < 2) {
    return res.status(400).json({ success: false, message: 'q must contain at least 2 characters' });
  }

  const result = await searchOmdb(query, req.query.page, req.query.type);
  return res.json({ success: true, message: 'Fetched OMDb results', data: result.items, totalResults: result.totalResults });
});

const handleOmdbTitle = asyncHandler(async (req, res) => {
  const title = await getOmdbTitle(req.params.imdbId);
  return res.json({ success: true, message: 'Fetched OMDb title', data: title });
});

module.exports = { handleOmdbSearch, handleOmdbTitle };
