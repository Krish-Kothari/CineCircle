const prisma = require('../../config/prisma');

// Recompute MediaItem.avgRating from all reviews (1 decimal), inside the same transaction
async function recalcAvgRating(tx, mediaId) {
  const agg = await tx.userReview.aggregate({
    where: { mediaId },
    _avg: { rating: true }
  });
  const avg = agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0;
  await tx.mediaItem.update({ where: { id: mediaId }, data: { avgRating: avg } });
  return avg;
}

async function upsertReview(userId, mediaId, { rating, body }) {
  return prisma.$transaction(async (tx) => {
    const media = await tx.mediaItem.findUnique({
      where: { id: mediaId },
      select: { id: true }
    });
    if (!media) return null;

    const review = await tx.userReview.upsert({
      where: { userId_mediaId: { userId, mediaId } },
      update: { rating, body: body ?? null },
      create: { userId, mediaId, rating, body: body ?? null }
    });

    const mediaAvgRating = await recalcAvgRating(tx, mediaId);
    return { ...review, mediaAvgRating };
  });
}

async function listReviews(mediaId, { page, limit }) {
  const media = await prisma.mediaItem.findUnique({
    where: { id: mediaId },
    select: { id: true, avgRating: true }
  });
  if (!media) return null;

  const take = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);

  const [total, items] = await Promise.all([
    prisma.userReview.count({ where: { mediaId } }),
    prisma.userReview.findMany({
      where: { mediaId },
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * take,
      take,
      include: { user: { select: { id: true, name: true, username: true } } }
    })
  ]);

  return {
    mediaAvgRating: media.avgRating,
    items,
    pagination: {
      page: currentPage,
      limit: take,
      total,
      totalPages: Math.ceil(total / take)
    }
  };
}

async function deleteReview(userId, mediaId) {
  return prisma.$transaction(async (tx) => {
    const result = await tx.userReview.deleteMany({ where: { userId, mediaId } });
    if (result.count === 0) return null;
    const mediaAvgRating = await recalcAvgRating(tx, mediaId);
    return { mediaAvgRating };
  });
}

module.exports = { upsertReview, listReviews, deleteReview };
