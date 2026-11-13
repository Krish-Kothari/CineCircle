const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const servicePath = path.join(__dirname, 'catalog.service.js');
const controllerPath = path.join(__dirname, 'catalog.controller.js');

function loadControllerWithService(service) {
  const previousService = require.cache[servicePath];
  const previousController = require.cache[controllerPath];
  require.cache[servicePath] = {
    id: servicePath, filename: servicePath, loaded: true, exports: service
  };
  delete require.cache[controllerPath];
  return {
    controller: require(controllerPath),
    restore() {
      delete require.cache[controllerPath];
      if (previousController) require.cache[controllerPath] = previousController;
      if (previousService) require.cache[servicePath] = previousService;
      else delete require.cache[servicePath];
    }
  };
}

function responseRecorder() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

async function invoke(controller, query) {
  const res = responseRecorder();
  let error;
  await controller({ query }, res, (caught) => { error = caught; });
  if (error) throw error;
  return res;
}

test('rejects invalid media types and malformed query values', async () => {
  let calls = 0;
  const loaded = loadControllerWithService({
    listCatalog: async () => { calls += 1; return { items: [], pagination: {} }; }
  });
  try {
    const cases = [
      [{ type: 'ANIME' }, 'type must be one of: MOVIE, TV_SHOW'],
      [{ type: ['MOVIE', 'TV_SHOW'] }, 'type must be one of: MOVIE, TV_SHOW'],
      [{ search: ['film'] }, 'search must be a single string'],
      [{ platform: { name: 'StreamCo' } }, 'platform must be a single string'],
      [{ region: ['IN'] }, 'region must be a single string'],
      [{ platform: '   ' }, 'platform cannot be blank'],
      [{ region: '   ' }, 'region cannot be blank'],
      [{ genre: ['Drama'] }, 'genre must be a single string'],
      [{ page: '2x' }, 'page must be an integer'],
      [{ limit: '1.5' }, 'limit must be an integer'],
      [{ page: ['1', '2'] }, 'page must be an integer']
    ];
    for (const [query, message] of cases) {
      const res = await invoke(loaded.controller.handleListCatalog, query);
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { success: false, message });
    }
    assert.equal(calls, 0);
  } finally {
    loaded.restore();
  }
});

test('passes valid discovery filters and preserves the existing response shape', async () => {
  const result = {
    items: [{ id: 'media-1', title: 'Film', platforms: ['StreamCo'] }],
    pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
  };
  const loaded = loadControllerWithService({
    listCatalog: async (filters) => {
      assert.deepEqual(filters, {
        search: 'film', platform: 'StreamCo', region: 'IN', genre: 'Drama', type: 'TV_SHOW', page: '1', limit: '10'
      });
      return result;
    }
  });
  try {
    const res = await invoke(loaded.controller.handleListCatalog, {
      search: 'film', platform: 'StreamCo', region: 'IN', genre: 'Drama', type: 'tv_show', page: '1', limit: '10'
    });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, {
      success: true,
      message: 'Fetched catalog',
      data: result.items,
      pagination: result.pagination
    });
  } finally {
    loaded.restore();
  }
});

test('allows an empty search string to retain the unfiltered catalog behavior', async () => {
  let receivedSearch = 'unexpected';
  const loaded = loadControllerWithService({
    listCatalog: async ({ search }) => {
      receivedSearch = search;
      return { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  });
  try {
    const res = await invoke(loaded.controller.handleListCatalog, { search: '' });
    assert.equal(res.statusCode, 200);
    assert.equal(receivedSearch, '');
    assert.deepEqual(res.body.data, []);
  } finally {
    loaded.restore();
  }
});
