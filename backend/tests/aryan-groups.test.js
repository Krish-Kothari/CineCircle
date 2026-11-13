const test = require('node:test');
const assert = require('node:assert/strict');
const { generateInviteCode } = require('../src/utils/inviteCode');
const {
  validateCreateGroupInput,
  validateJoinByCodeInput,
  validateNominateMediaInput
} = require('../src/modules/social-groups/groups.validators');

test('Aryan Social Groups Module — Unique 6-Char Invite Code Generator', () => {
  const codeA = generateInviteCode(6);
  const codeB = generateInviteCode(6);
  assert.equal(codeA.length, 6);
  assert.equal(codeB.length, 6);
  assert.notEqual(codeA, codeB);
});

test('Aryan Social Groups Module — Group Creation & Invite Code Validation', () => {
  const tooShort = validateCreateGroupInput({ name: 'AB' });
  assert.ok(tooShort);

  const validGroup = validateCreateGroupInput({ name: 'NST Weekend Watchers' });
  assert.equal(validGroup, null);

  const invalidCode = validateJoinByCodeInput({ inviteCode: '123' });
  assert.ok(invalidCode);

  const validCode = validateJoinByCodeInput({ inviteCode: 'NST202' });
  assert.equal(validCode, null);
});

test('Aryan Social Groups Module — Nomination Pitch Validation', () => {
  const missingMedia = validateNominateMediaInput({ pitchNote: 'Great film' });
  assert.ok(missingMedia);

  const validNomination = validateNominateMediaInput({
    mediaId: 'media-123',
    pitchNote: 'Matches our Sci-Fi weights!'
  });
  assert.equal(validNomination, null);
});
