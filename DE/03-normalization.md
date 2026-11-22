# 3. Normalization Analysis

## Starting assumptions

A single flat CineCircle record could repeat user identity, media title, group membership, platform availability and review values. This would create update anomalies and duplicate user/title/platform data.

## First Normal Form (1NF)

All tables use atomic scalar attributes. Repeating groups are removed:

- One `UserGenrePreference` row per user and genre.
- One `StreamingOption` row per media, platform and region.
- One `EpisodeProgress` row per user, media, season and episode.
- One `GroupMember` row per group and user.
- One `GroupPollVote` row per nominated item and voter.

The PostgreSQL `TEXT[]` columns are multi-valued but stored as arrays of atomic text values. They are suitable for `subscribedOTTs` and `genres`, and they are not used as the primary key or join key.

## Second Normal Form (2NF)

Every non-key attribute depends on the complete primary key:

- `WatchlistEntry.status`, notes and progress depend on the entry's `(userId, mediaId)` uniqueness.
- `EpisodeProgress.watchedAt` depends on `(userId, mediaId, seasonNumber, episodeNumber)`.
- `GroupMember.role` depends on `(groupId, userId)`.
- `GroupPollVote.votedAt` depends on `(groupItemId, userId)`.

Entity IDs prevent partial-dependency problems in join records.

## Third Normal Form (3NF)

Non-key attributes do not depend on other non-key attributes:

- Streaming availability is independent of media title content and stored in `StreamingOption`.
- Reviews store `rating` and `body` with foreign keys to `User` and `MediaItem`, not copied names.
- Group membership stores only role and timestamps in `GroupMember`; group and user names remain in their own tables.
- User watch totals are maintained as a derived aggregate in `User.totalWatchMinutes`; the source event remains in `EpisodeProgress`.

## Functional dependencies

Examples include:

- `username -> name, email, passwordHash`
- `mediaId -> title, type, synopsis, releaseYear, runtimeMinutes, totalEpisodes`
- `(userId, mediaId) -> status, watchedEpisodes, personalNotes, updatedAt`
- `(userId, mediaId, seasonNumber, episodeNumber) -> watchedAt`
- `(groupId, userId) -> role, joinedAt`
- `(groupItemId, userId) -> votedAt`
- `inviteCode -> FriendGroup.id` (unique lookup)

## Anomalies prevented

- Updating a platform must not be duplicated in every media row.
- Renaming a group or user updates one entity row.
- Deleting a user cascades its personal records but does not delete shared media or group entities.
