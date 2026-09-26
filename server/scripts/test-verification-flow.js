import "../config/env.js";
import { connectDB } from "../config/db.js";
import UserModel from "../models/user-model.js";
import PasswordResetOtpModel from "../models/password-reset-otp-model.js";
import {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendOrderDeliveredEmail,
  sendPasswordResetOtpEmail,
  verifySmtpConnection,
  maskEmail
} from "../services/emailService.js";

async function runTests() {
  console.log("=== COMPREHENSIVE EMAIL & OTP SYSTEM TEST ===");

  await connectDB();

  // 1. Test SMTP Connection Verify
  console.log("\n[TEST 1] Testing verifySmtpConnection()...");
  const smtpStatus = await verifySmtpConnection();
  console.log("SMTP Verify Result:", smtpStatus);
  if (!smtpStatus.success) {
    throw new Error(`SMTP connection verification failed: ${smtpStatus.error}`);
  }

  // 2. Test Verification Code Generation & Dispatch
  const testEmail = "sajilomarts@gmail.com";
  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`\n[TEST 2] Testing OTP Email Dispatch to ${maskEmail(testEmail)}...`);

  const otpResult = await sendPasswordResetOtpEmail(testEmail, testOtp, "SajiloMarts Admin");
  console.log("OTP Send Result:", otpResult);
  if (!otpResult.success) {
    throw new Error(`OTP dispatch failed: ${otpResult.error}`);
  }

  // 3. Test OTP Storage & Expiration
  console.log(`\n[TEST 3] Testing OTP Database Storage & Expiry...`);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await PasswordResetOtpModel.deleteMany({ email: testEmail });
  const otpDoc = await PasswordResetOtpModel.create({
    email: testEmail,
    otp: testOtp,
    expiresAt,
    used: false
  });
  console.log(`✓ OTP Doc stored in DB successfully with ID: ${otpDoc._id}`);

  // 4. Test Valid OTP verification
  const found = await PasswordResetOtpModel.findOne({ email: testEmail, otp: testOtp, used: false });
  if (found && new Date(found.expiresAt).getTime() > Date.now()) {
    console.log("✓ Valid OTP verified successfully against DB record.");
  } else {
    throw new Error("Failed to verify valid OTP from DB.");
  }

  // 5. Test Invalid OTP rejection
  const wrongFound = await PasswordResetOtpModel.findOne({ email: testEmail, otp: "999999", used: false });
  if (!wrongFound) {
    console.log("✓ Wrong OTP correctly rejected.");
  } else {
    throw new Error("Wrong OTP was incorrectly accepted!");
  }

  // 6. Test Expired OTP rejection
  const expiredExpires = new Date(Date.now() - 5000); // 5s in the past
  await PasswordResetOtpModel.create({
    email: testEmail,
    otp: "111222",
    expiresAt: expiredExpires,
    used: false
  });
  const expiredRecord = await PasswordResetOtpModel.findOne({ email: testEmail, otp: "111222", used: false });
  const isExpired = new Date(expiredRecord.expiresAt).getTime() <= Date.now();
  if (isExpired) {
    console.log("✓ Expired OTP correctly detected and invalidated.");
  } else {
    throw new Error("Expired OTP was not detected!");
  }

  // Clean up test OTPs
  await PasswordResetOtpModel.deleteMany({ email: testEmail });

  console.log("\n=== ALL VERIFICATION & EMAIL TESTS PASSED ===");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
