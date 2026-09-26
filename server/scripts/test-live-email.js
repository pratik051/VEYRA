import "../config/env.js";
import { getSmtpConfig, getTransporter, sendWelcomeEmail, verifySmtpConnection, maskEmail } from "../services/emailService.js";

async function testLiveEmailDelivery() {
  console.log("================================================================================");
  console.log("            SajiloMarts — Live Production SMTP Delivery Diagnostic            ");
  console.log("================================================================================\n");

  const config = getSmtpConfig();
  console.log(`1. Target SMTP Host:      ${config.host}`);
  console.log(`2. Target SMTP Port:      ${config.port}`);
  console.log(`3. SSL/TLS Secure:        ${config.secure}`);
  console.log(`4. Configured User:       ${maskEmail(config.user)}`);
  console.log(`5. Password Configured:   ${config.pass ? "YES (Valid non-empty token/app password)" : "NO (MISSING)"}\n`);

  if (!config.user || !config.pass) {
    console.error("❌ Error: SMTP credentials are not configured in environment variables.");
    process.exit(1);
  }

  // 1. Test Transporter Connection Handshake
  console.log("Testing SMTP handshake connection...");
  const connResult = await verifySmtpConnection();
  if (!connResult.success) {
    console.error("❌ SMTP connection handshake failed:", connResult.error);
    process.exit(1);
  }
  console.log("✓ SMTP handshake successful!\n");

  // 2. Send Live Test Email to sajilomarts@gmail.com
  const targetEmail = "sajilomarts@gmail.com";
  console.log(`Sending live test welcome email to [${targetEmail}]...`);
  
  const client = getTransporter();
  const mailOptions = {
    from: `"SajiloMarts" <${config.user}>`,
    to: targetEmail,
    subject: `SajiloMarts Live Email Delivery Test — ${new Date().toLocaleTimeString()}`,
    text: `Hello SajiloMarts Admin,\n\nThis is a live test notification confirming that the automated email delivery system for https://www.sajilomarts.tech is 100% active, connected, and delivering messages.\n\nTimestamp: ${new Date().toISOString()}\n\n— SajiloMarts System Diagnostic`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 32px 16px;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: #0f172a; border-radius: 10px; padding: 10px 16px; display: inline-block; margin-bottom: 16px;">
            <span style="color: #f59e0b; font-weight: 900; font-size: 18px; letter-spacing: 1px;">SAJILOMARTS</span>
          </div>
          <h2 style="color: #0f172a; margin: 0 0 12px; font-size: 20px;">✓ Live Email Delivery Verified</h2>
          <p style="color: #475569; font-size: 14px; line-height: 22px; margin: 0 0 16px;">
            This email confirms that the production email delivery pipeline for <a href="https://www.sajilomarts.tech" style="color: #2563eb; font-weight: 600;">https://www.sajilomarts.tech</a> is online, authenticated, and successfully delivering customer notifications.
          </p>
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px; margin-bottom: 18px;">
            <p style="margin: 0; color: #065f46; font-size: 13px; font-weight: 700;">
              Status: ACTIVE &amp; OPERATIONAL
            </p>
            <p style="margin: 4px 0 0; color: #047857; font-size: 12px;">
              Delivered at: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" })} (Nepal Time)
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} SajiloMarts Nepal. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    const sendInfo = await client.sendMail(mailOptions);
    console.log(`\n================================================================================`);
    console.log(`✓ LIVE EMAIL SENT SUCCESSFULLY!`);
    console.log(`Recipient:       ${targetEmail}`);
    console.log(`Message ID:      ${sendInfo.messageId}`);
    console.log(`Server Response: ${sendInfo.response}`);
    console.log(`================================================================================\n`);
    console.log("Check the inbox/spam of sajilomarts@gmail.com to see the received test email.");
  } catch (err) {
    console.error(`❌ sendMail failed:`, err?.message || err);
  }
}

testLiveEmailDelivery();
