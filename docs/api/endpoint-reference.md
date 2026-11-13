# CineCircle Social Engine — Complete REST API Reference (ASD Evaluation)

## Module 1: Krish (`/api/tracker`) — Auth, Preferences & Personal Tracker
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tracker/auth/register` | Public | Register new user with `subscribedOTTs` array |
| `POST` | `/api/tracker/auth/login` | Public | Authenticate user and issue 7-day JWT bearer token |
| `GET` | `/api/tracker/users/profile` | Bearer | Fetch user profile, counts, and genre preferences |
| `PUT` | `/api/tracker/preferences/genres` | Bearer | Atomically upsert 1–10 genre affinity weights |
| `POST` | `/api/tracker/watchlist/upsert` | Bearer | Add or update movie/show status on personal watchlist |
| `GET` | `/api/tracker/watchlist/my-list` | Bearer | List user watchlist items filtered by `status` |
| `GET` | `/api/tracker/watchlist/continue-watching` | Bearer | SQL calculation of completion % and remaining minutes |
| `GET` | `/api/tracker/watchlist/export` | Bearer | Export personal watchlist in CSV or JSON format |
| `POST` | `/api/tracker/watchlist/log-episode` | Bearer | Log individual episode watched and increment watch time |
| `POST` | `/api/tracker/watchlist/complete-media` | Bearer | ACID transaction marking media completed and syncing minutes |
| `GET` | `/api/tracker/watchlist/stats` | Bearer | SQL `unnest(genres)`, `DATE_TRUNC` velocity, and milestones |
| `DELETE` | `/api/tracker/watchlist/:mediaId` | Bearer | Remove title from user watchlist |

## Module 2: Harsh (`/api/catalog`) — Multi-OTT Catalog, Reviews & SQL Recommender
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/catalog/search` | Public | Paginated catalog search by genre, type, rating, runtime |
| `GET` | `/api/catalog/time-match` | Public | Bayesian-ranked titles fitting within `maxMinutes` |
| `GET` | `/api/catalog/platform-stats` | Public | SQL `GROUP BY` distribution of titles and ratings per OTT |
| `GET` | `/api/catalog/by-platform/:ott` | Public | Filter catalog by Indian streaming platform |
| `GET` | `/api/catalog/recommendations/trending` | Public | Trending leaderboard ranked by active watchlist trackers |
| `GET` | `/api/catalog/recommendations/personal` | Bearer | Hybrid CTE SQL recommendations with OTT subscription bonus |
| `GET` | `/api/catalog/recommendations/collaborative` | Bearer | User-to-User Taste-Twin Collaborative Filtering SQL |
| `GET` | `/api/catalog/recommendations/history` | Bearer | Persisted `RecommendationLog` audit rows |
| `GET` | `/api/catalog/:id/details` | Public | Full media details, OTT links, reviews, and `&&` similar titles |
| `POST` | `/api/catalog/reviews/submit` | Bearer | ACID transaction upserting review, avgRating, and taste weight |
| `POST` | `/api/catalog/admin/create` | Bearer | Curator endpoint to publish new movies/shows and OTT links |

## Module 3: Aryan (`/api/groups`) — Friend Squads, Group Blend & Live Polls
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/groups/my-groups` | Bearer | List all friend squads joined by the authenticated user |
| `POST` | `/api/groups/create` | Bearer | Create a new squad with a unique 6-character invite code |
| `POST` | `/api/groups/join-by-code` | Bearer | Join an existing friend squad using its invite code |
| `GET` | `/api/groups/:id/feed` | Squad Member | Fetch squad roster, shared nominations, and poll counts |
| `GET` | `/api/groups/:id/blend-recs` | Squad Member | Multi-user **Group Blend** SQL set-intersection matchmaker |
| `POST` | `/api/groups/:id/polls/vote` | Squad Member | ACID poll vote with automatic majority quorum `TONIGHTS_PICK` lock |
| `POST` | `/api/groups/:id/polls/complete-party` | Squad Member | Multi-table ACID transaction syncing watch party across all members |
| `GET` | `/api/groups/:id/leaderboard` | Squad Member | SQL `RANK() OVER()` watch-time leaderboard |
| `GET` | `/api/groups/:id/compatibility` | Squad Member | SQL self-join pairwise taste compatibility % between members |
| `GET` | `/api/groups/:id/ott-coverage` | Squad Member | SQL `unnest(subscribedOTTs)` coverage across squad members |
| `GET` | `/api/groups/:id/activity` | Squad Member | SQL `UNION ALL` live activity stream of reviews and completions |
