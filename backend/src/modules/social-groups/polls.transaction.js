const prisma = require('../../config/prisma');
const { GROUP_ITEM_STATUS } = require('./groups.constants');

async function castGroupPollVoteTransactional(groupId, userId, groupItemId) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.groupWatchlistItem.findUnique({
      where: { id: groupItemId }
    });

    if (!item || item.groupId !== groupId) {
      const error = new Error('Nominated watchlist item not found in this squad');
      error.statusCode = 404;
      throw error;
    }

    // Composite unique constraint @@unique([groupItemId, userId]) prevents double voting
    await tx.groupPollVote.create({
      data: {
        groupItemId,
        userId
      }
    });

    const updatedItem = await tx.groupWatchlistItem.update({
      where: { id: groupItemId },
      data: {
        voteCount: { increment: 1 }
      },
      include: { media: true }
    });

    const totalMembers = await tx.groupMember.count({
      where: { groupId }
    });

    const majorityThreshold = Math.floor(totalMembers / 2) + 1;
    let quorumReached = false;

    if (updatedItem.voteCount >= majorityThreshold && updatedItem.status === GROUP_ITEM_STATUS.NOMINATED) {
      await tx.groupWatchlistItem.update({
        where: { id: groupItemId },
        data: { status: GROUP_ITEM_STATUS.TONIGHTS_PICK }
      });
      updatedItem.status = GROUP_ITEM_STATUS.TONIGHTS_PICK;
      quorumReached = true;
    }

    return {
      updatedItem,
      totalMembers,
      majorityThreshold,
      quorumReached
    };
  });
}

async function markGroupItemWatchedTogether(groupId, groupItemId) {
  return prisma.groupWatchlistItem.update({
    where: { id: groupItemId },
    data: { status: GROUP_ITEM_STATUS.WATCHED_TOGETHER },
    include: { media: true }
  });
}

module.exports = {
  castGroupPollVoteTransactional,
  markGroupItemWatchedTogether
};
