const prisma = require('../../config/prisma');

async function getGroupFeedById(groupId) {
  const group = await prisma.friendGroup.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              subscribedOTTs: true,
              totalWatchMinutes: true
            }
          }
        },
        orderBy: { joinedAt: 'asc' }
      },
      sharedList: {
        include: {
          media: {
            include: {
              streamingOptions: true
            }
          },
          addedBy: {
            select: { id: true, name: true, username: true }
          },
          votes: {
            select: { userId: true }
          }
        },
        orderBy: [{ voteCount: 'desc' }, { createdAt: 'desc' }]
      }
    }
  });

  if (!group) {
    const error = new Error('Friend group not found');
    error.statusCode = 404;
    throw error;
  }

  return group;
}

async function nominateMediaToGroup(groupId, userId, { mediaId, pitchNote }) {
  return prisma.groupWatchlistItem.create({
    data: {
      groupId,
      mediaId,
      addedById: userId,
      pitchNote: pitchNote || '',
      voteCount: 1,
      votes: {
        create: [{ userId }]
      }
    },
    include: {
      media: true,
      addedBy: {
        select: { id: true, name: true, username: true }
      }
    }
  });
}

module.exports = {
  getGroupFeedById,
  nominateMediaToGroup
};
