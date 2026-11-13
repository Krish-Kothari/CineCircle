const prisma = require('../../config/prisma');

// Allows a squad member to recommend a specific title directly to the squad watchlist with a personal tag
async function recommendTitleToSquadFriend(groupId, senderId, { mediaId, targetUsername, note }) {
  const media = await prisma.mediaItem.findUnique({ where: { id: mediaId } });
  if (!media) {
    const error = new Error('Media item not found');
    error.statusCode = 404;
    throw error;
  }

  const pitchNote = targetUsername
    ? `@${targetUsername}: ${note || 'You have to watch this!'}`
    : note || 'Recommended for our squad!';

  return prisma.groupWatchlistItem.upsert({
    where: {
      groupId_mediaId: { groupId, mediaId }
    },
    update: {
      pitchNote,
      voteCount: { increment: 1 }
    },
    create: {
      groupId,
      mediaId,
      addedById: senderId,
      pitchNote,
      voteCount: 1,
      votes: {
        create: [{ userId: senderId }]
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

module.exports = { recommendTitleToSquadFriend };