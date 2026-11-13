const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const catalogServicePath = path.join(__dirname, 'catalog.service.js');
const reviewsServicePath = path.join(__dirname, 'reviews.service.js');
const controllerPath = path.join(__dirname, 'mobile.controller.js');

function loadController({ listCatalog }) {
  const previousCatalogService = require.cache[catalogServicePath];
  const previousReviewsService = require.cache[reviewsServicePath];
  const previousController = require.cache[controllerPath];
  require.cache[catalogServicePath] = {
    id: catalogServicePath, filename: catalogServicePath, loaded: true, exports: { listCatalog }
  };
  require.cache[reviewsServicePath] = {
    id: reviewsServicePath, filename: reviewsServicePath, loaded: true, exports: { upsertReview: async () => null }
  };
  delete require.cache[controllerPath];

  return {
    controller: require(controllerPath),
    restore() {
      delete require.cache[controllerPath];
      if (previousController) require.cache[controllerPath] = previousController;
      if (previousCatalogService) require.cache[catalogServicePath] = previousCatalogService;
      else delete require.cache[catalogServicePath];
      if (previousReviewsService) require.cache[reviewsServicePath] = previousReviewsService;
      else delete require.cache[reviewsServicePath];
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

async function invoke(controller, platform, query = {}) {
  const res = responseRecorder();
  let error;
  await controller({ params: { ott: platform }, query }, res, (caught) => { error = caught; });
  if (error) throw error;
  return res;
}

test('by-platform forwards optional region to the shared catalog filter and keeps its response contract', async () => {
  let passedFilters;
  const catalog = {
    items: [{ id: 'media-1', streamingOptions: [{ platform: 'StreamCo', region: 'IN' }] }],
    pagination: { page: 1, limit: 50, total: 1, totalPages: 1 }
  };
  const loaded = loadController({
    listCatalog: async (filters) => { passedFilters = filters; return catalog; }
  });
  try {
    const res = await invoke(loaded.controller.handleByPlatform, 'StreamCo', { region: 'IN' });
    assert.deepEqual(passedFilters, { platform: 'StreamCo', region: 'IN', page: 1, limit: 50 });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, {
      success: true,
      message: 'Fetched catalog by platform',
      data: catalog.items,
      pagination: catalog.pagination
    });
  } finally {
    loaded.restore();
  }
});

test('missing region preserves all-region behavior and malformed region or platform is rejected', async () => {
  let calls = 0;
  let passedFilters;
  const loaded = loadController({
    listCatalog: async (filters) => {
      calls += 1;
      passedFilters = filters;
      return { items: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };
    }
  });
  try {
    const noRegion = await invoke(loaded.controller.handleByPlatform, 'StreamCo');
    assert.equal(noRegion.statusCode, 200);
    assert.deepEqual(passedFilters, { platform: 'StreamCo', region: undefined, page: 1, limit: 50 });

    for (const [platform, query, message] of [
      [' ', {}, 'platform must be a non-empty string'],
      ['StreamCo', { region: ['IN'] }, 'region must be a non-empty string'],
      ['StreamCo', { region: '   ' }, 'region must be a non-empty string']
    ]) {
      const res = await invoke(loaded.controller.handleByPlatform, platform, query);
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { success: false, message });
    }
    assert.equal(calls, 1);
  } finally {
    loaded.restore();
  }
});
