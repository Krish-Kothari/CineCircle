-- KRISH DE VIVA SHOWCASE: Verify Composite B-Tree Index Scans on WatchlistEntry & EpisodeProgress

-- 1. Check Index Scan on WatchlistEntry(userId, status)
EXPLAIN ANALYZE
SELECT w.id, w.status, w."watchedEpisodes", m.title
FROM "WatchlistEntry" w
INNER JOIN "MediaItem" m ON m.id = w."mediaId"
WHERE w."userId" = (SELECT id FROM "User" LIMIT 1)
  AND w.status = 'WATCHING';

-- 2. Check Unique Index Scan on EpisodeProgress(userId, mediaId, seasonNumber, episodeNumber)
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM "EpisodeProgress"
WHERE "userId" = (SELECT id FROM "User" LIMIT 1);

-- 3. Benchmark unnest(genres) Watch-Time Aggregation
EXPLAIN ANALYZE
SELECT 
  unnest(m.genres) AS genre,
  SUM(w."watchedEpisodes" * m."runtimeMinutes") AS minutes_watched
FROM "WatchlistEntry" w
INNER JOIN "MediaItem" m ON m.id = w."mediaId"
GROUP BY genre
ORDER BY minutes_watched DESC;
