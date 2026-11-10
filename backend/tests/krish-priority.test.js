const test = require('node:test');
const assert = require('node:assert/strict');

test('Krish Tracker Module — Target Deadline Daily Viewing Rate Calculation', () => {
  const remainingEpisodes = 6;
  const runtimePerEpisode = 50; // 300 minutes total remaining
  const targetDays = 7;

  const requiredDailyMinutes = Math.round((remainingEpisodes * runtimePerEpisode) / targetDays);
  assert.equal(requiredDailyMinutes, 43); // 300 / 7 ≈ 42.86 -> 43 mins/day

  const historicalCapacityMinutes = 60;
  const isFeasible = requiredDailyMinutes <= historicalCapacityMinutes;
  assert.equal(isFeasible, true);
});
