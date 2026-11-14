const prisma = require('../../config/prisma');

const round3 = (n) => Math.round(n * 1000) / 1000;

function buildReason(r) {
  const parts = [];
  if (r.matchedGenres.length) {
    parts.push(`Matches your ${r.matchedGenres.slice(0, 2).join(' & ')} taste`);
  }
  if (r.hasCollab && r.collabScore >= 0.7) {
    parts.push('Loved by viewers with similar taste');
  }
  if (!parts.length) {
    parts.push(r.avgRating >= 8 ? 'Highly rated by the community' : 'Popular pick');
  }
  let reason = parts.join(', ');
  if (r.myPlatforms.length) reason += ` - on ${r.myPlatforms[0]}`;
  return reason;
}

async function getRecommendations(userId, limit) {
  const rows = await prisma.$queryRaw`
    WITH me AS (
      SELECT "subscribedOTTs" AS otts FROM "User" WHERE id = ${userId}
    ),
    prefs AS (
      SELECT genre, "weightScore" FROM "UserGenrePreference" WHERE "userId" = ${userId}
    ),
    excluded AS (
      SELECT "mediaId" FROM "WatchlistEntry" WHERE "userId" = ${userId} AND status = 'COMPLETED'
      UNION
      SELECT "mediaId" FROM "UserReview" WHERE "userId" = ${userId}
    ),
    content AS (
      SELECT m.id AS "mediaId",
             COALESCE(SUM(p."weightScore"), 0) / (GREATEST(cardinality(m.genres), 1) * 10.0) AS score,
             COALESCE(array_agg(p.genre) FILTER (WHERE p.genre IS NOT NULL), '{}') AS genres_hit
      FROM "MediaItem" m
      LEFT JOIN prefs p ON p.genre = ANY(m.genres)
      GROUP BY m.id
    ),
    sim AS (
      SELECT o."userId" AS uid,
             1 - AVG(ABS(o.rating - mine.rating)) / 9.0 AS sim
      FROM "UserReview" mine
      JOIN "UserReview" o ON o."mediaId" = mine."mediaId" AND o."userId" <> mine."userId"
      WHERE mine."userId" = ${userId}
      GROUP BY o."userId"
    ),
    collab AS (
      SELECT r."mediaId",
             SUM(s.sim * r.rating) / NULLIF(SUM(s.sim), 0) / 10.0 AS score
      FROM "UserReview" r
      JOIN sim s ON s.uid = r."userId"
      GROUP BY r."mediaId"
    ),
    plat AS (
      SELECT st."mediaId", array_agg(DISTINCT st.platform) AS hit
      FROM "StreamingOption" st, me
      WHERE st.platform = ANY(me.otts)
      GROUP BY st."mediaId"
    )
    SELECT m.id, m.title, m.type, m.synopsis, m."releaseYear", m."runtimeMinutes",
           m."totalEpisodes", m.genres, m."posterUrl", m."avgRating",
           c.score::float8 AS "contentScore",
           COALESCE(cf.score, 0)::float8 AS "collabScore",
           (m."avgRating" / 10.0)::float8 AS "popularityScore",
           (cf.score IS NOT NULL) AS "hasCollab",
           c.genres_hit AS "matchedGenres",
           COALESCE(pl.hit, '{}') AS "myPlatforms",
           ((CASE WHEN cf.score IS NULL
                  THEN 0.7 * c.score + 0.3 * (m."avgRating" / 10.0)
                  ELSE 0.5 * c.score + 0.3 * cf.score + 0.2 * (m."avgRating" / 10.0)
             END) * (CASE WHEN pl.hit IS NOT NULL THEN 1.15 ELSE 1 END))::float8 AS "finalScore"
    FROM "MediaItem" m
    JOIN content c ON c."mediaId" = m.id
    LEFT JOIN collab cf ON cf."mediaId" = m.id
    LEFT JOIN plat pl ON pl."mediaId" = m.id
    WHERE m.id NOT IN (SELECT "mediaId" FROM excluded)
    ORDER BY "finalScore" DESC, m.title ASC, m.id ASC
    LIMIT ${limit}::int
  `;

  if (!rows.length) {
    await prisma.recommendationLog.deleteMany({ where: { userId } });
    return [];
  }

  const media = await prisma.mediaItem.findMany({
    where: { id: { in: rows.map((r) => r.id) } },
    include: { streamingOptions: { select: { platform: true, region: true } } }
  });
  const byId = new Map(media.map((m) => [m.id, m]));

  const items = rows.map((r) => {
    const m = byId.get(r.id);
    return {
      id: r.id,
      title: r.title,
      type: r.type,
      synopsis: r.synopsis,
      releaseYear: r.releaseYear,
      runtimeMinutes: r.runtimeMinutes,
      totalEpisodes: r.totalEpisodes,
      genres: r.genres,
      posterUrl: r.posterUrl,
      avgRating: r.avgRating,
      streamingOptions: m.streamingOptions,
      platforms: m.streamingOptions.map((s) => s.platform),
      score: round3(r.finalScore),
      reason: buildReason(r),
      breakdown: {
        content: round3(r.contentScore),
        collaborative: r.hasCollab ? round3(r.collabScore) : null,
        popularity: round3(r.popularityScore)
      }
    };
  });

  // Keep only the latest batch of recommendations per user in the log
  await prisma.$transaction([
    prisma.recommendationLog.deleteMany({ where: { userId } }),
    prisma.recommendationLog.createMany({
      data: items.map((i) => ({ userId, mediaId: i.id, score: i.score, reason: i.reason }))
    })
  ]);

  return items;
}

module.exports = { getRecommendations };
