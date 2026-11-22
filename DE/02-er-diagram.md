# 2. ER Diagram and Data Model

## Entity relationship diagram

```mermaid
erDiagram
    User ||--o{ UserGenrePreference : chooses
    User ||--o{ WatchlistEntry : tracks
    User ||--o{ EpisodeProgress : logs
    User ||--o{ UserReview : writes
    User ||--o{ RecommendationLog : receives
    User ||--o{ GroupMember : joins
    User ||--o{ GroupWatchlistItem : adds
    User ||--o{ GroupPollVote : casts

    MediaItem ||--o{ StreamingOption : available_on
    MediaItem ||--o{ WatchlistEntry : appears_in
    MediaItem ||--o{ EpisodeProgress : has
    MediaItem ||--o{ UserReview : receives
    MediaItem ||--o{ RecommendationLog : is_recommended
    MediaItem ||--o{ GroupWatchlistItem : nominated_as

    FriendGroup ||--o{ GroupMember : contains
    FriendGroup ||--o{ GroupWatchlistItem : has
    GroupWatchlistItem ||--o{ GroupPollVote : receives

    User {
        text id PK
        text name
        text username UK
        text email UK
        text passwordHash
        text_array subscribedOTTs
        int totalWatchMinutes
        datetime createdAt
    }
    UserGenrePreference {
        text id PK
        text userId FK
        text genre
        int weightScore
    }
    WatchlistEntry {
        text id PK
        text userId FK
        text mediaId FK
        enum status
        int watchedEpisodes
        text personalNotes
        datetime updatedAt
    }
    EpisodeProgress {
        text id PK
        text userId FK
        text mediaId FK
        int seasonNumber
        int episodeNumber
        datetime watchedAt
    }
    MediaItem {
        text id PK
        text title
        enum type
        text synopsis
        int releaseYear
        int runtimeMinutes
        int totalEpisodes
        text_array genres
        text posterUrl
        float avgRating
        datetime createdAt
    }
    StreamingOption {
        text id PK
        text mediaId FK
        text platform
        text region
    }
    UserReview {
        text id PK
        text userId FK
        text mediaId FK
        int rating
        text body
        datetime createdAt
    }
    RecommendationLog {
        text id PK
        text userId FK
        text mediaId FK
        float score
        text reason
        datetime createdAt
    }
    FriendGroup {
        text id PK
        text name
        text inviteCode UK
        text description
        datetime createdAt
    }
    GroupMember {
        text id PK
        text groupId FK
        text userId FK
        enum role
        datetime joinedAt
    }
    GroupWatchlistItem {
        text id PK
        text groupId FK
        text mediaId FK
        text addedById FK
        text pitchNote
        text status
        int voteCount
        datetime createdAt
    }
    GroupPollVote {
        text id PK
        text groupItemId FK
        text userId FK
        datetime votedAt
    }
```

## Relationships

- **One-to-one:** no direct optional single-row pair is required. The unique `(userId, mediaId)` reviews and watchlist entries act as one current entry per user/media pair.
- **One-to-many:** a user has many watchlist entries, reviews and preferences; a media title has many reviews and streaming options.
- **Many-to-many:** users and media are linked by watchlists and reviews. Users and friend groups are linked by `GroupMember`; users and group nominations are linked by `GroupPollVote`.
