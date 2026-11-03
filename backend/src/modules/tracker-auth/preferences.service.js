const prisma = require('../../config/prisma');

async function upsertUserPreferences(userId, { preferences = [], subscribedOTTs }) {
  return prisma.$transaction(async (tx) => {
    if (Array.isArray(subscribedOTTs)) {
      await tx.user.update({
        where: { id: userId },
        data: { subscribedOTTs }
      });
    }

    for (const item of preferences) {
      await tx.userGenrePreference.upsert({
        where: {
          userId_genre: {
            userId,
            genre: item.genre
          }
        },
        update: {
          weightScore: Number(item.weightScore)
        },
        create: {
          userId,
          genre: item.genre,
          weightScore: Number(item.weightScore)
        }
      });
    }

    return tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        subscribedOTTs: true,
        genrePreferences: {
          orderBy: { weightScore: 'desc' }
        }
      }
    });
  });
}

module.exports = {
  upsertUserPreferences
};
