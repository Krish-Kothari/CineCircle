const prisma = require('../../config/prisma');

// KRISH DE VIVA SHOWCASE: PostgreSQL unnest() Array Aggregation for User Watch Stats
async function getUserWatchAnalyticsSql(userId) {
  const genreBreakdown = await prisma.$queryRaw`
    SELECT 
      unnest(m.genres) AS genre,
      COUNT(w.id)::int AS total_titles,
      SUM(CASE WHEN w.status = 'COMPLETED' THEN 1 ELSE 0 END)::int AS completed_titles,
      SUM(w."watchedEpisodes" * m."runtimeMinutes")::int AS minutes_watched
    FROM "WatchlistEntry" w
    INNER JOIN "MediaItem" m ON m.id = w."mediaId"
    WHERE w."userId" = ${userId}
    GROUP BY genre
    ORDER BY minutes_watched DESC;
  `;

  const statusSummary = await prisma.$queryRaw`
    SELECT 
      w.status,
      COUNT(w.id)::int AS count
    FROM "WatchlistEntry" w
    WHERE w."userId" = ${userId}
    GROUP BY w.status;
  `;

  return { genreBreakdown, statusSummary };
}

module.exports = { getUserWatchAnalyticsSql };
