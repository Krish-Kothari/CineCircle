
async function removeWatchlistItem(userId, mediaId) {
  return prisma.watchlistEntry.delete({
    where: {
      userId_mediaId: { userId, mediaId }
    }
  });
}

module.exports.removeWatchlistItem = removeWatchlistItem;
