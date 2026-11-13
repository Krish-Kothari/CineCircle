const prisma = require('../../config/prisma');

// ARYAN DE VIVA SHOWCASE: Squad Taste Divergence & Outlier Detection in PostgreSQL
// Computes each member's taste variance from the squad's mean genre weight vector
async function getSquadTasteDivergenceSql(groupId) {
  return prisma.$queryRaw`
    WITH squad_users AS (
      SELECT u.id, u.username
      FROM "GroupMember" gm
      INNER JOIN "User" u ON u.id = gm."userId"
      WHERE gm."groupId" = ${groupId}
    ),
    squad_genre_means AS (
      SELECT 
        p.genre,
        AVG(p."weightScore") AS mean_weight
      FROM "UserGenrePreference" p
      WHERE p."userId" IN (SELECT id FROM squad_users)
      GROUP BY p.genre
    ),
    member_deviations AS (
      SELECT 
        su.id,
        su.username,
        ROUND(
          SQRT(
            AVG(POWER(COALESCE(p."weightScore", 0) - sgm.mean_weight, 2))
          )::numeric,
          2
        )::float AS taste_divergence_index
      FROM squad_users su
      CROSS JOIN squad_genre_means sgm
      LEFT JOIN "UserGenrePreference" p ON p."userId" = su.id AND p.genre = sgm.genre
      GROUP BY su.id, su.username
    )
    SELECT 
      md.username,
      md.taste_divergence_index,
      CASE 
        WHEN md.taste_divergence_index >= 3.0 THEN 'Squad Maverick (Unique Taste)'
        WHEN md.taste_divergence_index <= 1.5 THEN 'Squad Consensus Anchor'
        ELSE 'Balanced Contributor'
      END AS role_archetype
    FROM member_deviations md
    ORDER BY md.taste_divergence_index DESC;
  `;
}

module.exports = { getSquadTasteDivergenceSql };
