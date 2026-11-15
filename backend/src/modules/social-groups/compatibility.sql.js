const prisma = require('../../config/prisma');

async function getSquadTasteCompatibilitySql(groupId) {
  return prisma.$queryRaw`
    WITH squad_users AS (
      SELECT u.id, u.username
      FROM "GroupMember" gm
      INNER JOIN "User" u ON u.id = gm."userId"
      WHERE gm."groupId" = ${groupId}
    )
    SELECT u1.username AS member_a, u2.username AS member_b,
           COUNT(p1.genre)::int AS shared_genres,
           ROUND(AVG(100 - (ABS(p1."weightScore" - p2."weightScore") * 10))::numeric, 1)::float AS compatibility_pct
    FROM squad_users u1
    INNER JOIN squad_users u2 ON u1.id < u2.id
    INNER JOIN "UserGenrePreference" p1 ON p1."userId" = u1.id
    INNER JOIN "UserGenrePreference" p2 ON p2."userId" = u2.id AND p1.genre = p2.genre
    GROUP BY u1.username, u2.username
    ORDER BY compatibility_pct DESC;
  `;
}

module.exports = { getSquadTasteCompatibilitySql };
