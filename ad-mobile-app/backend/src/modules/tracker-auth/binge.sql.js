const prisma = require('../../config/prisma');

// KRISH DE VIVA SHOWCASE: Calculates completion % and remaining watch minutes for active shows
async function getContinueWatchingSql(userId) {
  return prisma.$queryRaw`
    SELECT 
      w.id AS watchlist_id,
      m.id AS media_id,
      m.title,
      m.type,
      m."posterUrl",
      m."runtimeMinutes",
      w."watchedEpisodes",
      m."totalEpisodes",
      (m."totalEpisodes" - w."watchedEpisodes")::int AS remaining_episodes,
      ((m."totalEpisodes" - w."watchedEpisodes") * m."runtimeMinutes")::int AS remaining_minutes,
      ROUND(((w."watchedEpisodes"::numeric / GREATEST(m."totalEpisodes", 1)) * 100), 1)::float AS completion_pct,
      w."updatedAt"
    FROM "WatchlistEntry" w
    INNER JOIN "MediaItem" m ON m.id = w."mediaId"
    WHERE w."userId" = ${userId}
      AND w.status = 'WATCHING'
      AND w."watchedEpisodes" < m."totalEpisodes"
    ORDER BY w."updatedAt" DESC
    LIMIT 10;
  `;
}

module.exports = { getContinueWatchingSql };
