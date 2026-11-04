-- KRISH DE VIVA SHOWCASE: Materialized/Logical View for User Watch-Time & Completion Ratios
CREATE OR REPLACE VIEW user_watch_summary_view AS
SELECT 
  u.id AS user_id,
  u.username,
  u."totalWatchMinutes",
  ROUND((u."totalWatchMinutes" / 60.0)::numeric, 1) AS total_watch_hours,
  COUNT(w.id)::int AS total_watchlist_items,
  COUNT(w.id) FILTER (WHERE w.status = 'COMPLETED')::int AS completed_items,
  COUNT(w.id) FILTER (WHERE w.status = 'WATCHING')::int AS currently_watching,
  COUNT(w.id) FILTER (WHERE w.status = 'PLAN_TO_WATCH')::int AS planned_items
FROM "User" u
LEFT JOIN "WatchlistEntry" w ON w."userId" = u.id
GROUP BY u.id, u.username, u."totalWatchMinutes";
