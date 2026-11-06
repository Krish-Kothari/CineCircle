const prisma = require('../../config/prisma');

// KRISH DE VIVA SHOWCASE: Calculates daily episode velocity over the last 14 days
// and estimates the exact calendar date the user will finish watching their active TV shows.
async function getBingePacingEstimatesSql(userId) {
  return prisma.$queryRaw`
    WITH user_velocity AS (
      SELECT 
        GREATEST(
          ROUND(COUNT(ep.id)::numeric / 14.0, 2),
          0.5
        )::float AS avg_episodes_per_day
      FROM "EpisodeProgress" ep
      WHERE ep."userId" = ${userId}
        AND ep."watchedAt" >= (NOW() - INTERVAL '14 days')
    )
    SELECT 
      w.id AS watchlist_id,
      m.id AS media_id,
      m.title,
      m."totalEpisodes",
      w."watchedEpisodes",
      (m."totalEpisodes" - w."watchedEpisodes")::int AS remaining_episodes,
      uv.avg_episodes_per_day,
      CEIL((m."totalEpisodes" - w."watchedEpisodes") / uv.avg_episodes_per_day)::int AS days_to_finish,
      TO_CHAR(
        NOW() + (CEIL((m."totalEpisodes" - w."watchedEpisodes") / uv.avg_episodes_per_day) || ' days')::interval,
        'YYYY-MM-DD'
      ) AS estimated_finish_date
    FROM "WatchlistEntry" w
    INNER JOIN "MediaItem" m ON m.id = w."mediaId"
    CROSS JOIN user_velocity uv
    WHERE w."userId" = ${userId}
      AND w.status = 'WATCHING'
      AND m.type = 'TV_SHOW'
      AND w."watchedEpisodes" < m."totalEpisodes"
    ORDER BY days_to_finish ASC;
  `;
}

module.exports = { getBingePacingEstimatesSql };
