import nodemailer from "nodemailer";

const SMTP_USER =
  process.env.SMTP_USER ||
  process.env.GMAIL_USER ||
  "";

const SMTP_PASS = (
  process.env.SMTP_PASS ||
  process.env.GMAIL_APP_PASSWORD ||
  ""
).replace(/\s+/g, "");

let transporter = null;

function getTransporter() {
  if (!transporter) {
    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error("SMTP credentials are not configured in environment variables.");
    }
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

/**
 * Send Welcome Email upon new customer account creation
 */
export async function sendWelcomeEmail(toEmail, customerName) {
  try {
    if (!toEmail || !toEmail.includes("@") || toEmail.endsWith(".internal")) {
      return { success: false, error: "Invalid email address" };
    }
    const client = getTransporter();
    const name = (customerName || "Valued Customer").trim();

    const mailOptions = {
      from: `"SajiloMarts" <${SMTP_USER}>`,
      to: toEmail,
      subject: `Welcome to SajiloMarts! 🎉`,
      text: `Hello ${name},\n\nWelcome to SajiloMarts!\n\nThank you for creating your account with us. You can now explore products and source products from Indian marketplaces and have them delivered to Nepal.\n\nWe're happy to have you with us.\n\nThank you for choosing SajiloMarts.\n\nRegards,\nSajiloMarts Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SajiloMarts</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <div style="display: inline-block; background-color: #f59e0b; border-radius: 12px; padding: 10px 20px; margin-bottom: 8px;">
                <span style="font-weight: 900; font-size: 20px; color: #09090b; letter-spacing: 1px;">SajiloMarts</span>
              </div>
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Shop from India • Delivered to Nepal
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 800; color: #0f172a;">
                Welcome to SajiloMarts! 🎉
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 24px; color: #334155;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 24px; color: #334155;">
                Thank you for creating your account with us. You can now explore products and source products from Indian marketplaces and have them delivered to Nepal.
              </p>
              <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 14px; padding: 18px 20px; margin: 24px 0;">
                <h4 style="margin: 0 0 6px; font-size: 13px; font-weight: 800; color: #92400e;">
                  🇮🇳 Ready to source from India?
                </h4>
                <p style="margin: 0; font-size: 13px; line-height: 20px; color: #78350f;">
                  Simply copy any product link from Amazon, Flipkart, Myntra, or AJIO, paste it into our quote calculator, and get instant NPR pricing with doorstep delivery.
                </p>
              </div>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 24px; color: #334155;">
                We're happy to have you with us.
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 24px; color: #334155;">
                Thank you for choosing SajiloMarts.
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #64748b;">
                Regards,<br>
                <strong style="color: #0f172a;">SajiloMarts Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} SajiloMarts Nepal. All rights reserved.
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
  } catch (error) {
    console.warn("[Mailer Welcome Notice]:", error?.message || error);
    return { success: false, error: error?.message || "Failed to send welcome email" };
  }
}

/**
 * Send Purchase Confirmation Email when order is created
 */
export async function sendOrderConfirmationEmail(toEmail, order) {
  try {
    if (!toEmail || !toEmail.includes("@") || toEmail.endsWith(".internal")) {
      return { success: false, error: "Invalid email address" };
    }
    const client = getTransporter();

    const orderId = order.orderId || order._id || "ORD";
    const customerName = (order.customerName || order.fullName || order.shippingAddress?.fullName || "Valued Customer").trim();
    const productName = (order.productName || (order.items && order.items[0]?.name) || "Sourced Indian Product").trim();
    const quantity = order.quantity || (order.items && order.items[0]?.quantity) || 1;
    const indianPriceINR = order.indianPriceINR || 0;
    const conversionAmountNPR = order.conversionAmountNPR || (order.subtotal) || 0;
    const serviceChargeNPR = order.serviceChargeNPR || 0;
    const deliveryChargeNPR = order.deliveryChargeNPR !== undefined ? order.deliveryChargeNPR : (order.deliveryFee !== undefined ? order.deliveryFee : 200);
    const finalAmountNPR = order.finalAmountNPR || order.totalAmount || order.total || 0;
    const deliveryAddress = order.deliveryAddress || order.fullAddress || order.shippingAddress?.deliveryAddress || order.shippingAddress?.fullAddress || "Nepal";
    const orderStatus = order.orderStatus || order.status || "Requested";
    const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const trackUrl = `https://www.sajilomarts.tech/track-order?id=${encodeURIComponent(orderId)}`;

    const mailOptions = {
      from: `"SajiloMarts Orders" <${SMTP_USER}>`,
      to: toEmail,
      subject: `Thank You for Your Purchase – SajiloMarts Order #${orderId}`,
      text: `Hello ${customerName},\n\nThank you for your purchase from SajiloMarts! 🎉\n\nYour order has been successfully received.\n\nOrder ID: #${orderId}\nOrder Date: ${orderDate}\nProduct: ${productName} (Qty: ${quantity})\nOriginal Indian Price: ₹${indianPriceINR.toLocaleString()} INR\nNPR Converted Base: NPR ${conversionAmountNPR.toLocaleString()}\nService Charge: NPR ${serviceChargeNPR.toLocaleString()}\nDelivery Charge: NPR ${deliveryChargeNPR.toLocaleString()}\nFinal Landed Amount: NPR ${finalAmountNPR.toLocaleString()}\nDelivery Address: ${deliveryAddress}\nOrder Status: ${orderStatus}\n\nTrack your order anytime here: ${trackUrl}\n\nWe are now processing your order and will keep you updated about its progress.\n\nThank you for trusting SajiloMarts.\n\nRegards,\nSajiloMarts Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SajiloMarts Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 28px 32px; background-color: #0f172a; text-align: center;">
              <div style="display: inline-block; background-color: #f59e0b; border-radius: 10px; padding: 8px 18px; margin-bottom: 6px;">
                <span style="font-weight: 900; font-size: 18px; color: #09090b; letter-spacing: 1px;">SajiloMarts</span>
              </div>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Purchase Confirmation
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #0f172a;">
                Thank you for your purchase from SajiloMarts! 🎉
              </h2>
              <p style="margin: 0 0 18px; font-size: 14px; line-height: 22px; color: #334155;">
                Hello <strong>${customerName}</strong>,<br>
                Your order has been successfully received and logged into our cross-border sourcing system.
              </p>

              <!-- Order Summary Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 13px; color: #334155;">
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Order ID:</td>
                    <td style="text-align: right; font-weight: 800; color: #0f172a;">#${orderId}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Order Date:</td>
                    <td style="text-align: right; color: #334155;">${orderDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Order Status:</td>
                    <td style="text-align: right; font-weight: 700; color: #d97706;">${orderStatus}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 6px;"></td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Product:</td>
                    <td style="text-align: right; font-weight: 700; color: #0f172a;">${productName}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Quantity:</td>
                    <td style="text-align: right; color: #334155;">${quantity}</td>
                  </tr>
                  ${indianPriceINR ? `
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Original Indian Price:</td>
                    <td style="text-align: right; color: #334155;">₹${indianPriceINR.toLocaleString()} INR</td>
                  </tr>` : ''}
                  ${conversionAmountNPR ? `
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Converted NPR Base:</td>
                    <td style="text-align: right; color: #334155;">NPR ${conversionAmountNPR.toLocaleString()}</td>
                  </tr>` : ''}
                  ${serviceChargeNPR ? `
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Sourcing & Service Fee:</td>
                    <td style="text-align: right; color: #334155;">NPR ${serviceChargeNPR.toLocaleString()}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Nepal Delivery Charge:</td>
                    <td style="text-align: right; color: #334155;">NPR ${deliveryChargeNPR.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top: 2px solid #cbd5e1; padding-top: 10px;"></td>
                  </tr>
                  <tr>
                    <td style="font-size: 15px; font-weight: 800; color: #0f172a;">Final Total Landed Price:</td>
                    <td style="text-align: right; font-size: 16px; font-weight: 900; color: #d97706;">NPR ${finalAmountNPR.toLocaleString()}</td>
                  </tr>
                </table>
              </div>

              <!-- Shipping Info -->
              <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">
                  Delivery Address:
                </span>
                <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 20px;">
                  ${deliveryAddress}
                </p>
              </div>

              <!-- Action Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${trackUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
                  Track Order Status ➔
                </a>
              </div>

              <p style="margin: 0 0 16px; font-size: 13px; line-height: 22px; color: #475569;">
                We are now processing your order and will keep you updated about its progress.
              </p>
              <p style="margin: 0 0 20px; font-size: 13px; line-height: 22px; color: #475569;">
                Thank you for trusting SajiloMarts.
              </p>
              <p style="margin: 0; font-size: 13px; line-height: 18px; color: #64748b;">
                Regards,<br>
                <strong style="color: #0f172a;">SajiloMarts Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} SajiloMarts Nepal. All rights reserved.
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
  } catch (error) {
    console.warn("[Mailer Purchase Notice]:", error?.message || error);
    return { success: false, error: error?.message || "Failed to send purchase confirmation email" };
  }
}

/**
 * Send Order Delivered Email when order is marked DELIVERED
 */
export async function sendOrderDeliveredEmail(toEmail, order) {
  try {
    if (!toEmail || !toEmail.includes("@") || toEmail.endsWith(".internal")) {
      return { success: false, error: "Invalid email address" };
    }
    const client = getTransporter();

    const orderId = order.orderId || order._id || "ORD";
    const customerName = (order.customerName || order.fullName || order.shippingAddress?.fullName || "Valued Customer").trim();

    const mailOptions = {
      from: `"SajiloMarts" <${SMTP_USER}>`,
      to: toEmail,
      subject: `Your SajiloMarts Order Has Been Delivered 🎉`,
      text: `Hello ${customerName},\n\nYour SajiloMarts order #${orderId} has been successfully delivered.\n\nThank you for trusting SajiloMarts and choosing us to bring your products from India to Nepal.\n\nWe truly appreciate your purchase.\n\nThank you for trusting us. ❤️\n\nRegards,\nSajiloMarts Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Been Delivered</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 28px 32px; background-color: #065f46; text-align: center;">
              <div style="display: inline-block; background-color: #ffffff; border-radius: 10px; padding: 8px 18px; margin-bottom: 6px;">
                <span style="font-weight: 900; font-size: 18px; color: #065f46; letter-spacing: 1px;">SajiloMarts</span>
              </div>
              <p style="margin: 0; font-size: 11px; color: #a7f3d0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Package Delivered Successfully
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 800; color: #065f46;">
                Your Order Has Been Delivered 🎉
              </h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 24px; color: #334155;">
                Hello <strong>${customerName}</strong>,
              </p>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 24px; color: #334155;">
                Your SajiloMarts order <strong style="color: #0f172a;">#${orderId}</strong> has been successfully delivered.
              </p>
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 14px; padding: 18px 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 22px; color: #065f46; font-weight: 600;">
                  Thank you for trusting SajiloMarts and choosing us to bring your products from India to Nepal.
                </p>
              </div>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 24px; color: #334155;">
                We truly appreciate your purchase.
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 24px; color: #334155;">
                Thank you for trusting us. ❤️
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #64748b;">
                Regards,<br>
                <strong style="color: #0f172a;">SajiloMarts Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} SajiloMarts Nepal. All rights reserved.
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
  } catch (error) {
    console.warn("[Mailer Delivered Notice]:", error?.message || error);
    return { success: false, error: error?.message || "Failed to send delivered email" };
  }
}

/**
 * Send Password Reset OTP verification code email
 */
export async function sendPasswordResetOtpEmail(toEmail, otpCode, recipientName) {
  try {
    const client = getTransporter();
    const name = recipientName || "Valued Customer";

    const mailOptions = {
      from: `"SajiloMarts Support" <${SMTP_USER}>`,
      to: toEmail,
      subject: `${otpCode} is your SAJILOMARTS verification code`,
      text: `Hello ${name},\n\nYour 6-digit password reset verification code for SAJILOMARTS is: ${otpCode}\n\nThis code expires in 10 minutes.\n\nIf you did not request this password reset, please ignore this email.\n\n— The SAJILOMARTS Team`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SAJILOMARTS Password Reset Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background: linear-gradient(180deg, #131b2e 0%, #0d1322 100%); border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <tr>
            <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
              <div style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); border-radius: 12px; padding: 10px 16px; margin-bottom: 12px;">
                <span style="font-weight: 900; font-size: 20px; color: #ffffff; letter-spacing: 2px;">SAJILOMARTS</span>
              </div>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                India-to-Nepal Direct Marketplace Sourcing
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #ffffff; text-align: center;">
                Password Reset Verification
              </h2>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 22px; color: #94a3b8; text-align: center;">
                Hi <strong style="color: #f8fafc;">${name}</strong>, use the 6-digit one-time passcode below to verify your identity and reset your SAJILOMARTS account password:
              </p>
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
                  🔒 <strong style="color: #cbd5e1;">Security Notice:</strong> Never share this code with anyone. SAJILOMARTS support staff will never ask for your verification code.
                </p>
              </div>
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b; text-align: center;">
                If you did not request a password reset, you can safely ignore this email. Your current password remains secure.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #080c14; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} SAJILOMARTS Nepal. All rights reserved.
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
  } catch (error) {
    console.warn("[Mailer OTP Notice]:", error?.message || error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}
