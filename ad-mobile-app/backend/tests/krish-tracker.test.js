const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateRegisterInput,
  validateGenrePreferences,
  validateWatchlistUpsert
} = require('../src/modules/tracker-auth/tracker.validators');
const {
  hashPassword,
  verifyPassword,
  generateAccessToken
} = require('../src/modules/tracker-auth/auth.utils');

test('Krish Tracker Module — Password Hashing & JWT Signing', async () => {
  const hash = await hashPassword('secret123');
  assert.notEqual(hash, 'secret123');

  const isMatch = await verifyPassword('secret123', hash);
  assert.equal(isMatch, true);

  const token = generateAccessToken({
    id: 'user-1',
    username: 'krish_dev',
    email: 'krish@nst.edu'
  });
  assert.equal(typeof token, 'string');
  assert.equal(token.split('.').length, 3);
});

test('Krish Tracker Module — Input Validation Rules', () => {
  const missingFields = validateRegisterInput({ name: 'Krish' });
  assert.ok(missingFields);

  const validRegister = validateRegisterInput({
    name: 'Krish',
    username: 'krish_dev',
    email: 'krish@nst.edu',
    password: 'password123'
  });
  assert.equal(validRegister, null);

  const invalidWeight = validateGenrePreferences([{ genre: 'Sci-Fi', weightScore: 15 }]);
  assert.ok(invalidWeight);

  const validWeight = validateGenrePreferences([{ genre: 'Sci-Fi', weightScore: 9 }]);
  assert.equal(validWeight, null);

  const invalidStatus = validateWatchlistUpsert({ mediaId: 'm1', status: 'INVALID_STATE' });
  assert.ok(invalidStatus);
});
