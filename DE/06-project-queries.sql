-- 1. INSERT: register a demonstration user
INSERT INTO "User" ("id","name","username","email","passwordHash","subscribedOTTs","totalWatchMinutes")
VALUES ('d0000000-0000-4000-8000-000000000001','Viva Tester','viva_tester','viva@example.com',
        'bcrypt-demo-hash',ARRAY['Netflix'],0);

-- 2. UPDATE: change a user's watch time after a completed episode
UPDATE "User"
SET "totalWatchMinutes" = "totalWatchMinutes" + 148
WHERE "email" = 'krish.demo@example.com';

-- 3. DELETE: remove the demonstration user if it exists
DELETE FROM "User" WHERE "username" = 'viva_tester';

-- 4. SELECT with filtering and sorting: find highly rated movies released after 2010
SELECT "title","releaseYear","avgRating","genres"
FROM "MediaItem"
WHERE "type" = 'MOVIE'
  AND "releaseYear" >= 2010
  AND "avgRating" >= 8
ORDER BY "avgRating" DESC,"title";

-- 5. Aggregate: total catalogue runtime by media type
SELECT "type",COUNT(*) AS media_count,
       ROUND(AVG("runtimeMinutes")::numeric,2) AS avg_runtime_minutes
FROM "MediaItem"
GROUP BY "type";

-- 6. GROUP BY and HAVING: members with at least two watchlist entries
SELECT u."name",COUNT(w."id") AS watchlist_count
FROM "User" u
JOIN "WatchlistEntry" w ON w."userId" = u."id"
GROUP BY u."id",u."name"
HAVING COUNT(w."id") >= 1
ORDER BY watchlist_count DESC;

-- 7. INNER JOIN: reviews with reviewer and media details
SELECT m."title",u."name" AS reviewer,r."rating",r."body",r."createdAt"
FROM "UserReview" r
JOIN "User" u ON u."id" = r."userId"
JOIN "MediaItem" m ON m."id" = r."mediaId"
ORDER BY r."rating" DESC,r."createdAt" DESC;

-- 8. JOIN and filtering: Netflix titles available in India
SELECT DISTINCT m."title",m."type",m."releaseYear"
FROM "MediaItem" m
JOIN "StreamingOption" s ON s."mediaId" = m."id"
WHERE s."platform" = 'Netflix' AND s."region" = 'IN'
ORDER BY m."title";

-- 9. Subquery: media titles without a review
SELECT m."title",m."releaseYear"
FROM "MediaItem" m
WHERE NOT EXISTS (
  SELECT 1 FROM "UserReview" r WHERE r."mediaId" = m."id"
)
ORDER BY m."title";

-- 10. Subquery and aggregate: highest-scored recommendation for each user
SELECT u."username",m."title",r."score",r."reason"
FROM "RecommendationLog" r
JOIN "User" u ON u."id" = r."userId"
JOIN "MediaItem" m ON m."id" = r."mediaId"
WHERE r."score" = (
  SELECT MAX(r2."score") FROM "RecommendationLog" r2 WHERE r2."userId" = r."userId"
)
ORDER BY u."username";

-- 11. Social group query: nominations and vote totals
SELECT g."name" AS group_name,m."title",i."status",i."voteCount",
       COUNT(v."id") AS recorded_votes
FROM "FriendGroup" g
JOIN "GroupWatchlistItem" i ON i."groupId" = g."id"
JOIN "MediaItem" m ON m."id" = i."mediaId"
LEFT JOIN "GroupPollVote" v ON v."groupItemId" = i."id"
GROUP BY g."name",m."title",i."status",i."voteCount"
HAVING i."voteCount" >= 1
ORDER BY recorded_votes DESC,i."voteCount" DESC;

-- 12. Episode progress: user progress and completion percentage
SELECT u."name",m."title",
       COUNT(ep."id") AS episodes_logged,
       m."totalEpisodes",
       ROUND(COUNT(ep."id") * 100.0 / NULLIF(m."totalEpisodes",0),2) AS percentage_complete
FROM "User" u
JOIN "EpisodeProgress" ep ON ep."userId" = u."id"
JOIN "MediaItem" m ON m."id" = ep."mediaId"
GROUP BY u."id",u."name",m."id",m."title",m."totalEpisodes"
ORDER BY u."name",m."title";
