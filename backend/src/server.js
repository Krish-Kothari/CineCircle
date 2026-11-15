require('dotenv').config();

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/index');
const trackerRoutes = require('./modules/tracker-auth/tracker.routes');
const catalogRoutes = require('./modules/catalog-recs/catalog.routes');
const groupsRoutes = require('./modules/social-groups/groups.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'cine_circle',
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use('/api', apiRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/groups', groupsRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});
app.use(errorHandler);

if (require.main === module) {
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => {
    console.log(`CineCircle API listening on port ${port}`);
  });
}

module.exports = app;
