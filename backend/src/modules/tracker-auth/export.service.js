const prisma = require('../../config/prisma');

async function exportUserWatchlistData(userId, format = 'json') {
  const entries = await prisma.watchlistEntry.findMany({
    where: { userId },
    include: { media: { select: { title: true, type: true, releaseYear: true, runtimeMinutes: true, totalEpisodes: true } } },
    orderBy: { updatedAt: 'desc' }
  });
  const items = entries.map((entry) => ({
    title: entry.media.title, type: entry.media.type, releaseYear: entry.media.releaseYear,
    status: entry.status, watchedEpisodes: entry.watchedEpisodes, totalEpisodes: entry.media.totalEpisodes,
    minutesWatched: entry.watchedEpisodes * (entry.media.runtimeMinutes || 0),
    personalNotes: entry.personalNotes || '', updatedAt: entry.updatedAt.toISOString()
  }));
  if (format.toLowerCase() !== 'csv') return { format: 'json', items, count: items.length };
  const headers = Object.keys(items[0] || { title: '', type: '', releaseYear: '', status: '', watchedEpisodes: '', totalEpisodes: '', minutesWatched: '', personalNotes: '', updatedAt: '' });
  const content = [headers.join(','), ...items.map((item) =>
    headers.map((header) => `"${String(item[header] ?? '').replace(/"/g, '""')}"`).join(',')
  )].join('\n');
  return { format: 'csv', content, count: items.length };
}

module.exports = { exportUserWatchlistData };
