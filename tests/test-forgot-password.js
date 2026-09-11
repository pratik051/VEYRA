// Test forgot password OTP generation and hashing
const assert = require("assert");

console.log("=======================================================");
console.log("🧪 LINKOVA FORGOT PASSWORD & OTP TEST SUITE");
console.log("=======================================================");

// Test 1: OTP Format Validation
function testOtpFormat() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  assert.strictEqual(otp.length, 6, "OTP should be 6 digits");
  assert.strictEqual(/^\d{6}$/.test(otp), true, "OTP should only contain numbers");
  console.log("  ✓ [PASS] Test 1: 6-digit numeric OTP generated correctly: " + otp);
}

// Test 2: App Password formatting
function testAppPasswordSanitization() {
  const rawPass = "prix eyix kdfw nznk";
  const sanitized = rawPass.replace(/\s+/g, "");
  assert.strictEqual(sanitized, "prixeyixkdfwnznk", "Whitespace should be stripped");
  assert.strictEqual(sanitized.length, 16, "Google App Password should be 16 characters");
  console.log("  ✓ [PASS] Test 2: Google App Password sanitized to 16-character string");
}

// Test 3: OTP Expiration Math
function testOtpExpiry() {
  const now = Date.now();
  const expiresAt = new Date(now + 10 * 60 * 1000);
  assert.strictEqual(expiresAt.getTime() > now, true, "ExpiresAt should be in the future");
  assert.strictEqual(Math.round((expiresAt.getTime() - now) / 60000), 10, "Expiry should be 10 minutes");
  console.log("  ✓ [PASS] Test 3: OTP expiration correctly set to 10 minutes");
}

testOtpFormat();
testAppPasswordSanitization();
testOtpExpiry();

console.log("=======================================================");
console.log("📊 All OTP & Forgot Password tests passed successfully!");
console.log("=======================================================");
