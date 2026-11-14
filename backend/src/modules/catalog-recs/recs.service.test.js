const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const prismaPath = require.resolve('../../config/prisma');
const servicePath = path.join(__dirname, 'recs.service.js');

function loadServiceWithPrisma(prisma) {
  const previousPrisma = require.cache[prismaPath];
  const previousService = require.cache[servicePath];

  require.cache[prismaPath] = {
    id: prismaPath,
    filename: prismaPath,
    loaded: true,
    exports: prisma
  };
  delete require.cache[servicePath];

  return {
    service: require(servicePath),
    restore() {
      delete require.cache[servicePath];
      if (previousService) require.cache[servicePath] = previousService;
      else delete require.cache[servicePath];

      if (previousPrisma) require.cache[prismaPath] = previousPrisma;
      else delete require.cache[prismaPath];
    }
  };
}

function queryStub(rows) {
  let sql = '';
  const prisma = {
    $queryRaw: async (strings, ...values) => {
      sql = strings.join('?');
      prisma.queryValues = values;
      return rows;
    },
    queryValues: null
  };
  return { prisma, getSql: () => sql };
}

test('clears only this user’s stale recommendation logs when there are no results', async () => {
  const { prisma, getSql } = queryStub([]);
  const deleted = [];
  prisma.recommendationLog = {
    deleteMany: async (args) => {
      deleted.push(args);
      return { count: 2 };
    },
    createMany: async () => assert.fail('must not create logs for empty results')
  };
  prisma.$transaction = async () => assert.fail('empty results use a scoped delete');
  prisma.mediaItem = { findMany: async () => assert.fail('must not fetch media for empty results') };

  const loaded = loadServiceWithPrisma(prisma);
  try {
    assert.deepEqual(await loaded.service.getRecommendations('user-1', 10), []);
    assert.deepEqual(deleted, [{ where: { userId: 'user-1' } }]);
    assert.match(getSql(), /status = 'COMPLETED'/);
    assert.match(getSql(), /FROM "UserReview" WHERE "userId" = \?/);
    assert.deepEqual(prisma.queryValues, ['user-1', 'user-1', 'user-1', 'user-1', 'user-1', 10]);
  } finally {
    loaded.restore();
  }
});

test('returns scored recommendations and replaces that user’s log batch', async () => {
  const rows = [{
    id: 'media-1', title: 'Example Film', type: 'MOVIE', synopsis: 'A story',
    releaseYear: 2024, runtimeMinutes: 110, totalEpisodes: null, genres: ['Drama'],
    posterUrl: null, avgRating: 8, contentScore: 0.6, collabScore: 0.8,
    popularityScore: 0.8, hasCollab: true, matchedGenres: ['Drama'],
    myPlatforms: ['StreamCo'], finalScore: 0.75
  }];
  const { prisma, getSql } = queryStub(rows);
  const transactions = [];
  let transactionArgs;
  prisma.mediaItem = {
    findMany: async (args) => {
      assert.deepEqual(args.where, { id: { in: ['media-1'] } });
      return [{ id: 'media-1', streamingOptions: [{ platform: 'StreamCo', region: 'US' }] }];
    }
  };
  prisma.recommendationLog = {
    deleteMany: (args) => {
      const operation = { kind: 'deleteMany', args };
      transactions.push(operation);
      return operation;
    },
    createMany: (args) => {
      const operation = { kind: 'createMany', args };
      transactions.push(operation);
      return operation;
    }
  };
  prisma.$transaction = async (ops) => {
    transactionArgs = ops;
    return ops;
  };

  const loaded = loadServiceWithPrisma(prisma);
  try {
    const result = await loaded.service.getRecommendations('user-2', 5);
    assert.match(getSql(), /ORDER BY "finalScore" DESC, m\.title ASC, m\.id ASC/);
    assert.equal(result.length, 1);
    assert.equal(result[0].score, 0.75);
    assert.deepEqual(result[0].platforms, ['StreamCo']);
    assert.deepEqual(result[0].breakdown, { content: 0.6, collaborative: 0.8, popularity: 0.8 });
    assert.deepEqual(transactions.map((operation) => operation.kind), ['deleteMany', 'createMany']);
    assert.deepEqual(transactionArgs, transactions);
    assert.deepEqual(transactions[0].args, { where: { userId: 'user-2' } });
    assert.deepEqual(transactions[1].args, {
      data: [{ userId: 'user-2', mediaId: 'media-1', score: 0.75,
        reason: 'Matches your Drama taste, Loved by viewers with similar taste - on StreamCo' }]
    });
  } finally {
    loaded.restore();
  }
});
