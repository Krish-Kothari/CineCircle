# 7. Database and Backend Integration Evidence

## Runtime stack

The Express server mounts tracker, catalogue and social routes and uses Prisma as the PostgreSQL client:

- `backend/src/server.js` loads Express, JSON middleware and module routers.
- `backend/src/config/prisma.js` creates one `PrismaClient`.
- `backend/src/modules/*/*.service.js` converts HTTP operations into Prisma operations.
- Route handlers validate request inputs before database access.

## Feature-to-database evidence

| Feature | API | Service operation | Database tables |
|---|---|---|---|
| Register/login | `POST /api/tracker/auth/register`, `/login` | `auth.service.js` uses Prisma user create/find | `User` |
| Add or update watchlist | `POST /api/tracker/watchlist/upsert` | `upsert` on unique `(userId, mediaId)` | `WatchlistEntry`, `MediaItem` |
| Log episode | `POST /api/tracker/watchlist/log-episode` | `$transaction` creates progress, updates status and watch minutes | `EpisodeProgress`, `WatchlistEntry`, `User` |
| Browse/search catalogue | `GET /api/catalog` | Filtered `findMany` with streaming include and pagination | `MediaItem`, `StreamingOption` |
| Save/delete review | `/api/catalog/:id/reviews` | Prisma upsert/delete and average recalculation | `UserReview`, `MediaItem` |
| Create/join groups | `POST /api/groups/create`, `/join` | Creates and links `FriendGroup`/`GroupMember` | `FriendGroup`, `GroupMember` |
| Nominate and vote | `POST /api/groups/:id/watchlist`, `/polls/vote` | Group nomination/vote transactions | `GroupWatchlistItem`, `GroupPollVote` |

## Episode logging transaction

`logEpisodeWatched` in `backend/src/modules/tracker-auth/watchlist.service.js` demonstrates the integration pattern:

1. Verify the media exists.
2. Start a Prisma transaction.
3. Upsert an exact season/episode progress row.
4. Count progress rows for the user/media pair.
5. Upsert the watchlist status and `watchedEpisodes`.
6. Increment `User.totalWatchMinutes` only when the episode is logged for the first time.

This transaction prevents a partial update when one database operation fails.

## Review integrity

`upsertReview` uses `(userId, mediaId)` as one logical record, recalculates the media average and validates ratings between 1 and 10.

## API reflection check

After an application operation, the corresponding row is visible by reloading the API resource or by querying the backing PostgreSQL table. Prisma unique constraints and foreign keys ensure that invalid or duplicate input is rejected or safely upserted.
