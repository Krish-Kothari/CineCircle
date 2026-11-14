const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../src/config/prisma');

test('CineCircle DE Viva Showcase: Transaction Rollback on Failure (Atomicity Guarantee)', async () => {
  const user = await prisma.user.findFirst();
  assert.ok(user, 'A user must exist to run rollback test');

  const initialMinutes = user.totalWatchMinutes;

  // We simulate a failing transaction: Step 1 succeeds, Step 2 throws error intentionally
  try {
    await prisma.$transaction(async (tx) => {
      // Step 1: Increment user totalWatchMinutes
      await tx.user.update({
        where: { id: user.id },
        data: { totalWatchMinutes: { increment: 9999 } }
      });

      // Step 2: Intentionally throw an unhandled error to trigger rollback
      throw new Error('SIMULATED_DATABASE_CRASH');
    });
  } catch (err) {
    assert.equal(err.message, 'SIMULATED_DATABASE_CRASH');
  }

  // Verify that Step 1 was rolled back completely
  const postTestUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  assert.equal(
    postTestUser.totalWatchMinutes,
    initialMinutes,
    'totalWatchMinutes must revert to original value after transaction rollback'
  );
});
