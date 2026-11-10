const prisma = require('../../config/prisma');

// KRISH DE VIVA SHOWCASE: Calculates monthly binge records, favorite genre,
// and most active binge day of the week using PostgreSQL date parsing and array unnesting.
async function getMonthlyWrappedSql(userId) {
  const [generalStats, topGenre, peakDay] = await Promise.all([
    prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT ep.id)::int AS monthly_episodes,
        COUNT(DISTINCT ep."mediaId")::int AS active_shows_count,
        SUM(m."runtimeMinutes")::int AS total_monthly_minutes,
        ROUND((SUM(m."runtimeMinutes") / 60.0)::numeric, 1)::float AS total_monthly_hours
      FROM "EpisodeProgress" ep
      INNER JOIN "MediaItem" m ON m.id = ep."mediaId"
      WHERE ep."userId" = ${userId}
        AND ep."watchedAt" >= (NOW() - INTERVAL '30 days');
    `,
    prisma.$queryRaw`
      SELECT 
        unnest(m.genres) AS genre,
        COUNT(*)::int AS count
      FROM "EpisodeProgress" ep
      INNER JOIN "MediaItem" m ON m.id = ep."mediaId"
      WHERE ep."userId" = ${userId}
        AND ep."watchedAt" >= (NOW() - INTERVAL '30 days')
      GROUP BY genre
      ORDER BY count DESC
      LIMIT 1;
    `,
    prisma.$queryRaw`
      SELECT 
        TRIM(TO_CHAR(ep."watchedAt", 'Day')) AS day_of_week,
        COUNT(*)::int AS episodes_logged
      FROM "EpisodeProgress" ep
      WHERE ep."userId" = ${userId}
        AND ep."watchedAt" >= (NOW() - INTERVAL '30 days')
      GROUP BY day_of_week
      ORDER BY episodes_logged DESC
      LIMIT 1;
    `
  ]);

  return {
    overview: generalStats[0] || { monthly_episodes: 0, total_monthly_minutes: 0, total_monthly_hours: 0 },
    topGenre: topGenre[0]?.genre || 'Sci-Fi',
    peakDay: peakDay[0]?.day_of_week || 'Friday'
  };
}

module.exports = { getMonthlyWrappedSql };
