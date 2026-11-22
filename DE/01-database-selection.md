# 1. Database Selection and Justification

## Selected database

CineCircle uses **PostgreSQL**, accessed by Node.js/Express through Prisma.

## Nature of the data

The application stores connected records with strong ownership and cardinality:

- Users own watchlist entries, episode logs, genre preferences, reviews and recommendations.
- Media titles have streaming options, reviews and group nominations.
- Friend groups contain members, shared watchlist items and poll votes.
- Episode progress and poll participation are time-ordered events.

## Why PostgreSQL is suitable

1. **Referential integrity:** Foreign keys prevent watchlist, review, membership and vote records from surviving a deleted parent.
2. **Complex relationships:** User-to-media and group-to-media relationships require many-to-many modelling, not isolated documents.
3. **ACID transactions:** Episode logging atomically updates episode progress, watch status and user watch minutes.
4. **Constraints:** Enum types, unique constraints and composite keys prevent duplicate watchlist entries and duplicate poll votes.
5. **Advanced querying:** Joins, aggregates, window-style analytics and HAVING clauses support catalogue, social and recommendation features.
6. **Backend fit:** Prisma generates a typed client for Express and migrations provide repeatable deployment.

PostgreSQL arrays are used for small, title-level `genres` and user-level `subscribedOTTs`. This is appropriate because order is not important and related genre data does not require separate metadata. Long-lived facts about membership and review attribution remain relational.
