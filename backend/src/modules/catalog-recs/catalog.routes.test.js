const test = require('node:test');
const assert = require('node:assert/strict');

const router = require('./catalog.routes');
const { authenticateToken } = require('../../middlewares/auth.middleware');

function findRoute(path, method) {
  return router.stack.find((layer) => layer.route && layer.route.path === path && layer.route.methods[method])?.route;
}

test('keeps recommendations and review mutations behind authentication', () => {
  const guarded = [
    ['/recommendations', 'get'],
    ['/recommendations/personal', 'get'],
    ['/reviews/submit', 'post'],
    ['/:id/reviews', 'post'],
    ['/:id/reviews', 'delete']
  ];

  for (const [path, method] of guarded) {
    const route = findRoute(path, method);
    assert.ok(route, `${method.toUpperCase()} ${path} should be registered`);
    assert.equal(route.stack[0].handle, authenticateToken, `${method.toUpperCase()} ${path} should authenticate first`);
  }

  const publicReviewListing = findRoute('/:id/reviews', 'get');
  assert.ok(publicReviewListing);
  assert.notEqual(publicReviewListing.stack[0].handle, authenticateToken);
});
