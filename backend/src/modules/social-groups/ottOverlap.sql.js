const prisma = require('../../config/prisma');

async function getSquadOttCoverageSql(groupId) {
  return prisma.$queryRaw`
    WITH squad_users AS (
      SELECT u.id, u.username, u."subscribedOTTs"
      FROM "GroupMember" gm
      INNER JOIN "User" u ON u.id = gm."userId"
      WHERE gm."groupId" = ${groupId}
    ),
    total_squad AS (SELECT COUNT(*)::int AS total_members FROM squad_users)
    SELECT unnest(su."subscribedOTTs") AS platform_name,
           COUNT(DISTINCT su.id)::int AS subscribed_members,
           (SELECT total_members FROM total_squad) AS total_members,
           ARRAY_AGG(su.username) AS member_usernames
    FROM squad_users su
    GROUP BY platform_name
    ORDER BY subscribed_members DESC, platform_name ASC;
  `;
}

module.exports = { getSquadOttCoverageSql };
