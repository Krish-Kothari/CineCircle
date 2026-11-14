const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const servicePath = path.join(__dirname, 'recs.service.js');
const controllerPath = path.join(__dirname, 'recs.controller.js');

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
  await controller({ user: { id: 'user-1' }, query }, res, (caught) => { error = caught; });
  if (error) throw error;
  return res;
}

test('rejects malformed recommendation limits before querying recommendations', async () => {
  let calls = 0;
  const loaded = loadControllerWithService({
    getRecommendations: async () => { calls += 1; return []; }
  });
  try {
    for (const limit of ['3x', '1.5', ['5'], '9007199254740992']) {
      const res = await invoke(loaded.controller.handleGetRecommendations, { limit });
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { success: false, message: 'limit must be an integer' });
    }
    assert.equal(calls, 0);
  } finally {
    loaded.restore();
  }
});

test('retains recommendation limit defaults and bounds for valid integers', async () => {
  const limits = [];
  const loaded = loadControllerWithService({
    getRecommendations: async (userId, limit) => { limits.push([userId, limit]); return []; }
  });
  try {
    const defaultResponse = await invoke(loaded.controller.handleGetRecommendations, {});
    const boundedResponse = await invoke(loaded.controller.handleGetRecommendations, { limit: '100' });
    assert.equal(defaultResponse.statusCode, 200);
    assert.equal(boundedResponse.statusCode, 200);
    assert.deepEqual(limits, [['user-1', 10], ['user-1', 20]]);
    assert.deepEqual(defaultResponse.body, {
      success: true, message: 'Fetched recommendations', data: []
    });
  } finally {
    loaded.restore();
  }
});
