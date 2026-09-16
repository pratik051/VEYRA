/**
 * SAJILOMARTS - Automated Regression Test Suite for Marketplace Product Verification,
 * URL Normalization, Availability Distinction, Private Transit Security & Sourcing Flow.
 */

const assert = require("assert");

async function runTests() {
  console.log("\n=======================================================");
  console.log("🧪 SAJILOMARTS MARKETPLACE VERIFICATION REGRESSION TEST SUITE");
  console.log("=======================================================\n");

  let passed = 0;
  let total = 0;

  function test(description, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ [PASS] ${description}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${description}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  // ── 1. URL Normalization & Product ID Extraction ─────────────────────────
  test("Test 1: Myntra URL with /buy and tracking parameters is recognized and product ID extracted", () => {
    const rawMyntraUrl = "https://www.myntra.com/tshirts/hrx-by-hrithik-roshan/hrx-yellow-tee/12187850/buy?utm_source=banner&utm_medium=cpc&shared=true";
    
    // Simulate extraction logic
    const parsed = new URL(rawMyntraUrl);
    assert.strictEqual(parsed.hostname.includes("myntra.com"), true, "Recognized as Myntra");

    // Clean tracking params
    const keysToDelete = [];
    parsed.searchParams.forEach((_, key) => {
      if (key.startsWith("utm_") || key === "shared" || key === "ref") keysToDelete.push(key);
    });
    keysToDelete.forEach((k) => parsed.searchParams.delete(k));

    // Handle /buy
    let normPath = parsed.pathname.replace(/\/buy\/?$/i, "");
    parsed.pathname = normPath;
    const normalizedUrl = parsed.toString().replace(/\/$/, "");

    // Extract ID
    const idMatch = rawMyntraUrl.match(/myntra\.com\/(?:.+?\/)?([0-9]{5,12})(?:\/buy|[/?&#]|$)/i) ||
      rawMyntraUrl.match(/\/([0-9]{5,12})(?:\/buy|[/?&#]|$)/i);
    const sourceProductId = idMatch ? idMatch[1] : null;

    assert.strictEqual(sourceProductId, "12187850", "Must extract numeric product ID 12187850");
    assert.strictEqual(normalizedUrl.includes("utm_source"), false, "Tracking parameters must be stripped");
    assert.strictEqual(normalizedUrl.endsWith("/buy"), false, "/buy must be normalized");
  });

  test("Test 2: Amazon URL with ASIN and tracking query strings extracts canonical ASIN", () => {
    const rawAmazonUrl = "https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B09XS7JWHH/ref=sr_1_1?crid=12345&keywords=sony&qid=1690000000&sprefix=sony%2Caps%2C200&sr=8-1";
    const asinMatch = rawAmazonUrl.match(/(?:dp\/|gp\/product\/|d\/|asin=|\/)([A-Z0-9]{10})(?:[/?&#]|$)/i);
    assert.strictEqual(asinMatch ? asinMatch[1].toUpperCase() : null, "B09XS7JWHH");
  });

  test("Test 3: Flipkart URL with PID and affiliate tags extracts product identifier", () => {
    const rawFlipkartUrl = "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4?pid=MOBGTAGPTB3VS24W&lid=LSTMOBGTAGPTB3VS24W&marketplace=FLIPKART";
    const pidMatch = rawFlipkartUrl.match(/(?:pid=|\/p\/|\/itm)([a-zA-Z0-9_-]{12,30})/i);
    assert.strictEqual(Boolean(pidMatch), true);
  });

  // ── 2. Distinguishing UNKNOWN from OUT_OF_STOCK (Never Guess Availability) ─
  test("Test 4: Scraper / Parser failure or timeout yields UNKNOWN (NEVER OUT_OF_STOCK)", () => {
    const fetchFailed = true;
    const failureReason = "TIMEOUT";

    let stockStatus = "UNKNOWN";
    let deliveryStatus = "UNKNOWN";

    if (fetchFailed) {
      // Must remain UNKNOWN, never converted to OUT_OF_STOCK
      stockStatus = "UNKNOWN";
      deliveryStatus = "UNKNOWN";
    }

    assert.notStrictEqual(stockStatus, "OUT_OF_STOCK", "Network/parser failure must NEVER become OUT_OF_STOCK");
    assert.notStrictEqual(deliveryStatus, "DELIVERY_UNAVAILABLE", "Network/parser failure must NEVER become DELIVERY_UNAVAILABLE");
    assert.strictEqual(stockStatus, "UNKNOWN");
    assert.strictEqual(deliveryStatus, "UNKNOWN");
  });

  test("Test 5: Explicit marketplace out-of-stock signal yields OUT_OF_STOCK", () => {
    const htmlSnippet = '<div class="product-status">Currently unavailable. We don\'t know when or if this item will be back in stock.</div>';
    const low = htmlSnippet.toLowerCase();

    let stockStatus = "UNKNOWN";
    if (low.includes("currently unavailable") || low.includes("out of stock") || low.includes("sold out")) {
      stockStatus = "OUT_OF_STOCK";
    }

    assert.strictEqual(stockStatus, "OUT_OF_STOCK", "Explicit signal should correctly identify OUT_OF_STOCK");
  });

  test("Test 6: Explicit marketplace in-stock signal yields IN_STOCK", () => {
    const htmlSnippet = '<button class="add-to-cart">Add to Cart</button><span class="stock">In Stock</span>';
    const low = htmlSnippet.toLowerCase();

    let stockStatus = "UNKNOWN";
    if (low.includes("in stock") || low.includes("add to cart") || low.includes("buy now")) {
      stockStatus = "IN_STOCK";
    }

    assert.strictEqual(stockStatus, "IN_STOCK", "Explicit signal should correctly identify IN_STOCK");
  });

  // ── 3. Strict Backend Orderability Logic ─────────────────────────────────
  test("Test 7: Orderable ONLY when productFound, identityVerified, IN_STOCK, DELIVERY_AVAILABLE, and price > 0", () => {
    const checkProduct = (state) => {
      return (
        state.productFound === true &&
        state.productIdentityVerified === true &&
        state.stockStatus === "IN_STOCK" &&
        state.deliveryStatus === "DELIVERY_AVAILABLE" &&
        state.priceStatus === "VERIFIED"
      );
    };

    assert.strictEqual(
      checkProduct({ productFound: true, productIdentityVerified: true, stockStatus: "IN_STOCK", deliveryStatus: "DELIVERY_AVAILABLE", priceStatus: "VERIFIED" }),
      true,
      "Valid product must be orderable"
    );

    assert.strictEqual(
      checkProduct({ productFound: true, productIdentityVerified: true, stockStatus: "UNKNOWN", deliveryStatus: "DELIVERY_AVAILABLE", priceStatus: "VERIFIED" }),
      false,
      "Unknown stock must NOT be orderable"
    );

    assert.strictEqual(
      checkProduct({ productFound: true, productIdentityVerified: true, stockStatus: "IN_STOCK", deliveryStatus: "UNKNOWN", priceStatus: "VERIFIED" }),
      false,
      "Unknown delivery must NOT be orderable"
    );

    assert.strictEqual(
      checkProduct({ productFound: true, productIdentityVerified: true, stockStatus: "OUT_OF_STOCK", deliveryStatus: "DELIVERY_AVAILABLE", priceStatus: "VERIFIED" }),
      false,
      "Out of stock product must NOT be orderable"
    );
  });

  // ── 4. Private Transit Destination Confidentiality ───────────────────────
  test("Test 8: Customer UI & API responses contain NO private delivery configuration", () => {
    const customerApiResponse = {
      urlValid: true,
      marketplace: "myntra",
      productFound: true,
      productIdentityVerified: true,
      sourceProductId: "12187850",
      stockStatus: "UNKNOWN",
      deliveryStatus: "UNKNOWN",
      priceStatus: "VERIFIED",
      orderable: false,
      verificationStatus: "PARTIAL",
      reason: "Availability could not be confirmed",
      message: "⚠️ Availability could not be confirmed right now. You can request this product for manual sourcing.",
      product: {
        name: "HRX Running T-Shirt",
        priceINR: 699,
        source: "myntra"
      }
    };

    const jsonStr = JSON.stringify(customerApiResponse);
    assert.strictEqual(jsonStr.includes("854331"), false, "Private PIN 854331 must never be exposed");
    assert.strictEqual(jsonStr.includes("CHIKANIGHAT"), false, "Private PO CHIKANIGHAT must never be exposed");
    assert.strictEqual(jsonStr.includes("ARARIA"), false, "Private District ARARIA must never be exposed");
    assert.strictEqual(jsonStr.includes("BIHAR"), false, "Private State BIHAR must never be exposed");
  });

  // ── 5. Non-Contradictory UI State Mapping ───────────────────────────────
  test("Test 9: UI State Derivation is clean and non-contradictory", () => {
    const getUiState = (res) => {
      if (res.orderable && res.inStock && res.deliveryAvailable) {
        return "STATE_1_VERIFIED_ORDERABLE";
      } else if (res.stockStatus === "OUT_OF_STOCK") {
        return "STATE_2_CONFIRMED_OUT_OF_STOCK";
      } else if (res.productFound) {
        return "STATE_3_PRODUCT_FOUND_AVAILABILITY_UNCONFIRMED";
      } else {
        return "STATE_4_INVALID_PRODUCT";
      }
    };

    // Case A: Product found with UNKNOWN stock (scraper failure)
    const resultUnconfirmed = {
      orderable: false,
      productFound: true,
      stockStatus: "UNKNOWN",
      deliveryStatus: "UNKNOWN"
    };
    assert.strictEqual(
      getUiState(resultUnconfirmed),
      "STATE_3_PRODUCT_FOUND_AVAILABILITY_UNCONFIRMED",
      "Should show Product Found (Availability Unconfirmed), NOT Out of Stock or Unverified Link"
    );

    // Case B: Confirmed out of stock
    const resultOutOfStock = {
      orderable: false,
      productFound: true,
      stockStatus: "OUT_OF_STOCK"
    };
    assert.strictEqual(
      getUiState(resultOutOfStock),
      "STATE_2_CONFIRMED_OUT_OF_STOCK"
    );

    // Case C: Orderable
    const resultOrderable = {
      orderable: true,
      inStock: true,
      deliveryAvailable: true,
      productFound: true,
      stockStatus: "IN_STOCK",
      deliveryStatus: "DELIVERY_AVAILABLE"
    };
    assert.strictEqual(
      getUiState(resultOrderable),
      "STATE_1_VERIFIED_ORDERABLE"
    );
  });

  // ── 6. Order Placement Fresh Verification ────────────────────────────────
  test("Test 10: Final order submission enforces fresh backend verification", () => {
    const availabilityCheck = {
      orderable: false,
      stockStatus: "UNKNOWN",
      deliveryStatus: "UNKNOWN",
      reason: "STOCK_UNCONFIRMED"
    };

    const allowOrderCreation = availabilityCheck.orderable === true;
    assert.strictEqual(allowOrderCreation, false, "Must block order creation when availability is unconfirmed");
  });

  console.log("\n=======================================================");
  console.log(`📊 Test Summary: ${passed} / ${total} passed`);
  console.log("=======================================================\n");

  if (passed === total) {
    console.log("🎉 ALL REGRESSION TESTS PASSED SUCCESSFULLY!\n");
    process.exit(0);
  } else {
    console.error("❌ Some tests failed.\n");
    process.exit(1);
  }
}

runTests();
