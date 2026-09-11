const { calculateOrderPrice, getCustomerFacingPrice } = require('../lib/pricing/india-order.ts');
const { calculateTrendingScore, assignDynamicBadges } = require('../lib/marketplace/sync.ts');
const { getAllProviders } = require('../lib/marketplace/index.ts');

async function runTests() {
  console.log('====================================================');
  console.log('🚀 TESTING LINKOVA INDIA MARKETPLACE DISCOVERY SUITE');
  console.log('====================================================\n');

  // Test 1: All 10 Providers Registered
  const providers = getAllProviders();
  console.log(`[Test 1] Checking Registered Providers... (Found ${providers.length}/10)`);
  const expectedProviderIds = [
    'amazon-india', 'flipkart', 'myntra', 'meesho', 'nykaa',
    'ajio', 'tatacliq', 'croma', 'boat', 'noise'
  ];

  for (const id of expectedProviderIds) {
    const found = providers.find(p => p.id === id);
    if (found && found.enabled) {
      console.log(`  ✓ Provider: ${found.displayName} (${found.id}) is active`);
    } else {
      console.error(`  ❌ Missing or disabled provider: ${id}`);
      process.exit(1);
    }
  }

  // Test 2: Provider Product Normalization
  console.log('\n[Test 2] Testing Provider Normalization & Categories...');
  const categoriesFound = new Set();

  for (const provider of providers) {
    const products = await provider.getProducts();
    if (!products || products.length === 0) {
      console.error(`  ❌ Provider ${provider.id} returned 0 products`);
      process.exit(1);
    }

    for (const p of products) {
      categoriesFound.add(p.category);
      if (!p.source || !p.sourceProductId || !p.sourceUrl || !p.title || !p.priceINR) {
        console.error(`  ❌ Invalid product structure in ${provider.id}:`, p);
        process.exit(1);
      }
    }
    console.log(`  ✓ ${provider.displayName}: Returned ${products.length} normalized products.`);
  }

  console.log('  ✓ Categories covered:', Array.from(categoriesFound).join(', '));

  // Test 3: Dynamic Trending Score & Badges
  console.log('\n[Test 3] Testing Dynamic Trending Scoring & Badges...');
  const sampleProduct = {
    source: 'boat',
    sourceProductId: 'TEST-101',
    sourceUrl: 'https://www.boat-lifestyle.com/products/test',
    title: 'boAt Airdopes',
    slug: 'boat-airdopes',
    description: 'Test',
    images: [],
    brand: 'boAt',
    category: 'Tech & Gadgets',
    priceINR: 1500,
    originalPriceINR: 4500,
    discountPercentage: 67,
    rating: 4.8,
    reviewCount: 3000,
    availability: 'in_stock',
    isFlashSale: true,
    isBestSeller: true,
    tags: []
  };

  const score = calculateTrendingScore(sampleProduct);
  const badges = assignDynamicBadges(sampleProduct);
  console.log(`  ✓ Trending Score for sample product: ${score}`);
  console.log(`  ✓ Dynamic Badges assigned:`, badges);

  if (score < 80) {
    console.error('  ❌ Trending score lower than expected for bestseller flash sale product');
    process.exit(1);
  }

  if (!badges.includes('67% OFF') || !badges.includes('FLASH SALE') || !badges.includes('BEST SELLER')) {
    console.error('  ❌ Badges missing expected tags:', badges);
    process.exit(1);
  }

  // Test 4: Pricing Engine Security Formula
  // INR 2000 -> 2000 * 1.65 = 3300 -> 3300 * 0.20 = 660 -> 3300 + 660 + 200 = NPR 4,160
  console.log('\n[Test 4] Verifying Landed NPR Calculations & Customer Security...');
  const pricing = calculateOrderPrice(2000);
  if (pricing.finalAmount === 4160 && pricing.conversionAmount === 3300 && pricing.serviceCharge === 660 && pricing.deliveryCharge === 200) {
    console.log('  ✓ Internal Landed Price: ₹2,000 INR -> NPR 4,160 (Base 3,300 + Fee 660 + Delivery 200)');
  } else {
    console.error('  ❌ Incorrect pricing result:', pricing);
    process.exit(1);
  }

  const customerSafe = getCustomerFacingPrice(2000);
  if (customerSafe.finalAmountNPR === 4160 && customerSafe.serviceCharge === undefined && customerSafe.conversionAmount === undefined) {
    console.log('  ✓ Customer Payload: Hidden multipliers completely omitted.');
  } else {
    console.error('  ❌ Security breach: Customer payload contains internal multipliers:', customerSafe);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL 4 DISCOVERY & PRICING TESTS PASSED PERFECTLY!');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('Test suite failure:', err);
  process.exit(1);
});
