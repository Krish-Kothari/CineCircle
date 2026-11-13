const prisma = require('../../config/prisma');
const { GROUP_ITEM_STATUS } = require('./groups.constants');

// ARYAN DE VIVA SHOWCASE: Multi-Table ACID Transaction that marks a squad nomination as WATCHED_TOGETHER
// and atomically syncs COMPLETED status + watch minutes across ALL squad members
async function completeSquadWatchPartyTransactional(groupId, groupItemId) {
  return prisma.$transaction(async (tx) => {
    const groupItem = await tx.groupWatchlistItem.findUnique({
      where: { id: groupItemId },
      include: { media: true }
    });

    if (!groupItem || groupItem.groupId !== groupId) {
      const error = new Error('Group watchlist nomination not found in this squad');
      error.statusCode = 404;
      throw error;
    }

    const updatedGroupItem = await tx.groupWatchlistItem.update({
      where: { id: groupItemId },
      data: { status: GROUP_ITEM_STATUS.WATCHED_TOGETHER },
      include: { media: true }
    });

    const members = await tx.groupMember.findMany({
      where: { groupId },
      select: { userId: true }
    });

    const totalMediaMinutes =
      groupItem.media.runtimeMinutes * Math.max(1, groupItem.media.totalEpisodes);

    for (const member of members) {
      await tx.watchlistEntry.upsert({
        where: {
          userId_mediaId: {
            userId: member.userId,
            mediaId: groupItem.mediaId
          }
        },
        update: {
          status: 'COMPLETED',
          watchedEpisodes: groupItem.media.totalEpisodes
        },
        create: {
          userId: member.userId,
          mediaId: groupItem.mediaId,
          status: 'COMPLETED',
          watchedEpisodes: groupItem.media.totalEpisodes,
          personalNotes: 'Watched together in Squad Watch Party!'
        }
      });

      await tx.user.update({
        where: { id: member.userId },
        data: {
          totalWatchMinutes: { increment: totalMediaMinutes }
        }
      });
    }

    return {
      updatedGroupItem,
      syncedMemberCount: members.length,
      minutesAddedPerMember: totalMediaMinutes
    };
  });
}

module.exports = { completeSquadWatchPartyTransactional };
