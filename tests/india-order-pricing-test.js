const { calculateOrderPrice, getCustomerFacingPrice } = require('../lib/pricing/india-order.ts');

console.log('--- Testing India -> Nepal Order Pricing Engine ---');

// Test 1: Example ₹2,000 INR
// (2000 * 1.65) = 3300
// 3300 * 0.20 = 660
// 3300 + 660 + 200 = 4160
const result1 = calculateOrderPrice(2000);
console.log('Result for ₹2,000 INR:', result1);

if (result1.finalAmount === 4160 && result1.conversionAmount === 3300 && result1.serviceCharge === 660 && result1.deliveryCharge === 200) {
  console.log('✅ Test 1 Passed: ₹2000 correctly converts to NPR 4,160');
} else {
  console.error('❌ Test 1 Failed:', result1);
  process.exit(1);
}

// Test 2: Customer Facing Security (Ensure hidden breakdown details are omitted)
const customerResult = getCustomerFacingPrice(2000);
console.log('Customer Facing Result for ₹2,000 INR:', customerResult);
if (
  customerResult.finalAmountNPR === 4160 &&
  customerResult.indianPriceINR === 2000 &&
  customerResult.serviceCharge === undefined &&
  customerResult.conversionAmount === undefined &&
  customerResult.deliveryCharge === undefined
) {
  console.log('✅ Test 2 Passed: Hidden rates & breakdowns are NEVER exposed to customer');
} else {
  console.error('❌ Test 2 Failed:', customerResult);
  process.exit(1);
}

// Test 3: ₹500 INR
// (500 * 1.65) = 825
// 825 * 0.20 = 165
// 825 + 165 + 200 = 1190
const result3 = calculateOrderPrice(500);
if (result3.finalAmount === 1190) {
  console.log('✅ Test 3 Passed: ₹500 correctly converts to NPR 1,190');
} else {
  console.error('❌ Test 3 Failed:', result3);
  process.exit(1);
}

// Test 4: Invalid inputs
try {
  calculateOrderPrice(-100);
  console.error('❌ Test 4 Failed: Expected error for negative price');
  process.exit(1);
} catch (e) {
  console.log('✅ Test 4 Passed: Negative price threw expected error:', e.message);
}

console.log('\n🎉 ALL PRICING ENGINE UNIT TESTS PASSED SUCCESSFULLY!');

