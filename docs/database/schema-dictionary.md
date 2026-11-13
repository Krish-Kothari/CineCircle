# CineCircle — 12-Table PostgreSQL Schema & Index Dictionary (DE Evaluation)

## Normalization & Integrity Design (3NF)
- Every table uses UUID Primary Keys (`@default(uuid())`) and strict Foreign Key constraints (`ON DELETE CASCADE`) to prevent orphan records.
- Multi-valued attributes that require relational metadata (`UserGenrePreference`, `StreamingAvailability`, `WatchlistEntry`, `GroupMember`) are normalized into dedicated junction tables with **Composite Unique Constraints**.

## Table & Index Ownership Breakdown

| # | Table Name | Owner | Composite Unique Constraints | B-Tree / GIN Indexes |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `User` | Krish | `username`, `email` | `@@index([username, email])` |
| 2 | `UserGenrePreference` | Krish | `@@unique([userId, genre])` | `@@index([genre, weightScore])` |
| 3 | `WatchlistEntry` | Krish | `@@unique([userId, mediaId])` | `@@index([userId, status])` |
| 4 | `EpisodeProgress` | Krish | `@@unique([userId, mediaId, seasonNumber, episodeNumber])` | `@@index([userId, mediaId])` |
| 5 | `MediaItem` | Harsh | `id` | `@@index([type, avgRating])`, `GIN(genres)` |
| 6 | `StreamingAvailability` | Harsh | `@@unique([mediaId, platformName, region])` | `@@index([platformName, region])` |
| 7 | `UserReview` | Harsh | `@@unique([userId, mediaId])` | `@@index([mediaId, rating])` |
| 8 | `RecommendationLog` | Harsh | `id` | `@@index([userId, matchScore])` |
| 9 | `FriendGroup` | Aryan | `inviteCode` | Unique B-Tree on `inviteCode` |
| 10 | `GroupMember` | Aryan | `@@unique([groupId, userId])` | `@@index([userId])` |
| 11 | `GroupWatchlistItem` | Aryan | `@@unique([groupId, mediaId])` | `@@index([groupId, status, voteCount])` |
| 12 | `GroupPollVote` | Aryan | `@@unique([groupItemId, userId])` | Prevents duplicate poll voting at DB level |
