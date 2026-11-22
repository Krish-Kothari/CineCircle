-- CineCircle PostgreSQL sample records
-- Run after the Prisma migration. Fixed UUIDs make the relationships reproducible.

INSERT INTO "User" (
  "id", "name", "username", "email", "passwordHash",
  "subscribedOTTs", "totalWatchMinutes"
) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Krish', 'krish_demo',
   'krish.demo@example.com', 'bcrypt-demo-hash', ARRAY['Netflix','Prime Video'], 148),
  ('10000000-0000-4000-8000-000000000002', 'Harsh', 'harsh_demo',
   'harsh.demo@example.com', 'bcrypt-demo-hash', ARRAY['Netflix','Disney+ Hotstar'], 0),
  ('10000000-0000-4000-8000-000000000003', 'Aryan', 'aryan_demo',
   'aryan.demo@example.com', 'bcrypt-demo-hash', ARRAY['Prime Video','JioCinema'], 0)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "UserGenrePreference" ("id","userId","genre","weightScore") VALUES
  ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Sci-Fi',10),
  ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','Thriller',9),
  ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','Drama',8)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "MediaItem" (
  "id","title","type","synopsis","releaseYear","runtimeMinutes","totalEpisodes",
  "genres","posterUrl","avgRating"
) VALUES
  ('30000000-0000-4000-8000-000000000001','Inception','MOVIE','A dream-thief receives a planting mission.',2010,148,NULL,
   ARRAY['Sci-Fi','Thriller','Action'],NULL,8.8),
  ('30000000-0000-4000-8000-000000000002','Stranger Things','TV_SHOW','Children uncover a secret parallel dimension.',2016,NULL,42,
   ARRAY['Sci-Fi','Mystery','Drama'],NULL,8.7)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "StreamingOption" ("id","mediaId","platform","region") VALUES
  ('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Netflix','IN'),
  ('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002','Netflix','IN')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "WatchlistEntry" (
  "id","userId","mediaId","status","watchedEpisodes","personalNotes","updatedAt"
) VALUES
  ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',
   '30000000-0000-4000-8000-000000000001','COMPLETED',1,'Watch again for hidden clues',CURRENT_TIMESTAMP),
  ('50000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',
   '30000000-0000-4000-8000-000000000002','WATCHING',5,'Keep up with the group',CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "EpisodeProgress" ("id","userId","mediaId","seasonNumber","episodeNumber","watchedAt") VALUES
  ('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',
   '30000000-0000-4000-8000-000000000002',1,1,CURRENT_TIMESTAMP),
  ('60000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',
   '30000000-0000-4000-8000-000000000002',1,2,CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "UserReview" ("id","userId","mediaId","rating","body","createdAt") VALUES
  ('70000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',
   '30000000-0000-4000-8000-000000000001',9,'Inventive and emotionally engaging.',CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "RecommendationLog" ("id","userId","mediaId","score","reason","createdAt") VALUES
  ('80000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',
   '30000000-0000-4000-8000-000000000002',0.92,'Matches Sci-Fi and Thriller preferences.',CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "FriendGroup" ("id","name","inviteCode","description","createdAt") VALUES
  ('90000000-0000-4000-8000-000000000001','Weekend Watchers','DEMO123','Friday watch-party squad',CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "GroupMember" ("id","groupId","userId","role","joinedAt") VALUES
  ('a0000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001',
   '10000000-0000-4000-8000-000000000001','ADMIN',CURRENT_TIMESTAMP),
  ('a0000000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000001',
   '10000000-0000-4000-8000-000000000002','MEMBER',CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "GroupWatchlistItem" (
  "id","groupId","mediaId","addedById","pitchNote","status","voteCount","createdAt"
) VALUES
  ('b0000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001',
   '30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001',
   'Great for a mystery binge','NOMINATED',1,CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "GroupPollVote" ("id","groupItemId","userId","votedAt") VALUES
  ('c0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',
   '10000000-0000-4000-8000-000000000002',CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
