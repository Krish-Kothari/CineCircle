const prisma = require('../src/config/prisma');

async function verifyAllModules() {
  console.log('=== CineCircle 12-Table DE & ASD Verification Report ===');

  const counts = {
    // Krish's 4 Tables
    User: await prisma.user.count(),
    UserGenrePreference: await prisma.userGenrePreference.count(),
    WatchlistEntry: await prisma.watchlistEntry.count(),
    EpisodeProgress: await prisma.episodeProgress.count(),

    // Harsh's 4 Tables
    MediaItem: await prisma.mediaItem.count(),
    StreamingAvailability: await prisma.streamingAvailability.count(),
    UserReview: await prisma.userReview.count(),
    RecommendationLog: await prisma.recommendationLog.count(),

    // Aryan's 4 Tables
    FriendGroup: await prisma.friendGroup.count(),
    GroupMember: await prisma.groupMember.count(),
    GroupWatchlistItem: await prisma.groupWatchlistItem.count(),
    GroupPollVote: await prisma.groupPollVote.count()
  };

  console.table(counts);
  await prisma.$disconnect();
}

verifyAllModules().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

