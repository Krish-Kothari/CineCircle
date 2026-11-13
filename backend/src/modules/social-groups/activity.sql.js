const prisma = require('../../config/prisma');

async function getSquadActivityStreamSql(groupId) {
  return prisma.$queryRaw`
    WITH squad_users AS (
      SELECT "userId" FROM "GroupMember" WHERE "groupId" = ${groupId}
    )
    (
      SELECT 
        'REVIEW' AS activity_type,
        u.username,
        m.title AS media_title,
        CONCAT('Rated ★ ', r.rating, '/10') AS detail,
        r."createdAt" AS activity_time
      FROM "UserReview" r
      INNER JOIN "User" u ON u.id = r."userId"
      INNER JOIN "MediaItem" m ON m.id = r."mediaId"
      WHERE r."userId" IN (SELECT "userId" FROM squad_users)
    )
    UNION ALL
    (
      SELECT 
        'WATCHLIST' AS activity_type,
        u.username,
        m.title AS media_title,
        CONCAT('Marked status as ', w.status) AS detail,
        w."updatedAt" AS activity_time
      FROM "WatchlistEntry" w
      INNER JOIN "User" u ON u.id = w."userId"
      INNER JOIN "MediaItem" m ON m.id = w."mediaId"
      WHERE w."userId" IN (SELECT "userId" FROM squad_users)
    )
    ORDER BY activity_time DESC
    LIMIT 15;
  `;
}

async function getUserJoinedGroups(userId) {
  return prisma.friendGroup.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    include: {
      _count: {
        select: {
          members: true,
          sharedList: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

module.exports = {
  getSquadActivityStreamSql,
  getUserJoinedGroups
};

