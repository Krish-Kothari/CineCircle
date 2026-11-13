const prisma = require('../src/config/prisma');
const { castGroupPollVoteTransactional } = require('../src/modules/social-groups/polls.transaction');
const { completeSquadWatchPartyTransactional } = require('../src/modules/social-groups/consensus.transaction');

async function simulateSquadConcurrency() {
  console.log('=== CineCircle Concurrent Poll Quorum & Watch Party Simulation ===');

  const group = await prisma.friendGroup.findFirst({
    include: {
      members: true,
      sharedList: true
    }
  });

  if (!group || group.sharedList.length === 0) {
    console.log('No squad or shared list found. Run npm run prisma:seed first.');
    process.exit(0);
  }

  const groupItem = group.sharedList[0];
  console.log(`Testing Squad: "${group.name}" with ${group.members.length} members`);
  console.log(`Target Nomination: "${groupItem.mediaId}" (Current Votes: ${groupItem.voteCount})`);

  // Clear existing votes for this nomination to simulate fresh live voting
  await prisma.groupPollVote.deleteMany({
    where: { groupItemId: groupItem.id }
  });
  await prisma.groupWatchlistItem.update({
    where: { id: groupItem.id },
    data: { voteCount: 0, status: 'NOMINATED' }
  });

  console.log('Simulating concurrent votes from squad members...');

  const votePromises = group.members.map((member) =>
    castGroupPollVoteTransactional(group.id, member.userId, groupItem.id)
      .then((res) => ({ user: member.userId, success: true, quorumReached: res.quorumReached }))
      .catch((err) => ({ user: member.userId, success: false, error: err.message }))
  );

  const results = await Promise.all(votePromises);
  console.table(results);

  const updatedItem = await prisma.groupWatchlistItem.findUnique({
    where: { id: groupItem.id }
  });
  console.log(`Post-Voting Status: "${updatedItem.status}" (Total Votes: ${updatedItem.voteCount})`);

  if (updatedItem.status === 'TONIGHTS_PICK') {
    console.log('Quorum met! Executing multi-table Watch Party ACID Completion Transaction...');
    const completeRes = await completeSquadWatchPartyTransactional(group.id, groupItem.id);
    console.log(`Watch Party Completed! Synced +${completeRes.minutesAddedPerMember} mins across ${completeRes.syncedMemberCount} members.`);
  }

  await prisma.$disconnect();
}

simulateSquadConcurrency().catch((err) => {
  console.error(err);
  process.exit(1);
});
