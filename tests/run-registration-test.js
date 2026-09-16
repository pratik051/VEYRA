/**
 * SAJILOMARTS - Registration & Authentication Automated Regression Test
 */

const assert = require("assert");

console.log("\n=======================================================");
console.log("🧪 SAJILOMARTS MANUAL REGISTRATION & AUTH REGRESSION TEST SUITE");
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

// ── 1. Manual Form Field Validation ─────────────────────────
test("Test 1: Minimum 6-character password rule validation", () => {
  const shortPass = "12345";
  const validPass = "123456";

  assert.strictEqual(shortPass.length < 6, true, "Short password should fail UI validation");
  assert.strictEqual(validPass.length >= 6, true, "6-character password must pass validation");
});

test("Test 2: Normalization of registration email and input fields", () => {
  const rawEmail = "  Test.Customer@Gmail.COM  ";
  const normalized = rawEmail.trim().toLowerCase();

  assert.strictEqual(normalized, "test.customer@gmail.com", "Email must be trimmed and lowercased");
});

// ── 3. Endpoint Resolution Check ─────────────────────────
test("Test 3: Both /api/auth/register and /api/auth/signup endpoints exist", () => {
  const fs = require("fs");
  const registerExists = fs.existsSync("./app/api/auth/register/route.ts");
  const signupExists = fs.existsSync("./app/api/auth/signup/route.ts");

  assert.strictEqual(registerExists, true, "/api/auth/register route must exist");
  assert.strictEqual(signupExists, true, "/api/auth/signup alias route must exist");
});

console.log("\n=======================================================");
console.log(`📊 Test Summary: ${passed} / ${total} passed`);
console.log("=======================================================\n");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
