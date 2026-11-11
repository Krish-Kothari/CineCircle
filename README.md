# CineCircle (v1.0.0)

Full-Stack Movie & Show Recommendation, Personal Binge Tracking, and Multi-User Social Squad Blend Platform.

---

## 1. Subject & Tech Stack Mapping

| Subject | Technologies Used | Core Highlights |
| :--- | :--- | :--- |
| **Database Engineering (DE)** | **PostgreSQL** + **Prisma ORM** | 12 Normalized 3NF Tables, 3 ACID Transactions (`$transaction`), GIN Array & Full-Text Indexes, 3 SQL Views, 15+ Raw SQL CTE & Window Analytics Queries (`$queryRaw`) |
| **Application Software Dev (ASD)** | **Node.js**, **Express.js**, **React.js (Vite)** | 32 Modular REST API Endpoints, JWT Auth, Sliding-Window Rate Limiter, XSS Sanitizer, Multi-Account Live Demo Web Portal |
| **Application Development (AD)** | **React Native (Expo)** | Touch-First Mobile Client, `AsyncStorage` Offline Watchlist Cache, Offline Episode Sync Queue, Native OTT Deep-Linking |

---

## 2. Equal 3-Way Team Ownership (Krish, Harsh, Aryan)

| Member | Backend & DE Module (`backend/src/modules/`) | 4 PostgreSQL Tables Owned | ACID Transaction & Flagship SQL Engines |
| :--- | :--- | :--- | :--- |
| **Krish** | `tracker-auth/` + `ad-mobile-app/` (AD) | `User`, `UserGenrePreference`, `WatchlistEntry`, `EpisodeProgress` | **ACID:** `markMediaCompletedTransactional`<br>**SQL:** `unnest(genres)` breakdown, `DATE_TRUNC` velocity, Binge Pacing, Churn Alerts, Monthly Wrapped, Live DB Diagnostics |
| **Harsh** | `catalog-recs/` | `MediaItem`, `StreamingAvailability`, `UserReview`, `RecommendationLog` | **ACID:** `submitReviewTransactional` (Atomic rating recalculation + taste learning)<br>**SQL:** Hybrid CTE Recommender, Taste-Twin Collaborative Filtering, Bayesian Time-Budget Matcher, GIN Full-Text Search, OTT ROI Optimizer |
| **Aryan** | `social-groups/` | `FriendGroup`, `GroupMember`, `GroupWatchlistItem`, `GroupPollVote` | **ACID:** `castGroupPollVoteTransactional` (Quorum auto-lock) & `completeSquadWatchPartyTransactional`<br>**SQL:** Multi-User **Group Blend** CTE, `RANK()` Leaderboard, `UNION ALL` Activity Feed, Pairwise Compatibility, Debate Volatility |

---

## 3. Quick-Start & Debugging Commands

```bash
# 1. Backend Setup, Migration, Seed & Pre-Flight Verification
cd backend
npm install
npx prisma migrate dev
npm run prisma:seed
npm run preflight
npm test
npm run dev

# 2. Companion Web Portal (http://localhost:5173)
cd ../web-frontend
npm install
npm run dev

# 3. React Native Mobile App (Expo)
cd ../ad-mobile-app
npm install
npx expo start