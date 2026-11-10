const prisma = require('../../config/prisma');

// KRISH DE VIVA SHOWCASE: Calculates required daily viewing minutes to hit target completion dates
// and assesses feasibility against user's actual 14-day historical pacing.
async function getWatchlistDeadlineFeasibilitySql(userId) {
  return prisma.$queryRaw`
    WITH user_pacing AS (
      SELECT 
        GREATEST(
          ROUND((SUM(m."runtimeMinutes") / 14.0)::numeric, 1),
          15.0
        )::float AS avg_daily_minutes
      FROM "EpisodeProgress" ep
      INNER JOIN "MediaItem" m ON m.id = ep."mediaId"
      WHERE ep."userId" = ${userId}
        AND ep."watchedAt" >= (NOW() - INTERVAL '14 days')
    )
    SELECT 
      w.id AS watchlist_id,
      m.id AS media_id,
      m.title,
      m.type,
      w.status,
      w."watchedEpisodes",
      m."totalEpisodes",
      ((m."totalEpisodes" - w."watchedEpisodes") * m."runtimeMinutes")::int AS remaining_minutes,
      up.avg_daily_minutes AS historical_daily_capacity_minutes,
      ROUND(
        (((m."totalEpisodes" - w."watchedEpisodes") * m."runtimeMinutes") / 7.0)::numeric,
        1
      )::float AS required_daily_minutes_7d_target,
      ROUND(
        (((m."totalEpisodes" - w."watchedEpisodes") * m."runtimeMinutes") / 14.0)::numeric,
        1
      )::float AS required_daily_minutes_14d_target,
      CASE 
        WHEN (((m."totalEpisodes" - w."watchedEpisodes") * m."runtimeMinutes") / 7.0) <= up.avg_daily_minutes THEN 'Easily Achievable (7-day target)'
        WHEN (((m."totalEpisodes" - w."watchedEpisodes") * m."runtimeMinutes") / 14.0) <= up.avg_daily_minutes THEN 'Moderate Pace (14-day target)'
        ELSE 'Binge Heavy Required (> 14 days)'
      END AS target_feasibility
    FROM "WatchlistEntry" w
    INNER JOIN "MediaItem" m ON m.id = w."mediaId"
    CROSS JOIN user_pacing up
    WHERE w."userId" = ${userId}
      AND w.status IN ('WATCHING', 'PLAN_TO_WATCH')
      AND w."watchedEpisodes" < m."totalEpisodes"
    ORDER BY remaining_minutes ASC
    LIMIT 10;
  `;
}

module.exports = { getWatchlistDeadlineFeasibilitySql };
