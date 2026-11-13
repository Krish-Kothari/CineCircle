const prisma = require('../../config/prisma');

// ARYAN DE VIVA SHOWCASE: Multi-User Set Intersection SQL ("Group Blend")
// Finds movies matching collective genre preferences of ALL squad members that NO member has watched yet
async function getGroupBlendRecommendationsSql(groupId) {
  const blendRecs = await prisma.$queryRaw`
    WITH squad_members AS (
      SELECT "userId"
      FROM "GroupMember"
      WHERE "groupId" = ${groupId}
    ),
    seen_by_any_member AS (
      SELECT DISTINCT "mediaId"
      FROM "WatchlistEntry"
      WHERE "userId" IN (SELECT "userId" FROM squad_members)
        AND status IN ('COMPLETED', 'WATCHING')
    ),
    collective_taste AS (
      SELECT 
        genre,
        SUM("weightScore")::int AS group_genre_weight,
        COUNT(DISTINCT "userId")::int AS members_sharing_genre
      FROM "UserGenrePreference"
      WHERE "userId" IN (SELECT "userId" FROM squad_members)
      GROUP BY genre
    )
    SELECT 
      m.id,
      m.title,
      m.type,
      m."releaseYear",
      m.genres,
      m."posterUrl",
      m."runtimeMinutes",
      m."avgRating",
      COALESCE(SUM(ct.group_genre_weight), 0)::int AS shared_taste_score,
      COALESCE(MAX(ct.members_sharing_genre), 1)::int AS members_matched,
      ARRAY_AGG(DISTINCT s."platformName") FILTER (WHERE s."platformName" IS NOT NULL) AS platforms
    FROM "MediaItem" m
    INNER JOIN collective_taste ct ON ct.genre = ANY(m.genres)
    LEFT JOIN "StreamingAvailability" s ON s."mediaId" = m.id
    WHERE m.id NOT IN (SELECT "mediaId" FROM seen_by_any_member)
    GROUP BY m.id
    ORDER BY shared_taste_score DESC, m."avgRating" DESC
    LIMIT 10;
  `;

  return blendRecs;
}

// SQL Window Function RANK() for Squad Watch-Time Leaderboard
async function getSquadLeaderboardSql(groupId) {
  return prisma.$queryRaw`
    SELECT 
      u.id,
      u.name,
      u.username,
      u."totalWatchMinutes",
      COUNT(w.id) FILTER (WHERE w.status = 'COMPLETED')::int AS completed_count,
      RANK() OVER (ORDER BY u."totalWatchMinutes" DESC)::int AS squad_rank
    FROM "GroupMember" gm
    INNER JOIN "User" u ON u.id = gm."userId"
    LEFT JOIN "WatchlistEntry" w ON w."userId" = u.id
    WHERE gm."groupId" = ${groupId}
    GROUP BY u.id, u.name, u.username, u."totalWatchMinutes"
    ORDER BY squad_rank ASC;
  `;
}

module.exports = {
  getGroupBlendRecommendationsSql,
  getSquadLeaderboardSql
};
