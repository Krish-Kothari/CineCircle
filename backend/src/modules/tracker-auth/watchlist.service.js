const prisma = require('../../config/prisma');

async function upsertWatchlistItem(userId, { mediaId, status = 'PLAN_TO_WATCH', personalNotes }) {
  const media = await prisma.mediaItem.findUnique({ where: { id: mediaId } });
  if (!media) {
    const error = new Error('Media item not found');
    error.statusCode = 404;
    throw error;
  }

  const watchedEpisodes = status === 'COMPLETED' ? media.totalEpisodes : undefined;

  return prisma.watchlistEntry.upsert({
    where: {
      userId_mediaId: { userId, mediaId }
    },
    update: {
      status,
      ...(watchedEpisodes !== undefined ? { watchedEpisodes } : {}),
      ...(personalNotes !== undefined ? { personalNotes } : {})
    },
    create: {
      userId,
      mediaId,
      status,
      watchedEpisodes: status === 'COMPLETED' ? media.totalEpisodes : 0,
      personalNotes: personalNotes || null
    },
    include: {
      media: {
        include: { streamingOptions: true }
      }
    }
  });
}

async function getUserWatchlist(userId, statusFilter) {
  const whereClause = { userId };
  if (statusFilter) {
    whereClause.status = statusFilter.toUpperCase();
  }

  return prisma.watchlistEntry.findMany({
    where: whereClause,
    include: {
      media: {
        include: { streamingOptions: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

async function getUserWatchlistPage(userId, statusFilter, page = 1, limit = 20) {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const currentPage = Math.max(Number(page) || 1, 1);
  const whereClause = { userId };
  if (statusFilter) whereClause.status = statusFilter.toUpperCase();

  const [total, items] = await Promise.all([
    prisma.watchlistEntry.count({ where: whereClause }),
    prisma.watchlistEntry.findMany({
      where: whereClause,
      include: { media: { include: { streamingOptions: true } } },
      orderBy: { updatedAt: 'desc' },
      skip: (currentPage - 1) * take,
      take
    })
  ]);

  return {
    items,
    pagination: {
      page: currentPage,
      limit: take,
      total,
      totalPages: Math.ceil(total / take)
    }
  };
}

async function logEpisodeWatched(userId, { mediaId, seasonNumber = 1, episodeNumber }) {
  if (!mediaId || !episodeNumber) {
    const error = new Error('mediaId and episodeNumber are required');
    error.statusCode = 400;
    throw error;
  }

  const media = await prisma.mediaItem.findUnique({ where: { id: mediaId } });
  if (!media) {
    const error = new Error('Media item not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const existingEpisode = await tx.episodeProgress.findUnique({
      where: {
        userId_mediaId_seasonNumber_episodeNumber: {
          userId,
          mediaId,
          seasonNumber: Number(seasonNumber),
          episodeNumber: Number(episodeNumber)
        }
      }
    });

    const episodeLog = await tx.episodeProgress.upsert({
      where: {
        userId_mediaId_seasonNumber_episodeNumber: {
          userId,
          mediaId,
          seasonNumber: Number(seasonNumber),
          episodeNumber: Number(episodeNumber)
        }
      },
      update: { watchedAt: new Date() },
      create: {
        userId,
        mediaId,
        seasonNumber: Number(seasonNumber),
        episodeNumber: Number(episodeNumber)
      }
    });

    const totalLogged = await tx.episodeProgress.count({
      where: { userId, mediaId }
    });

    const newStatus = media.totalEpisodes && totalLogged >= media.totalEpisodes ? 'COMPLETED' : 'WATCHING';

    const watchlistEntry = await tx.watchlistEntry.upsert({
      where: { userId_mediaId: { userId, mediaId } },
      update: {
        watchedEpisodes: totalLogged,
        status: newStatus
      },
      create: {
        userId,
        mediaId,
        watchedEpisodes: totalLogged,
        status: newStatus
      }
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        totalWatchMinutes: { increment: existingEpisode ? 0 : (media.runtimeMinutes || 0) }
      }
    });

    return { episodeLog, watchlistEntry };
  });
}

module.exports = {
  upsertWatchlistItem,
  getUserWatchlist,
  getUserWatchlistPage,
  logEpisodeWatched
};
