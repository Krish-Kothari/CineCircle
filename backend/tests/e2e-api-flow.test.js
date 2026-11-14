const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../src/config/prisma');
const { registerUser, loginUser } = require('../src/modules/tracker-auth/auth.service');
const { searchCatalog } = require('../src/modules/catalog-recs/catalog.service');
const { createFriendGroup } = require('../src/modules/social-groups/groups.service');

test('CineCircle E2E Integration Suite — Full Lifecycle Verification', async () => {
  const testEmail = `e2e_${Date.now()}@nst.edu`;
  const testUsername = `e2e_user_${Date.now()}`;

  // 1. User Registration & Auth
  const { user, token } = await registerUser({
    name: 'E2E Tester',
    username: testUsername,
    email: testEmail,
    password: 'password123',
    subscribedOTTs: ['Netflix', 'Prime Video']
  });
  assert.ok(user.id);
  assert.ok(token);

  // 2. Login Verification
  const loginRes = await loginUser({
    emailOrUsername: testEmail,
    password: 'password123'
  });
  assert.equal(loginRes.user.email, testEmail);

  // 3. Catalog Querying
  const catalog = await searchCatalog({ genre: 'Sci-Fi', limit: 5 });
  assert.ok(Array.isArray(catalog.items));
  assert.ok(catalog.items.length >= 1);

  // 4. Friend Squad Lifecycle
  const squad = await createFriendGroup(user.id, {
    name: 'E2E Automated Squad',
    description: 'Testing consensus pipeline'
  });
  assert.ok(squad.id);
  assert.equal(squad.inviteCode.length, 6);

  // Clean up transient test records
  await prisma.friendGroup.delete({ where: { id: squad.id } });
  await prisma.user.delete({ where: { id: user.id } });
});
