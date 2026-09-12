import nodemailer, { type Transporter } from "nodemailer";

const SMTP_USER =
  process.env.SMTP_USER ||
  process.env.GMAIL_USER ||
  "pratikshah2990@gmail.com";

const SMTP_PASS = (
  process.env.SMTP_PASS ||
  process.env.GMAIL_APP_PASSWORD ||
  "cuca sdmp oeln hmna"
).replace(/\s+/g, "");

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendPasswordResetOtpEmail(
  toEmail: string,
  otpCode: string,
  recipientName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getTransporter();
    const name = recipientName || "Valued Customer";

    const mailOptions = {
      from: `"LINKOVA Support" <${SMTP_USER}>`,
      to: toEmail,
      subject: `${otpCode} is your LINKOVA verification code`,
      text: `Hello ${name},\n\nYour 6-digit password reset verification code for LINKOVA is: ${otpCode}\n\nThis code expires in 10 minutes.\n\nIf you did not request this password reset, please ignore this email.\n\n— The LINKOVA Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LINKOVA Password Reset Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background: linear-gradient(180deg, #131b2e 0%, #0d1322 100%); border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
              <div style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); border-radius: 12px; padding: 10px 16px; margin-bottom: 12px;">
                <span style="font-weight: 900; font-size: 20px; color: #ffffff; letter-spacing: 2px;">LINKOVA</span>
              </div>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                India-to-Nepal Direct Marketplace Sourcing
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #ffffff; text-align: center;">
                Password Reset Verification
              </h2>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 22px; color: #94a3b8; text-align: center;">
                Hi <strong style="color: #f8fafc;">${name}</strong>, use the 6-digit one-time passcode below to verify your identity and reset your LINKOVA account password:
              </p>

              <!-- OTP Code Display -->
              <div style="background: rgba(14, 165, 233, 0.08); border: 2px dashed #0284c7; border-radius: 16px; padding: 22px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; display: inline-block; margin-left: 8px;">
                  ${otpCode}
                </span>
                <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                  ⏱ Valid for <strong style="color: #f1f5f9;">10 minutes</strong>
                </p>
              </div>

              <div style="background: #0b1120; border-radius: 12px; padding: 14px 18px; border: 1px solid #1e293b; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b;">
                  🔒 <strong style="color: #cbd5e1;">Security Notice:</strong> Never share this code with anyone. LINKOVA support staff will never ask for your verification code.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b; text-align: center;">
                If you did not request a password reset, you can safely ignore this email. Your current password remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #080c14; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} LINKOVA Nepal. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 10px; color: #334155;">
                Kathmandu &bull; Pokhara &bull; Biratnagar &bull; All 7 Provinces of Nepal
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };

    const info = await client.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("sendPasswordResetOtpEmail error:", error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}
