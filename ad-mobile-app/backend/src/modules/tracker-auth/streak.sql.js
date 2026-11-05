const prisma = require('../../config/prisma');

// KRISH DE VIVA SHOWCASE: PostgreSQL DATE_TRUNC Time-Series Aggregation for Weekly Episode Velocity
async function getWeeklyWatchVelocitySql(userId) {
  return prisma.$queryRaw`
    SELECT 
      TO_CHAR(DATE_TRUNC('week', ep."watchedAt"), 'YYYY-MM-DD') AS week_start,
      COUNT(ep.id)::int AS episodes_watched,
      COUNT(DISTINCT ep."mediaId")::int AS distinct_shows,
      SUM(m."runtimeMinutes")::int AS minutes_logged
    FROM "EpisodeProgress" ep
    INNER JOIN "MediaItem" m ON m.id = ep."mediaId"
    WHERE ep."userId" = ${userId}
    GROUP BY DATE_TRUNC('week', ep."watchedAt")
    ORDER BY DATE_TRUNC('week', ep."watchedAt") DESC
    LIMIT 8;
  `;
}

module.exports = { getWeeklyWatchVelocitySql };
