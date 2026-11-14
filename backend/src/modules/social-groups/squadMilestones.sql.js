const prisma = require('../../config/prisma');

// ARYAN DE VIVA SHOWCASE: Evaluates collective squad milestone achievements in SQL
// such as unanimous voting quorum records and diverse genre coverage.
async function getSquadMilestonesSql(groupId) {
  const rows = await prisma.$queryRaw`
    WITH squad_watched AS (
      SELECT DISTINCT m.genres
      FROM "GroupWatchlistItem" gwi
      INNER JOIN "MediaItem" m ON m.id = gwi."mediaId"
      WHERE gwi."groupId" = ${groupId}
        AND gwi.status = 'WATCHED_TOGETHER'
    )
    SELECT 
      fg.id,
      fg.name,
      COUNT(DISTINCT gm."userId")::int AS total_members,
      COUNT(DISTINCT gwi.id) FILTER (WHERE gwi.status = 'WATCHED_TOGETHER')::int AS completed_watch_parties,
      ARRAY_REMOVE(ARRAY[
        CASE WHEN COUNT(DISTINCT gm."userId") >= 3 THEN 'Trio Alliance' END,
        CASE WHEN COUNT(DISTINCT gwi.id) FILTER (WHERE gwi.status = 'WATCHED_TOGETHER') >= 1 THEN 'First Watch Party Done' END,
        CASE WHEN COUNT(DISTINCT gwi.id) FILTER (WHERE gwi.status = 'TONIGHTS_PICK') >= 1 THEN 'Quorum Master' END,
        CASE WHEN (SELECT COUNT(*) FROM squad_watched) >= 3 THEN 'Genre Explorers' END
      ], NULL) AS squad_badges
    FROM "FriendGroup" fg
    LEFT JOIN "GroupMember" gm ON gm."groupId" = fg.id
    LEFT JOIN "GroupWatchlistItem" gwi ON gwi."groupId" = fg.id
    WHERE fg.id = ${groupId}
    GROUP BY fg.id, fg.name;
  `;

  return rows[0] || null;
}

module.exports = { getSquadMilestonesSql };
