const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const prismaPath = require.resolve('../../config/prisma');
const servicePath = path.join(__dirname, 'reviews.service.js');

function loadServiceWithPrisma(prisma) {
  const previousPrisma = require.cache[prismaPath];
  const previousService = require.cache[servicePath];
  require.cache[prismaPath] = {
    id: prismaPath, filename: prismaPath, loaded: true, exports: prisma
  };
  delete require.cache[servicePath];

  return {
    service: require(servicePath),
    restore() {
      delete require.cache[servicePath];
      if (previousService) require.cache[servicePath] = previousService;
      if (previousPrisma) require.cache[prismaPath] = previousPrisma;
      else delete require.cache[prismaPath];
    }
  };
}

function inMemoryPrisma() {
  const reviews = new Map();
  const ratings = [];
  const prisma = {
    mediaItem: {
      findUnique: async ({ where }) => where.id === 'missing' ? null : ({ id: where.id }),
      update: async ({ where, data }) => {
        ratings.push({ mediaId: where.id, avgRating: data.avgRating });
        return { id: where.id, ...data };
      }
    },
    userReview: {
      upsert: async ({ where, update, create }) => {
        const key = `${where.userId_mediaId.userId}:${where.userId_mediaId.mediaId}`;
        const prior = reviews.get(key);
        const review = prior
          ? { ...prior, ...update }
          : { id: `review-${reviews.size + 1}`, ...create, createdAt: new Date('2026-01-01T00:00:00Z') };
        reviews.set(key, review);
        return review;
      },
      deleteMany: async ({ where }) => {
        let count = 0;
        for (const [key, review] of reviews) {
          if (review.userId === where.userId && review.mediaId === where.mediaId) {
            reviews.delete(key);
            count += 1;
          }
        }
        return { count };
      },
      aggregate: async ({ where }) => {
        const matching = [...reviews.values()].filter((review) => review.mediaId === where.mediaId);
        return { _avg: { rating: matching.length
          ? matching.reduce((sum, review) => sum + review.rating, 0) / matching.length
          : null } };
      }
    },
    $transaction: async (callback) => callback(prisma)
  };
  return { prisma, reviews, ratings };
}

test('submits one review per user and media and recalculates average on create and update', async () => {
  const { prisma, reviews, ratings } = inMemoryPrisma();
  const loaded = loadServiceWithPrisma(prisma);
  try {
    const first = await loaded.service.upsertReview('user-1', 'media-1', { rating: 8, body: 'Good' });
    assert.equal(first.rating, 8);
    assert.equal(first.mediaAvgRating, 8);
    const reviewId = first.id;

    const duplicate = await loaded.service.upsertReview('user-1', 'media-1', { rating: 6, body: 'Revised' });
    assert.equal(reviews.size, 1);
    assert.equal(duplicate.id, reviewId);
    assert.equal(duplicate.rating, 6);
    assert.equal(duplicate.body, 'Revised');
    assert.equal(duplicate.mediaAvgRating, 6);
    assert.deepEqual(ratings, [
      { mediaId: 'media-1', avgRating: 8 },
      { mediaId: 'media-1', avgRating: 6 }
    ]);
  } finally {
    loaded.restore();
  }
});

test('updates only the requesting user’s review and recalculates the average', async () => {
  const { prisma } = inMemoryPrisma();
  const loaded = loadServiceWithPrisma(prisma);
  try {
    await loaded.service.upsertReview('owner', 'media-1', { rating: 10 });
    await loaded.service.upsertReview('other-user', 'media-1', { rating: 4 });
    const updated = await loaded.service.upsertReview('owner', 'media-1', { rating: 8 });
    assert.equal(updated.rating, 8);
    assert.equal(updated.mediaAvgRating, 6);
  } finally {
    loaded.restore();
  }
});

test('deletes only the requesting user’s review and recalculates the remaining average', async () => {
  const { prisma, reviews, ratings } = inMemoryPrisma();
  const loaded = loadServiceWithPrisma(prisma);
  try {
    await loaded.service.upsertReview('owner', 'media-1', { rating: 10 });
    await loaded.service.upsertReview('other-user', 'media-1', { rating: 4 });
    const deleted = await loaded.service.deleteReview('owner', 'media-1');
    assert.deepEqual(deleted, { mediaAvgRating: 4 });
    assert.equal(reviews.size, 1);
    assert.equal([...reviews.values()][0].userId, 'other-user');

    const updatesAfterOwnerDelete = ratings.length;
    assert.equal(await loaded.service.deleteReview('stranger', 'media-1'), null);
    assert.equal(ratings.length, updatesAfterOwnerDelete);
    assert.deepEqual(ratings.at(-1), { mediaId: 'media-1', avgRating: 4 });
  } finally {
    loaded.restore();
  }
});

test('resets the media average to zero when its last review is deleted', async () => {
  const { prisma, reviews, ratings } = inMemoryPrisma();
  const loaded = loadServiceWithPrisma(prisma);
  try {
    await loaded.service.upsertReview('owner', 'media-1', { rating: 6 });
    assert.deepEqual(await loaded.service.deleteReview('owner', 'media-1'), { mediaAvgRating: 0 });
    assert.equal(reviews.size, 0);
    assert.deepEqual(ratings.at(-1), { mediaId: 'media-1', avgRating: 0 });
  } finally {
    loaded.restore();
  }
});

test('returns null for a missing media item without creating a review', async () => {
  const { prisma, reviews } = inMemoryPrisma();
  const loaded = loadServiceWithPrisma(prisma);
  try {
    assert.equal(await loaded.service.upsertReview('user-1', 'missing', { rating: 7 }), null);
    assert.equal(reviews.size, 0);
  } finally {
    loaded.restore();
  }
});

test('propagates transaction failure and does not report a saved review', async () => {
  const failure = new Error('transaction failed');
  const prisma = {
    $transaction: async () => { throw failure; }
  };
  const loaded = loadServiceWithPrisma(prisma);
  try {
    await assert.rejects(
      loaded.service.upsertReview('user-1', 'media-1', { rating: 7 }),
      (error) => error === failure
    );
  } finally {
    loaded.restore();
  }
});

test('lists reviews with bounded pagination and the persisted media average', async () => {
  const prisma = {
    mediaItem: { findUnique: async () => ({ id: 'media-1', avgRating: 7.5 }) },
    userReview: {
      count: async ({ where }) => { assert.deepEqual(where, { mediaId: 'media-1' }); return 61; },
      findMany: async (args) => {
        assert.equal(args.skip, 50);
        assert.equal(args.take, 50);
        return [{ id: 'review-1' }];
      }
    }
  };
  const loaded = loadServiceWithPrisma(prisma);
  try {
    assert.deepEqual(await loaded.service.listReviews('media-1', { page: '2', limit: '500' }), {
      mediaAvgRating: 7.5,
      items: [{ id: 'review-1' }],
      pagination: { page: 2, limit: 50, total: 61, totalPages: 2 }
    });
  } finally {
    loaded.restore();
  }
});
