const test = require('node:test');
const assert = require('node:assert/strict');

test('Aryan Groups Module — Optimal Watch Party Slot Time Window Categorization', () => {
  function categorizeHour(hour) {
    if (hour >= 18 && hour <= 21) return 'Evening Primetime (6 PM - 9 PM)';
    if (hour > 21 && hour <= 24) return 'Late Night Watch (9 PM - 12 AM)';
    return 'Daytime Session';
  }

  assert.equal(categorizeHour(20), 'Evening Primetime (6 PM - 9 PM)');
  assert.equal(categorizeHour(23), 'Late Night Watch (9 PM - 12 AM)');
  assert.equal(categorizeHour(14), 'Daytime Session');
});
