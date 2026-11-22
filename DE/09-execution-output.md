# 9. Query Execution Evidence

Execution date: 22 November 2026  
Database: configured CineCircle PostgreSQL database  
Connection method: Prisma's `$queryRawUnsafe` in `backend/src/config/prisma.js`

The read/write statements below were executed against the configured database. Values may change after later seeds or application activity.

## 1. INSERT

Output for inserting `viva_tester`:

```json
[
  {
    "id": "d0000000-0000-4000-8000-000000000001",
    "username": "viva_tester",
    "email": "viva@example.com"
  }
]
```

The row was inserted and then removed by Query 3.

## 2. UPDATE

The update added 148 minutes to `krish@nst.edu`:

```json
[
  {
    "username": "krish_dev",
    "totalWatchMinutes": 148
  }
]
```

## 3. DELETE

Deleting the inserted demonstration user returned:

```json
[
  {
    "username": "viva_tester"
  }
]
```

## 4. FILTER and SORT

```json
[
  {"title":"Parasite","releaseYear":2019,"avgRating":9,"genres":["Thriller","Drama"]},
  {"title":"Interstellar","releaseYear":2014,"avgRating":8.5,"genres":["Sci-Fi","Drama"]},
  {"title":"Dangal","releaseYear":2016,"avgRating":8,"genres":["Drama","Sport"]},
  {"title":"Drishyam","releaseYear":2015,"avgRating":8,"genres":["Thriller","Mystery","Drama"]}
]
```

The result confirms filtering by type/year/rating and descending rating sorting.

## 5. AGGREGATE

```json
[
  {"type":"TV_SHOW","media_count":7,"avg_runtime_minutes":null},
  {"type":"MOVIE","media_count":9,"avg_runtime_minutes":"154.33"}
]
```

TV shows have no movie runtime values, so their average runtime is `null`.

## 6. GROUP BY and HAVING

```json
[
  {"name":"Krish","watchlist_count":2},
  {"name":"Kkk","watchlist_count":1}
]
```

## 7. JOIN and reviews

A sample top result was:

```json
[
  {"title":"Breaking Bad","reviewer":"Test C","rating":10,"body":null},
  {"title":"Dark","reviewer":"Krish","rating":9,"body":null},
  {"title":"Parasite","reviewer":"Test B","rating":9,"body":null}
]
```

The full execution joined `UserReview`, `User` and `MediaItem`, ordered by rating descending.

## 8. Streaming JOIN

The Netflix/IN result included `3 Idiots`, `Andhadhun`, `Breaking Bad`, `Dangal`, `Dark`, `Inception`, `Money Heist`, `Sacred Games`, `Stranger Things`, and `The Dark Knight`.

## 9. NOT EXISTS subquery

Media titles with no review included:

```json
[
  {"title":"Andhadhun","releaseYear":2018},
  {"title":"Mirzapur","releaseYear":2018},
  {"title":"The Family Man","releaseYear":2019},
  {"title":"Zindagi Na Milegi Dobara","releaseYear":2011}
]
```

## 10. Highest recommendation

```json
[
  {"username":"kkk","title":"Breaking Bad","score":0.3,"reason":"Highly rated by the community"},
  {"username":"krish_dev","title":"Inception","score":0.996,"reason":"Matches your Sci-Fi & Thriller taste"}
]
```

## 11. Group nomination and vote

```json
[
  {"group_name":"NST Weekend Watchers","title":"3 Idiots","status":"NOMINATED","voteCount":1,"recorded_votes":1},
  {"group_name":"NST Weekend Watchers","title":"Andhadhun","status":"NOMINATED","voteCount":1,"recorded_votes":1}
]
```

## 12. Episode progress

```json
[
  {"name":"Kkk","title":"Dark","episodes_logged":1,"totalEpisodes":26,"percentage_complete":"3.85"}
]
```

## Verification run

Before the submission, the database was reachable and reported 16 media items.
