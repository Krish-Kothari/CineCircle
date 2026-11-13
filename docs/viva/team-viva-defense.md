# CineCircle — Complete Viva Defense Cheat Sheet (Krish, Harsh, Aryan)

## 1. Equal Module Ownership Matrix (ASD + DE + AD)

| Member    | 4 PostgreSQL Tables (DE) | ACID Transaction (`prisma.$transaction`) | Raw SQL Showcase (`prisma.$queryRaw`) |
| :---      | :---                     | :---                                     | :---                                  |
| **Krish** | `User`, `UserGenrePreference`, `WatchlistEntry`, `EpisodeProgress` | `markMediaCompletedTransactional`: Atomically sets `COMPLETED`, calculates delta episodes, and increments `User.totalWatchMinutes`. | `unnest(m.genres)` watch-time breakdown + `DATE_TRUNC('week', watchedAt)` binge velocity + `user_watch_summary_view`. |
| **Harsh** | `MediaItem`, `StreamingAvailability`, `UserReview`, `RecommendationLog` | `submitReviewTransactional`: Atomically upserts review, recalculates `avgRating` & `ratingCount`, and boosts user genre weight. | Hybrid CTE Recommendation query with `subscribedOTTs` bonus + GIN array index (`&&`) for similar titles. |
| **Aryan** | `FriendGroup`, `GroupMember`, `GroupWatchlistItem`, `GroupPollVote` | `castGroupPollVoteTransactional`: Enforces `@@unique([groupItemId, userId])`, increments vote count, and auto-locks `TONIGHTS_PICK` at >50% quorum. | Multi-user **Group Blend** set intersection CTE + `RANK() OVER()` leaderboard + `UNION ALL` activity feed. |

## 2. Top 3 Examiner Questions & Ready Answers

1. **Q: How do you prevent race conditions or duplicate votes/reviews in PostgreSQL?**
   - **A:** We combine database-level composite unique constraints (`@@unique([userId, mediaId])` on `UserReview` and `@@unique([groupItemId, userId])` on `GroupPollVote`) with `prisma.$transaction()` blocks so aggregate counters (`avgRating`, `voteCount`, `totalWatchMinutes`) never drift out of sync.
2. **Q: How does "Group Blend" recommend a movie for a group of friends?**
   - **A:** In `blend.sql.js`, a 3-stage PostgreSQL CTE finds all members of the group, excludes any `mediaId` that *any* member has already marked `WATCHING` or `COMPLETED`, sums the overlapping `UserGenrePreference` weights across all members, and ranks unseen movies by their collective taste score.
3. **Q: How does Krish's React Native mobile app handle poor network connectivity?**
   - **A:** The mobile app caches the user's watchlist in `@react-native-async-storage/async-storage` (`storage.js`) for instant offline viewing and queues `+1 Episode` increments locally in `offlineQueue.js` to flush when connectivity returns.
