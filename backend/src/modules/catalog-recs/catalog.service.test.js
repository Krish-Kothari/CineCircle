const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const prismaPath = require.resolve('../../config/prisma');
const servicePath = path.join(__dirname, 'catalog.service.js');

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

async function captureCatalog(filters, returnedItems = []) {
  let countArgs;
  let findArgs;
  const prisma = {
    mediaItem: {
      count: async (args) => { countArgs = args; return returnedItems.length; },
      findMany: async (args) => { findArgs = args; return returnedItems; }
    }
  };
  const loaded = loadServiceWithPrisma(prisma);
  try {
    const result = await loaded.service.listCatalog(filters);
    return { result, countArgs, findArgs };
  } finally {
    loaded.restore();
  }
}

test('applies case-insensitive title search and individual type, genre, and platform filters', async () => {
  const cases = [
    [{ search: 'matrix' }, { title: { contains: 'matrix', mode: 'insensitive' } }],
    [{ type: 'MOVIE' }, { type: 'MOVIE' }],
    [{ genre: 'Sci-Fi' }, { genres: { has: 'Sci-Fi' } }],
    [{ platform: 'StreamCo' }, {
      streamingOptions: { some: { platform: { equals: 'StreamCo', mode: 'insensitive' } } }
    }]
  ];
  for (const [filters, expectedWhere] of cases) {
    const { countArgs, findArgs } = await captureCatalog(filters);
    assert.deepEqual(countArgs, { where: expectedWhere });
    assert.deepEqual(findArgs.where, expectedWhere);
  }
});

test('combines filters, paginates after filtering, and uses deterministic ordering', async () => {
  const matchingItem = {
    id: 'media-1', title: 'Film', avgRating: 8, streamingOptions: [
      { platform: 'StreamCo', region: 'IN' }, { platform: 'StreamCo', region: 'US' }
    ]
  };
  const { result, countArgs, findArgs } = await captureCatalog({
    search: 'film', type: 'MOVIE', genre: 'Drama', platform: 'StreamCo', region: 'IN', page: '2', limit: '5'
  }, [matchingItem]);
  const expectedWhere = {
    title: { contains: 'film', mode: 'insensitive' },
    type: 'MOVIE',
    genres: { has: 'Drama' },
    streamingOptions: { some: {
      platform: { equals: 'StreamCo', mode: 'insensitive' },
      region: { equals: 'IN', mode: 'insensitive' }
    } }
  };
  assert.deepEqual(countArgs, { where: expectedWhere });
  assert.deepEqual(findArgs.where, expectedWhere);
  assert.equal(findArgs.skip, 5);
  assert.equal(findArgs.take, 5);
  assert.deepEqual(findArgs.orderBy, [
    { avgRating: 'desc' }, { title: 'asc' }, { id: 'asc' }
  ]);
  assert.equal(result.items.length, 1);
  assert.deepEqual(result.items[0].streamingOptions, matchingItem.streamingOptions);
  assert.deepEqual(result.items[0].platforms, ['StreamCo', 'StreamCo']);
  assert.deepEqual(result.pagination, { page: 2, limit: 5, total: 1, totalPages: 1 });
});

test('region narrows platform matching only when explicitly supplied', async () => {
  const noRegion = await captureCatalog({ platform: 'StreamCo' });
  assert.deepEqual(noRegion.findArgs.where, {
    streamingOptions: { some: { platform: { equals: 'StreamCo', mode: 'insensitive' } } }
  });

  const explicitRegion = await captureCatalog({ platform: 'streamco', region: 'in' });
  assert.deepEqual(explicitRegion.findArgs.where, {
    streamingOptions: { some: {
      platform: { equals: 'streamco', mode: 'insensitive' },
      region: { equals: 'in', mode: 'insensitive' }
    } }
  });

  const regionOnly = await captureCatalog({ region: 'IN' });
  assert.deepEqual(regionOnly.findArgs.where, {
    streamingOptions: { some: { region: { equals: 'IN', mode: 'insensitive' } } }
  });
});

test('unknown platform results remain empty and do not affect media counts', async () => {
  const { result, countArgs, findArgs } = await captureCatalog({ platform: 'UnknownPlatform' });
  assert.deepEqual(result.items, []);
  assert.equal(result.pagination.total, 0);
  assert.deepEqual(countArgs, findArgs && { where: findArgs.where });
});

test('clamps pagination boundaries and reports accurate totals', async () => {
  const first = await captureCatalog({ page: '0', limit: '0' });
  assert.equal(first.findArgs.skip, 0);
  assert.equal(first.findArgs.take, 10);
  assert.deepEqual(first.result.pagination, { page: 1, limit: 10, total: 0, totalPages: 0 });

  const upper = await captureCatalog({ page: '3', limit: '500' });
  assert.equal(upper.findArgs.skip, 100);
  assert.equal(upper.findArgs.take, 50);
  assert.deepEqual(upper.result.pagination, { page: 3, limit: 50, total: 0, totalPages: 0 });

  const negative = await captureCatalog({ page: '-2', limit: '-4' });
  assert.equal(negative.findArgs.skip, 0);
  assert.equal(negative.findArgs.take, 1);
});

test('returns an empty page for a search with no matches', async () => {
  const { result } = await captureCatalog({ search: 'no such title' });
  assert.deepEqual(result.items, []);
  assert.equal(result.pagination.total, 0);
  assert.equal(result.pagination.totalPages, 0);
});
