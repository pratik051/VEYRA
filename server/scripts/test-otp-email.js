import dotenv from "dotenv";
import { sendPasswordResetOtpEmail } from "../services/emailService.js";

dotenv.config();

async function testOtp() {
  console.log("Testing OTP Verification Code Email sending...");
  const targetEmail = "sajilomarts@gmail.com";
  const testOtp = "849201";
  const recipientName = "SajiloMarts Admin";

  const result = await sendPasswordResetOtpEmail(targetEmail, testOtp, recipientName);
  console.log("OTP Email Result:", result);

  if (!result.success) {
    throw new Error(`Failed to send OTP: ${result.error}`);
  }
  console.log("✓ OTP Verification Code Email delivered successfully to", targetEmail);
}

testOtp().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
