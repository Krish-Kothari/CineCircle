const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../src/config/prisma');
const { getDatabaseDiagnosticsSql } = require('../src/modules/tracker-auth/diagnostics.sql');
const { getPersonalizedRecommendationsSql } = require('../src/modules/catalog-recs/recs.sql');
const { getGroupBlendRecommendationsSql } = require('../src/modules/social-groups/blend.sql');

test('CineCircle v1.0.0 Final Smoke Test — All 3 Modules & PostgreSQL Diagnostics', async () => {
  const diag = await getDatabaseDiagnosticsSql();
  assert.ok(diag.totalTables >= 12, 'All 12 PostgreSQL tables must exist');
  assert.ok(diag.totalIndexes >= 12, 'Custom B-Tree and GIN indexes must be active');

  const user = await prisma.user.findFirst();
  const group = await prisma.friendGroup.findFirst();

  if (user && group) {
    const personalRecs = await getPersonalizedRecommendationsSql(user.id);
    assert.ok(Array.isArray(personalRecs), 'Harsh Hybrid SQL Recommender must return an array');

    const groupBlend = await getGroupBlendRecommendationsSql(group.id);
    assert.ok(Array.isArray(groupBlend), 'Aryan Group Blend SQL Engine must return an array');
  }
});
