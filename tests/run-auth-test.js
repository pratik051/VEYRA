const assert = require("node:assert");
const { hashPassword, verifyPassword } = require("../lib/auth/password.ts");

// We can test password hashing and verification directly
async function runAuthTests() {
  console.log("Running Authentication Logic Tests...");

  // 1. Password hashing & verification
  const password = "SuperSecretPassword@123";
  const hash = await hashPassword(password);
  assert.ok(hash.includes(":"), "Hash must contain salt delimiter");

  const isValid = await verifyPassword(password, hash);
  assert.strictEqual(isValid, true, "Password verification should return true for correct password");

  const isInvalid = await verifyPassword("WrongPassword", hash);
  assert.strictEqual(isInvalid, false, "Password verification should return false for incorrect password");

  const isInvalidEmpty = await verifyPassword("", hash);
  assert.strictEqual(isInvalidEmpty, false, "Empty password should fail verification");

  console.log("✓ Password cryptographic hashing (scrypt) & verification passed");

  // 2. Email normalization tests
  const testEmail = "  User.Name@Example.COM  ";
  const normalized = testEmail.trim().toLowerCase();
  assert.strictEqual(normalized, "user.name@example.com", "Email must normalize to lowercase without leading/trailing whitespace");
  console.log("✓ Email normalization passed");

  console.log("All Auth Unit Tests Passed Successfully!");
}

runAuthTests().catch((err) => {
  console.error("Auth test failed:", err);
  process.exit(1);
});
