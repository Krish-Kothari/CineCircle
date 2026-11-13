CREATE OR REPLACE VIEW group_engagement_view AS
SELECT 
  fg.id AS group_id,
  fg.name AS group_name,
  fg."inviteCode",
  COUNT(DISTINCT gm."userId")::int AS member_count,
  COUNT(DISTINCT gwi.id)::int AS total_nominations,
  COUNT(DISTINCT gwi.id) FILTER (WHERE gwi.status = 'TONIGHTS_PICK')::int AS tonights_pick_count,
  COUNT(DISTINCT gpv.id)::int AS total_poll_votes
FROM "FriendGroup" fg
LEFT JOIN "GroupMember" gm ON gm."groupId" = fg.id
LEFT JOIN "GroupWatchlistItem" gwi ON gwi."groupId" = fg.id
LEFT JOIN "GroupPollVote" gpv ON gpv."groupItemId" = gwi.id
GROUP BY fg.id, fg.name, fg."inviteCode";


