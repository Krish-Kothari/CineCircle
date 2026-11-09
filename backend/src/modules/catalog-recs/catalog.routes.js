const express = require('express');
const {
  handleListCatalog,
  handleGetMedia,
  handleListPlatforms
} = require('./catalog.controller');

const router = express.Router();

// Order matters: /platforms must come before /:id
router.get('/platforms', handleListPlatforms);
router.get('/', handleListCatalog);
router.get('/:id', handleGetMedia);

module.exports = router;
