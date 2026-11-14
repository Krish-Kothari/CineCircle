const prisma = require('../../config/prisma');

// ARYAN DE VIVA SHOWCASE: Aggregates historical viewing timestamps across all squad members
// to recommend the best upcoming weekend time slot minimizing member schedule conflicts.
async function getOptimalSquadTimeSlotSql(groupId) {
  return prisma.$queryRaw`
    WITH squad_members AS (
      SELECT "userId" FROM "GroupMember" WHERE "groupId" = ${groupId}
    ),
    member_habits AS (
      SELECT 
        ep."userId",
        TRIM(TO_CHAR(ep."watchedAt", 'Day')) AS binge_day,
        EXTRACT(HOUR FROM ep."watchedAt")::int AS binge_hour
      FROM "EpisodeProgress" ep
      WHERE ep."userId" IN (SELECT "userId" FROM squad_members)
    )
    SELECT 
      binge_day,
      CASE 
        WHEN binge_hour BETWEEN 18 AND 21 THEN 'Evening Primetime (6 PM - 9 PM)'
        WHEN binge_hour BETWEEN 21 AND 24 THEN 'Late Night Watch (9 PM - 12 AM)'
        WHEN binge_hour BETWEEN 12 AND 17 THEN 'Afternoon Session (12 PM - 5 PM)'
        ELSE 'Morning Session (8 AM - 11 AM)'
      END AS optimal_slot_window,
      COUNT(*)::int AS collective_activity_density,
      COUNT(DISTINCT "userId")::int AS aligned_members_count
    FROM member_habits
    GROUP BY binge_day, optimal_slot_window
    ORDER BY collective_activity_density DESC, aligned_members_count DESC
    LIMIT 3;
  `;
}

module.exports = { getOptimalSquadTimeSlotSql };
