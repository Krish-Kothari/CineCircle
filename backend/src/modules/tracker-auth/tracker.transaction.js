const prisma = require('../../config/prisma');

// KRISH DE VIVA SHOWCASE: ACID Transaction for Completing Media & Syncing Watch Time
async function markMediaCompletedTransactional(userId, mediaId) {
  return prisma.$transaction(async (tx) => {
    const media = await tx.mediaItem.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      const error = new Error('Media item not found');
      error.statusCode = 404;
      throw error;
    }

    const existingEntry = await tx.watchlistEntry.findUnique({
      where: {
        userId_mediaId: { userId, mediaId }
      }
    });

    const previouslyWatched = existingEntry ? existingEntry.watchedEpisodes : 0;
    const remainingEpisodes = Math.max(0, media.totalEpisodes - previouslyWatched);
    const addedWatchMinutes = remainingEpisodes * media.runtimeMinutes;

    const updatedWatchlist = await tx.watchlistEntry.upsert({
      where: {
        userId_mediaId: { userId, mediaId }
      },
      update: {
        status: 'COMPLETED',
        watchedEpisodes: media.totalEpisodes
      },
      create: {
        userId,
        mediaId,
        status: 'COMPLETED',
        watchedEpisodes: media.totalEpisodes
      },
      include: { media: true }
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        totalWatchMinutes: { increment: addedWatchMinutes }
      },
      select: {
        id: true,
        username: true,
        totalWatchMinutes: true
      }
    });

    return {
      watchlistEntry: updatedWatchlist,
      addedWatchMinutes,
      totalWatchMinutes: updatedUser.totalWatchMinutes
    };
  });
}

module.exports = { markMediaCompletedTransactional };
