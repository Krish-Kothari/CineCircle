cat << 'EOF' > backend/sql/aryan_groups_explain.sql

-- 1. Verify Index Scan on GroupMember(groupId, userId)
EXPLAIN ANALYZE
SELECT "userId", role
FROM "GroupMember"
WHERE "groupId" = (SELECT id FROM "FriendGroup" LIMIT 1);

-- 2. Benchmark Group Blend Multi-User Taste Intersection CTE Query
EXPLAIN ANALYZE
WITH squad_members AS (
  SELECT "userId" FROM "GroupMember" WHERE "groupId" = (SELECT id FROM "FriendGroup" LIMIT 1)
),
seen_by_any_member AS (
  SELECT DISTINCT "mediaId"
  FROM "WatchlistEntry"
  WHERE "userId" IN (SELECT "userId" FROM squad_members)
    AND status IN ('COMPLETED', 'WATCHING')
),
collective_taste AS (
  SELECT genre, SUM("weightScore") AS group_genre_weight
  FROM "UserGenrePreference"
  WHERE "userId" IN (SELECT "userId" FROM squad_members)
  GROUP BY genre
)
SELECT m.id, m.title, SUM(ct.group_genre_weight) AS shared_taste_score
FROM "MediaItem" m
INNER JOIN collective_taste ct ON ct.genre = ANY(m.genres)
WHERE m.id NOT IN (SELECT "mediaId" FROM seen_by_any_member)
GROUP BY m.id
ORDER BY shared_taste_score DESC;