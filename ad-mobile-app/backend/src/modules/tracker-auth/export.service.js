const prisma = require('../../config/prisma');

async function exportUserWatchlistData(userId, format = 'json') {
  const entries = await prisma.watchlistEntry.findMany({
    where: { userId },
    include: {
      media: {
        select: {
          title: true,
          type: true,
          releaseYear: true,
          genres: true,
          runtimeMinutes: true,
          totalEpisodes: true,
          avgRating: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  const formattedRows = entries.map((entry) => ({
    title: entry.media.title,
    type: entry.media.type,
    releaseYear: entry.media.releaseYear,
    status: entry.status,
    watchedEpisodes: entry.watchedEpisodes,
    totalEpisodes: entry.media.totalEpisodes,
    minutesWatched: entry.watchedEpisodes * entry.media.runtimeMinutes,
    personalNotes: entry.personalNotes || '',
    updatedAt: entry.updatedAt.toISOString()
  }));

  if (format.toLowerCase() === 'csv') {
    const headers = [
      'title',
      'type',
      'releaseYear',
      'status',
      'watchedEpisodes',
      'totalEpisodes',
      'minutesWatched',
      'personalNotes',
      'updatedAt'
    ];
    const csvLines = [
      headers.join(','),
      ...formattedRows.map((row) =>
        headers.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(',')
      )
    ];
    return { format: 'csv', content: csvLines.join('\n'), count: formattedRows.length };
  }

  return { format: 'json', items: formattedRows, count: formattedRows.length };
}

module.exports = { exportUserWatchlistData };
