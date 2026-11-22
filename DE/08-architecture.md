# 8. Database Architecture and Performance

## Architecture

```text
React Native / Web client
          |
      Express API
          |
  Prisma ORM / PrismaClient
          |
     PostgreSQL
```

The API is the only application-facing database boundary. Controllers validate input, services execute Prisma operations, and PostgreSQL enforces constraints and relationships.

## Data integrity

- Enum types prevent invalid media, watch and member-role values.
- Unique constraints prevent duplicate identities and logical pairs.
- Foreign keys prevent orphan personal, media, group and poll records.
- Cascade deletes remove records owned by deleted users/groups/media.
- Prisma/API validation rejects out-of-range ratings and malformed required fields.
- Transactions protect dependent updates such as episode logging.

## Index strategy

| Access pattern | Index |
|---|---|
| Login/lookup by username or email | Unique indexes and `(username,email)` composite index |
| Genre preference lookup | Unique `(userId,genre)`; `(genre,weightScore)` |
| Watchlist per user/status | `(userId,status)` and unique `(userId,mediaId)` |
| Episode history | `(userId,mediaId)` and unique episode tuple |
| Catalogue title/search | `title` and `(type,releaseYear)` |
| Platform availability | `(platform)` and unique `(mediaId,platform,region)` |
| Review lookup | `mediaId` and unique `(userId,mediaId)` |
| Recommendation history | `(userId,createdAt)` |
| Group membership/nominations | `(userId)`, group/status/vote indexes |

Arrays can support application filtering, but an array is not used as a join key. Production-specific GIN indexes may be added for `genres` if catalogue volume makes array containment searches dominant.

## Scaling

Indexes reduce common lookup cost as rows increase. Server-side pagination limits result transfer. Composite unique constraints avoid write-time duplicate processing. Prisma transactions keep cross-table updates consistent.

For higher volume:

- Partition large event tables by date if episode/recommendation history grows significantly.
- Cache popular catalogue/search responses.
- Schedule periodic recalculation of denormalized values such as `avgRating` and `voteCount`.
- Add read replicas for reporting and catalogue traffic.
- Replace `GroupWatchlistItem.voteCount` maintenance with an aggregate over `GroupPollVote` if strict consistency is required; the current counter is a performance-oriented cache and remains tied to one vote per item/member.
