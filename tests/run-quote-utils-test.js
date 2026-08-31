const assert = require('assert');
const { validateAndBuildQuote } = require('../lib/admin/quote-utils');

function run() {
  console.log('Running quote-utils tests...');

  // valid input
  const { valid, errors, quote } = validateAndBuildQuote({ finalEstimatedPrice: '1200.50', serviceFee: '50', shippingIndiaToNepal: '200' });
  assert.strictEqual(valid, true, 'Expected valid=true for numeric fields');
  assert.strictEqual(Array.isArray(errors) && errors.length === 0, true);
  assert.strictEqual(quote.finalEstimatedPrice, 1200.5);
  assert.strictEqual(quote.serviceFee, 50);
  assert.strictEqual(quote.shippingIndiaToNepal, 200);

  // invalid numeric
  const out = validateAndBuildQuote({ finalEstimatedPrice: 'abc' });
  assert.strictEqual(out.valid, false);
  assert.ok(out.errors.length > 0);

  // negative price
  const out2 = validateAndBuildQuote({ finalEstimatedPrice: '-5' });
  assert.strictEqual(out2.valid, false);
  assert.ok(out2.errors.includes('finalEstimatedPrice must be >= 0'));

  console.log('All tests passed');
}

run();
