const prisma = require('../../config/prisma');

// KRISH DE VIVA SHOWCASE: Identifies shows left in 'WATCHING' status with no progress in > 14 days,
// calculating dormant watch debt and alerting the user to either resume or transition to 'DROPPED'.
async function getStalledWatchlistAlertsSql(userId) {
  return prisma.$queryRaw`
    SELECT 
      w.id AS watchlist_id,
      m.id AS media_id,
      m.title,
      m.type,
      m."posterUrl",
      w."watchedEpisodes",
      m."totalEpisodes",
      (m."totalEpisodes" - w."watchedEpisodes")::int AS abandoned_episodes,
      ((m."totalEpisodes" - w."watchedEpisodes") * m."runtimeMinutes")::int AS stalled_minutes,
      ROUND(EXTRACT(EPOCH FROM (NOW() - w."updatedAt")) / 86400)::int AS days_since_last_watch,
      CASE 
        WHEN EXTRACT(EPOCH FROM (NOW() - w."updatedAt")) / 86400 >= 30 THEN 'High Churn Risk (Inactive > 30d)'
        WHEN EXTRACT(EPOCH FROM (NOW() - w."updatedAt")) / 86400 >= 14 THEN 'Stalled Binge (Inactive > 14d)'
        ELSE 'Active'
      END AS churn_risk_level
    FROM "WatchlistEntry" w
    INNER JOIN "MediaItem" m ON m.id = w."mediaId"
    WHERE w."userId" = ${userId}
      AND w.status = 'WATCHING'
      AND w."watchedEpisodes" < m."totalEpisodes"
      AND w."updatedAt" <= (NOW() - INTERVAL '14 days')
    ORDER BY days_since_last_watch DESC;
  `;
}

module.exports = { getStalledWatchlistAlertsSql };
