const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const servicePath = path.join(__dirname, 'reviews.service.js');
const controllerPath = path.join(__dirname, 'reviews.controller.js');

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

async function invoke(controller, req) {
  const res = responseRecorder();
  let error;
  await controller(req, res, (caught) => { error = caught; });
  if (error) throw error;
  return res;
}

test('rejects invalid ratings before calling the review service', async () => {
  let calls = 0;
  const loaded = loadControllerWithService({
    upsertReview: async () => { calls += 1; }
  });
  try {
    for (const rating of [0, 11, 2.5, '8', null]) {
      const res = await invoke(loaded.controller.handleUpsertReview, {
        user: { id: 'user-1' }, params: { id: 'media-1' }, body: { rating }
      });
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
    }
    assert.equal(calls, 0);
  } finally {
    loaded.restore();
  }
});

test('accepts a valid review and preserves the existing response shape', async () => {
  const review = { id: 'review-1', userId: 'user-1', mediaId: 'media-1', rating: 9, body: 'Great' };
  const loaded = loadControllerWithService({
    upsertReview: async (userId, mediaId, input) => {
      assert.equal(userId, 'user-1');
      assert.equal(mediaId, 'media-1');
      assert.deepEqual(input, { rating: 9, body: 'Great' });
      return { ...review, mediaAvgRating: 9 };
    }
  });
  try {
    const res = await invoke(loaded.controller.handleUpsertReview, {
      user: { id: 'user-1' }, params: { id: 'media-1' }, body: { rating: 9, body: 'Great' }
    });
    assert.equal(res.statusCode, 201);
    assert.deepEqual(res.body, { success: true, message: 'Review saved', data: { ...review, mediaAvgRating: 9 } });
  } finally {
    loaded.restore();
  }
});

test('returns not found for an invalid or missing media ID', async () => {
  const loaded = loadControllerWithService({ upsertReview: async () => null });
  try {
    const res = await invoke(loaded.controller.handleUpsertReview, {
      user: { id: 'user-1' }, params: { id: 'not-a-media-id' }, body: { rating: 5 }
    });
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, { success: false, message: 'Media not found' });
  } finally {
    loaded.restore();
  }
});
