const prisma = require('../../config/prisma');

// ARYAN DE VIVA SHOWCASE: Analyzes voting latency and distribution across nominations
// to compute a squad's consensus speed and debate friction index.
async function getSquadDebateVolatilitySql(groupId) {
  return prisma.$queryRaw`
    SELECT 
      fg.id AS group_id,
      fg.name AS group_name,
      COUNT(gwi.id)::int AS total_debated_items,
      ROUND(AVG(gwi."voteCount")::numeric, 1)::float AS avg_votes_per_item,
      MAX(gwi."voteCount")::int AS peak_vote_count,
      ROUND(
        COALESCE(STDDEV_POP(gwi."voteCount"), 0)::numeric,
        2
      )::float AS vote_dispersion_stddev,
      CASE 
        WHEN COALESCE(STDDEV_POP(gwi."voteCount"), 0) >= 1.5 THEN 'Contentious (Heated Debates)'
        WHEN COALESCE(STDDEV_POP(gwi."voteCount"), 0) >= 0.8 THEN 'Balanced Discussion'
        ELSE 'Fast Consensus (Quick Alignment)'
      END AS debate_climate
    FROM "FriendGroup" fg
    LEFT JOIN "GroupWatchlistItem" gwi ON gwi."groupId" = fg.id
    WHERE fg.id = ${groupId}
    GROUP BY fg.id, fg.name;
  `;
}

module.exports = { getSquadDebateVolatilitySql };
