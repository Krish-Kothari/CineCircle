const express = require('express');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const { requireGroupMember } = require('../../middlewares/groupAccess.middleware');
const {
  handleCreateGroup,
  handleJoinByCode,
  handleGetGroupFeed,
  handleNominateToGroup,
  handleLeaveGroup
} = require('./groups.controller');

const router = express.Router();

router.use(authenticateToken);

router.post('/create', handleCreateGroup);
router.post('/join-by-code', handleJoinByCode);
router.get('/:id/feed', requireGroupMember, handleGetGroupFeed);
router.post('/:id/watchlist', requireGroupMember, handleNominateToGroup);
router.delete('/:id/leave', requireGroupMember, handleLeaveGroup);

module.exports = router;
EOF

cat << 'EOF' > backend/src/routes/index.js
const express = require('express');
const trackerRoutes = require('../modules/tracker-auth/tracker.routes');
const catalogRoutes = require('../modules/catalog-recs/catalog.routes');
const groupRoutes = require('../modules/social-groups/groups.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CineCircle API Router v1.0',
    modules: {
      trackerAuth: '/api/tracker (Krish)',
      catalogRecs: '/api/catalog (Harsh)',
      socialGroups: '/api/groups (Aryan)'
    }
  });
});

router.use('/tracker', trackerRoutes);
router.use('/catalog', catalogRoutes);
router.use('/groups', groupRoutes);

module.exports = router;
