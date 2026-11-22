# 4. Final Database Schema

The implementation is defined in [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma) and deployed through [`migration.sql`](../backend/prisma/migrations/20261115052855_/migration.sql).

## Tables

| Table | Purpose | Important keys |
|---|---|---|
| `User` | Authentication and aggregate profile data | PK `id`; unique `username`, `email` |
| `UserGenrePreference` | User taste weights | FK `userId`; unique `(userId, genre)` |
| `WatchlistEntry` | Personal media status | FKs `userId`, `mediaId`; unique `(userId, mediaId)` |
| `EpisodeProgress` | Exact episode watches | FKs `userId`, `mediaId`; unique episode tuple |
| `MediaItem` | Movie/TV catalogue | PK `id`; indexed title/type/year |
| `StreamingOption` | Platform availability | FK `mediaId`; unique `(mediaId, platform, region)` |
| `UserReview` | Community score and text | FKs `userId`, `mediaId`; unique `(userId, mediaId)` |
| `RecommendationLog` | Recommendation history | FKs `userId`, `mediaId` |
| `FriendGroup` | Shared social group | PK `id`; unique `inviteCode` |
| `GroupMember` | Group membership | FKs `groupId`, `userId`; unique `(groupId, userId)` |
| `GroupWatchlistItem` | Group nominations | FKs `groupId`, `mediaId`, `addedById`; unique `(groupId, mediaId)` |
| `GroupPollVote` | One vote per member/item | FKs `groupItemId`, `userId`; unique `(groupItemId, userId)` |

## Constraints and validation

- PostgreSQL enums restrict `MediaType`, `WatchStatus` and `GroupRole`.
- Prisma/API validation restricts review ratings to integers `1` through `10`.
- Review bodies are limited to 1000 characters in the application.
- Unique constraints prevent duplicate identities, watchlist entries, genre preferences, streaming availability, memberships, reviews and poll votes.
- Cascades remove dependent personal or group records. `GroupWatchlistItem.addedById` uses `RESTRICT` to preserve source integrity.

## Data types

UUID-shaped text IDs are used by the migration. PostgreSQL `TEXT[]` stores user OTT subscriptions and media genres. Timestamps use `TIMESTAMP(3)` and ratings/scores use `DOUBLE PRECISION` where appropriate.
