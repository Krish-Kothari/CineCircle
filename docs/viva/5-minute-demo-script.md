# CineCircle — 5-Minute Live Faculty Evaluation Script

## Pre-Demo Terminal Setup (Run 5 Minutes Before Viva)
1. **Terminal 1 (Backend):** `cd backend && npm run preflight && npm run dev`
2. **Terminal 2 (Web Portal):** `cd web-frontend && npm run dev`
3. **Terminal 3 (Mobile App — Krish):** `cd ad-mobile-app && npx expo start`

---

## Minute 0:00 – 1:30 | Harsh: Multi-OTT Catalog, GIN FTS & Hybrid SQL Recommender
1. Open `http://localhost:5173` and click **"Use Krish Account"** in the top Demo Switcher.
2. Click **"Generate My SQL Recommendations"** on the Catalog page to show the **Hybrid CTE Score + Subscribed OTT Bonus (+12 pts)**.
3. Toggle **"PostgreSQL Full-Text Search (tsvector & tsquery)"**, search `"wormhole"`, and open **Algo Compare** (`/compare-recs`) to show Hybrid vs. Taste-Twin Collaborative vs. Trending Velocity side-by-side.

## Minute 1:30 – 3:00 | Krish: Personal Kanban, ACID Watch-Time Sync & React Native Mobile App
1. Open **Watchlist** (`/watchlist`) to show the **Continue Watching SQL Banner**, **Target Completion Feasibility**, and 4-column Kanban board.
2. Click **"Complete"** on an active show to trigger `markMediaCompletedTransactional` (`prisma.$transaction`) and show `totalWatchMinutes` incrementing atomically in **SQL Stats** (`/analytics`).
3. Show the **React Native Mobile App** on Expo: demonstrate the **5 tabs**, **Offline Watchlist Cache**, and **Live Classroom LAN IP Switcher**.

## Minute 3:00 – 4:30 | Aryan: Friend Squads, Quorum Poll Auto-Lock & Group Blend SQL
1. Open **Squad Blend** (`/squads`) and enter **"NST Weekend Watchers"** (`NST202`).
2. Show the **Group Blend Matchmaker** (unseen titles matching all 3 members' genre weights) and apply a **Squad Genre Veto** (`+ Veto Horror`).
3. Cast a vote on the **Watch Tonight Poll** to cross the >50% majority threshold—show the green **`TONIGHTS_PICK` Quorum Banner** locking automatically, then click **"Complete Watch Party"** to sync watch minutes across all 3 squad members in a single ACID transaction.

## Minute 4:30 – 5:00 | Live Database Proof (`/viva-diagnostics`)
1. Click **DB Diagnostics** (`/viva-diagnostics`) in the navbar to show the examiner live output from `pg_stat_user_tables` and `pg_indexes`.
