const prisma = require('../../config/prisma');

async function getUserMilestonesSql(userId) {
  const rows = await prisma.$queryRaw`
    SELECT COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completed_titles,
           COALESCE(SUM("watchedEpisodes"), 0)::int AS episodes_watched,
           ARRAY_REMOVE(ARRAY[
             CASE WHEN COUNT(*) FILTER (WHERE status = 'COMPLETED') >= 1 THEN 'First Finish' END,
             CASE WHEN COUNT(*) FILTER (WHERE status = 'COMPLETED') >= 5 THEN 'Five Finished' END,
             CASE WHEN COALESCE(SUM("watchedEpisodes"), 0) >= 25 THEN 'Episode Marathon' END
           ], NULL) AS milestones
    FROM "WatchlistEntry" WHERE "userId" = ${userId};
  `;
  return rows[0] || null;
}

module.exports = { getUserMilestonesSql };
