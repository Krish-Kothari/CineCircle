const prisma = require('../../config/prisma');

// ARYAN DE VIVA SHOWCASE: Allows squad members to filter Group Blend by vetoing specific genres
// (e.g. "No Horror" or "No Romance" for tonight's watch party session)
async function getVetoFilteredGroupBlendSql(groupId, vetoedGenres = []) {
  const safeVetoed = Array.isArray(vetoedGenres) ? vetoedGenres : [];

  return prisma.$queryRaw`
    WITH squad_members AS (
      SELECT "userId" FROM "GroupMember" WHERE "groupId" = ${groupId}
    ),
    seen_by_any AS (
      SELECT DISTINCT "mediaId"
      FROM "WatchlistEntry"
      WHERE "userId" IN (SELECT "userId" FROM squad_members)
        AND status IN ('COMPLETED', 'WATCHING')
    ),
    collective_taste AS (
      SELECT genre, SUM("weightScore")::int AS group_weight
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
      m."avgRating",
      SUM(ct.group_weight)::int AS shared_taste_score,
      ARRAY_AGG(DISTINCT s.platform) FILTER (WHERE s.platform IS NOT NULL) AS platforms
    FROM "MediaItem" m
    INNER JOIN collective_taste ct ON ct.genre = ANY(m.genres)
    LEFT JOIN "StreamingOption" s ON s."mediaId" = m.id
    WHERE m.id NOT IN (SELECT "mediaId" FROM seen_by_any)
      AND NOT (m.genres && ${safeVetoed}::text[])
    GROUP BY m.id
    ORDER BY shared_taste_score DESC, m."avgRating" DESC
    LIMIT 10;
  `;
}

module.exports = { getVetoFilteredGroupBlendSql };
