import "../config/env.js";
import nodemailer from "nodemailer";
import EmailNotificationModel from "../models/email-notification-model.js";
import UserModel from "../models/user-model.js";
import OrderModel from "../models/order-model.js";
import IndiaOrderModel from "../models/india-order-model.js";

// Helper to mask sensitive email addresses in server logs
export function maskEmail(email) {
  if (!email || typeof email !== "string" || !email.includes("@")) return "[invalid-email]";
  const [local, domain] = email.split("@");
  if (!local || !domain) return "[masked-email]";
  const visible = local.length > 2 ? local.slice(0, 2) : local.slice(0, 1);
  return `${visible}***@${domain}`;
}

// Dynamic Server-side SMTP credentials resolution
export function getSmtpConfig() {
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
  const port = parseInt((process.env.SMTP_PORT || "465").toString().trim(), 10) || 465;
  const is465 = port === 465;
  const secure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === "true" : is465;

  const rawUser =
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER ||
    "";

  const rawPass =
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.EMAIL_PASS ||
    "";

  // Clean strings by trimming and removing accidental wrapping quotes or internal whitespace
  const user = rawUser.trim().replace(/^["']|["']$/g, "");
  const pass = rawPass.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, "");

  return { host, port, secure, user, pass };
}

export function getEmailFrom() {
  const { user } = getSmtpConfig();
  const fromName = (process.env.EMAIL_FROM_NAME || "SajiloMarts").trim();
  return (
    process.env.EMAIL_FROM ||
    (user ? `"${fromName}" <${user}>` : `"SajiloMarts" <sajilomarts@gmail.com>`)
  );
}

export function getFrontendUrl() {
  return (process.env.FRONTEND_URL || "https://www.sajilomarts.tech").replace(/\/+$/, "");
}

/**
 * Send email via Resend / Brevo HTTPS REST API (Port 443 - zero socket timeout risk on cloud hosts)
 */
async function sendViaHttpsApi(mailOptions) {
  const resendKey = (process.env.RESEND_API_KEY || "").trim();
  const brevoKey = (process.env.BREVO_API_KEY || "").trim();

  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: mailOptions.from || getEmailFrom(),
        to: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (res.ok) {
      const json = await res.json();
      return { success: true, messageId: json.id || "resend-ok" };
    }
    const errText = await res.text();
    throw new Error(`Resend HTTPS API error (${res.status}): ${errText}`);
  }

  if (brevoKey) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: { email: "sajilomarts@gmail.com", name: "SajiloMarts" },
        to: [{ email: mailOptions.to }],
        subject: mailOptions.subject,
        htmlContent: mailOptions.html,
        textContent: mailOptions.text
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (res.ok) {
      const json = await res.json();
      return { success: true, messageId: json.messageId || "brevo-ok" };
    }
    const errText = await res.text();
    throw new Error(`Brevo HTTPS API error (${res.status}): ${errText}`);
  }

  return null;
}

/**
 * Create a fresh, single-use transport tailored for specific cloud network strategies (forcing IPv4)
 */
export function createTransportByStrategy(strategy = "port_465", customConfig = null) {
  const config = customConfig || getSmtpConfig();
  if (!config.user || !config.pass) {
    throw new Error("SMTP credentials are not configured in environment variables (SMTP_USER/SMTP_PASS).");
  }

  const isGmail = config.host.includes("gmail.com") || config.user.includes("@gmail.com");

  if (strategy === "gmail_service" && isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.user,
        pass: config.pass
      },
      pool: false,
      family: 4, // Force IPv4
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 9000
    });
  }

  if (strategy === "port_587") {
    return nodemailer.createTransport({
      host: config.host || "smtp.gmail.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: config.user,
        pass: config.pass
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2"
      },
      pool: false,
      family: 4, // Force IPv4
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 9000
    });
  }

  // Default: Direct Port 465 (SSL)
  return nodemailer.createTransport({
    host: config.host || "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: config.user,
      pass: config.pass
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2"
    },
    pool: false,
    family: 4, // Force IPv4
    connectionTimeout: 7000,
    greetingTimeout: 7000,
    socketTimeout: 9000
  });
}

// Cached reusable transporter
let cachedTransporter = null;
let cachedStrategy = null;

export function getTransporter() {
  if (!cachedTransporter) {
    cachedStrategy = "port_465";
    cachedTransporter = createTransportByStrategy("port_465");
  }
  return cachedTransporter;
}

/**
 * Execute email dispatch with automatic fallback between HTTPS API, SSL (465), STARTTLS (587), and Gmail Service
 */
export async function sendMailWithResilience(mailOptions) {
  // 1. Try HTTPS API first if API key configured (Zero timeout risk on cloud egress)
  try {
    const apiResult = await sendViaHttpsApi(mailOptions);
    if (apiResult) {
      console.log(`[Email Service] ✓ Email dispatched via HTTPS REST API to ${maskEmail(mailOptions.to)}`);
      return apiResult;
    }
  } catch (httpsErr) {
    console.warn(`[Email Service] HTTPS API attempt notice: ${httpsErr.message}. Falling back to resilient SMTP...`);
  }

  const config = getSmtpConfig();
  if (!config.user || !config.pass) {
    throw new Error("SMTP credentials are not configured in environment variables (SMTP_USER/SMTP_PASS).");
  }

  const isGmail = config.host.includes("gmail.com") || config.user.includes("@gmail.com");

  // Priority order with IPv4 enforced
  const strategies = isGmail
    ? [
        config.port === 587 ? "port_587" : "port_465",
        "port_587",
        "gmail_service",
        "port_465"
      ]
    : [
        config.secure ? "port_465" : "port_587",
        config.secure ? "port_587" : "port_465"
      ];

  const uniqueStrategies = Array.from(new Set(strategies));
  let lastError = null;

  for (let i = 0; i < uniqueStrategies.length; i++) {
    const strat = uniqueStrategies[i];
    try {
      const client = (cachedStrategy === strat && cachedTransporter)
        ? cachedTransporter
        : createTransportByStrategy(strat, config);

      const info = await client.sendMail(mailOptions);
      
      // Update cache on successful transport
      cachedTransporter = client;
      cachedStrategy = strat;

      if (i > 0) {
        console.log(`[Email Service] ✓ Email dispatched via fallback strategy '${strat}' to ${maskEmail(mailOptions.to)}`);
      }
      return info;
    } catch (err) {
      lastError = err;
      // Invalidate broken transporter from cache
      if (cachedStrategy === strat) {
        cachedTransporter = null;
        cachedStrategy = null;
      }

      const isTimeout =
        err?.code === "ETIMEDOUT" ||
        err?.code === "ESOCKET" ||
        err?.code === "ECONNREFUSED" ||
        err?.code === "ENOTFOUND" ||
        err?.command === "CONN" ||
        String(err?.message || "").toLowerCase().includes("timeout") ||
        String(err?.message || "").toLowerCase().includes("connection");

      console.warn(`[Email Service] Strategy '${strat}' (${i + 1}/${uniqueStrategies.length}) failed: ${err?.message || err}. ${isTimeout ? "Retrying with alternative cloud transport..." : ""}`);
    }
  }

  throw lastError || new Error("Failed to deliver email through all available SMTP cloud transport strategies.");
}


function buildEmailLayout({ headerTitle = "SajiloMarts", headerSubtitle = "Shop from India • Delivered to Nepal", bodyContent, badgeColor = "#f59e0b", badgeTextColor = "#09090b" }) {
  const currentYear = new Date().getFullYear();
  const frontendUrl = getFrontendUrl();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.06);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); text-align: center;">
              <a href="${frontendUrl}" style="text-decoration: none; display: inline-block;">
                <div style="display: inline-block; background-color: ${badgeColor}; border-radius: 10px; padding: 8px 20px; margin-bottom: 6px;">
                  <span style="font-weight: 900; font-size: 20px; color: ${badgeTextColor}; letter-spacing: 1.5px; text-transform: uppercase;">
                    SajiloMarts
                  </span>
                </div>
              </a>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px;">
                ${headerSubtitle}
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px 32px 28px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Support & Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; line-height: 18px;">
                Need help or have questions? Reach out to our support team at <a href="mailto:sajilomarts@gmail.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">sajilomarts@gmail.com</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                &copy; ${currentYear} SajiloMarts Nepal. Direct India-to-Nepal cross-border marketplace logistics. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function verifySmtpConnection() {
  try {
    const config = getSmtpConfig();
    if (!config.user || !config.pass) {
      return { success: false, configured: false, error: "SMTP credentials not provided in environment variables" };
    }
    const client = getTransporter();
    await client.verify();
    console.log(`[Email Service] ✓ SMTP connection verified successfully to ${config.host}:${config.port} (user: ${maskEmail(config.user)})`);
    return { success: true, configured: true, host: config.host, port: config.port };
  } catch (err) {
    console.warn(`[Email Service] ✗ SMTP verification failed:`, err?.message || err);
    return { success: false, configured: true, error: err?.message || "SMTP verification failed" };
  }
}

/**
 * Send Welcome Email upon new customer account creation
 */
export async function sendWelcomeEmail(toEmail, customerName, userId = "") {
  try {
    const cleanEmail = (toEmail || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.endsWith(".internal")) {
      return { success: false, error: "Invalid email address" };
    }

    // 1. Idempotency Check: Don't send duplicate welcome email
    if (userId) {
      const userDoc = await UserModel.findById(userId).lean();
      if (userDoc?.welcomeEmailSent) {
        return { success: true, skipped: true, reason: "Welcome email already sent" };
      }
    }

    const alreadySent = await EmailNotificationModel.findOne({
      $or: [
        ...(userId ? [{ userId: String(userId) }] : []),
        { recipient: cleanEmail }
      ],
      emailType: "WELCOME",
      success: true
    }).lean();

    if (alreadySent) {
      if (userId) {
        await UserModel.updateOne({ _id: userId }, { $set: { welcomeEmailSent: true } });
      }
      return { success: true, skipped: true, reason: "Welcome email already sent" };
    }

    const client = getTransporter();
    const name = (customerName || "Valued Customer").trim();
    const frontendUrl = getFrontendUrl();
    const actionUrl = `${frontendUrl}/order`;
    const homeUrl = frontendUrl;

    const subject = "Welcome to SajiloMarts! 🛍️";

    const textContent = `Hi ${name},

Welcome to SajiloMarts! 🎉

Your account has been successfully created.

You can now send us your favorite product links from Indian marketplaces and get a price and delivery quote for delivery to Nepal.

Start ordering Indian products today: ${actionUrl}

Thank you for choosing SajiloMarts.

Regards,
SajiloMarts Team
${homeUrl}`;

    const bodyContent = `
      <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 800; color: #0f172a;">
        Welcome to SajiloMarts! 🎉
      </h2>
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 24px; color: #334155;">
        Hi <strong>${name}</strong>,
      </p>
      <p style="margin: 0 0 16px; font-size: 14px; line-height: 24px; color: #334155;">
        Your account has been successfully created. We are excited to welcome you to the easiest way to shop from India and have your items delivered directly to your doorstep in Nepal!
      </p>

      <!-- Feature Highlight Card -->
      <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 14px; padding: 20px; margin: 24px 0;">
        <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 800; color: #92400e;">
          🛍️ Shop from Amazon, Flipkart, Myntra, AJIO & more!
        </h4>
        <p style="margin: 0 0 14px; font-size: 13px; line-height: 22px; color: #78350f;">
          Found something you love on an Indian marketplace? Simply copy the product link, paste it into our <strong>Order Direct from India</strong> tool, and get an instant NPR landed price with doorstep delivery across Nepal.
        </p>
        <div style="text-align: left;">
          <a href="${actionUrl}" style="display: inline-block; background-color: #d97706; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 10px 20px; border-radius: 8px;">
            Order Product Link ➔
          </a>
        </div>
      </div>

      <div style="text-align: center; margin: 28px 0 20px;">
        <a href="${homeUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
          Return to SajiloMarts ➔
        </a>
      </div>

      <p style="margin: 0 0 16px; font-size: 14px; line-height: 24px; color: #334155;">
        Thank you for choosing SajiloMarts.
      </p>
      <p style="margin: 0; font-size: 14px; line-height: 20px; color: #64748b;">
        Warm regards,<br>
        <strong style="color: #0f172a;">SajiloMarts Team</strong>
      </p>
    `;

    const htmlContent = buildEmailLayout({
      headerTitle: "Welcome to SajiloMarts",
      headerSubtitle: "Shop from India • Delivered to Nepal",
      bodyContent
    });

    const mailOptions = {
      from: getEmailFrom(),
      to: cleanEmail,
      subject,
      text: textContent,
      html: htmlContent
    };

    console.log(`[Email Service] Sending WELCOME email to ${maskEmail(cleanEmail)}...`);
    const info = await sendMailWithResilience(mailOptions);
    console.log(`[Email Service] ✓ WELCOME email sent to ${maskEmail(cleanEmail)} (MessageId: ${info.messageId || "N/A"})`);

    // Record notification in DB for idempotency
    await EmailNotificationModel.create({
      recipient: cleanEmail,
      emailType: "WELCOME",
      userId: userId ? String(userId) : "",
      subject,
      messageId: info.messageId || "",
      success: true
    });

    if (userId) {
      await UserModel.updateOne({ _id: userId }, { $set: { welcomeEmailSent: true } });
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[Email Service] ✗ Welcome email failed for ${maskEmail(toEmail)}:`, error?.message || error);
    return { success: false, error: error?.message || "Failed to send welcome email" };
  }
}

/**
 * Send Order Confirmation Email when customer creates an order/purchase
 */
export async function sendOrderConfirmationEmail(toEmail, order) {
  try {
    const cleanEmail = (toEmail || order?.email || order?.shippingAddress?.email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.endsWith(".internal")) {
      return { success: false, error: "Invalid email address" };
    }

    const orderId = String(order?.orderId || order?._id || "ORD").trim();

    // 1. Idempotency Check: Don't send duplicate order confirmation
    if (order?.confirmationEmailSent) {
      return { success: true, skipped: true, reason: "Order confirmation email already sent" };
    }

    const alreadySent = await EmailNotificationModel.findOne({
      orderId,
      emailType: "ORDER_CONFIRMATION",
      success: true
    }).lean();

    if (alreadySent) {
      await Promise.allSettled([
        OrderModel.updateOne({ orderId }, { $set: { confirmationEmailSent: true } }),
        IndiaOrderModel.updateOne({ orderId }, { $set: { confirmationEmailSent: true } })
      ]);
      return { success: true, skipped: true, reason: "Order confirmation email already sent" };
    }

    const client = getTransporter();

    // Extract dynamic fields safely from stored MongoDB order document
    const customerName = (
      order.customerName ||
      order.fullName ||
      order.shippingAddress?.fullName ||
      "Valued Customer"
    ).trim();

    const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
    const productName = (
      order.productName ||
      (items[0]?.name) ||
      "Sourced Indian Product"
    ).trim();
    const productImage = order.productImage || items[0]?.image || "";
    const quantity = order.quantity || (items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)) || 1;

    // Financials directly from stored order (DO NOT recalculate)
    const indianPriceINR = order.indianPriceINR || 0;
    const conversionAmountNPR = order.conversionAmountNPR || order.subtotal || order.pricing?.subtotal || 0;
    const serviceChargeNPR = order.serviceChargeNPR || 0;
    const deliveryChargeNPR = order.deliveryChargeNPR !== undefined
      ? order.deliveryChargeNPR
      : (order.deliveryFee !== undefined ? order.deliveryFee : (order.pricing?.deliveryFee !== undefined ? order.pricing.deliveryFee : 200));
    const customsTaxesNPR = order.customsChargeNPR || order.taxNPR || order.pricing?.tax || 0;
    const discountNPR = order.discountNPR || order.discount || order.pricing?.discount || 0;
    const finalAmountNPR = order.finalAmountNPR || order.totalAmount || order.total || (order.pricing?.totalAmount) || 0;

    const currentStatus = order.orderStatus || order.status || "Requested";
    const paymentStatus = order.paymentStatus || order.payment?.status || "Pending Verification";
    const paymentMethod = order.paymentMethod || order.payment?.method || "eSewa";

    const deliveryAddress = (
      order.deliveryAddress ||
      order.fullAddress ||
      order.shippingAddress?.deliveryAddress ||
      order.shippingAddress?.fullAddress ||
      "Nepal"
    ).trim();

    const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const frontendUrl = getFrontendUrl();
    const trackUrl = `${frontendUrl}/track-order?id=${encodeURIComponent(orderId)}`;
    const subject = `Order Confirmed — SajiloMarts #${orderId}`;

    const textContent = `Hi ${customerName},

Thank you for your order! 🎉

Your order #${orderId} has been successfully received.

Order Details:
- Order Number: #${orderId}
- Date: ${orderDate}
- Product: ${productName} (Qty: ${quantity})
- Subtotal / Product Price: NPR ${conversionAmountNPR.toLocaleString()}
- Service Charge: NPR ${serviceChargeNPR.toLocaleString()}
- Delivery Charge: NPR ${deliveryChargeNPR.toLocaleString()}
${customsTaxesNPR ? `- Customs & Taxes: NPR ${customsTaxesNPR.toLocaleString()}\n` : ""}${discountNPR ? `- Discount: -NPR ${discountNPR.toLocaleString()}\n` : ""}- Total Amount: NPR ${finalAmountNPR.toLocaleString()}
- Current Status: ${currentStatus}
- Payment Status: ${paymentStatus} (${paymentMethod})
- Delivery Address: ${deliveryAddress}

Track your order anytime: ${trackUrl}

We are now processing your order and will keep you updated as its status changes.

Thank you for choosing SajiloMarts.

Regards,
SajiloMarts Team`;

    const bodyContent = `
      <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #0f172a;">
        Thank you for your order! 🎉
      </h2>
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 22px; color: #334155;">
        Hi <strong>${customerName}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 14px; line-height: 22px; color: #334155;">
        Your order <strong style="color: #0f172a;">#${orderId}</strong> has been successfully received. We are now processing your order and will keep you updated as its status changes.
      </p>

      <!-- Order Details Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
        <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 13px; color: #334155;">
          <tr>
            <td style="color: #64748b; font-weight: 600;">Order Number:</td>
            <td style="text-align: right; font-weight: 800; color: #0f172a;">#${orderId}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Order Date:</td>
            <td style="text-align: right; color: #334155;">${orderDate}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Current Status:</td>
            <td style="text-align: right; font-weight: 700; color: #d97706;">${currentStatus}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Payment Status:</td>
            <td style="text-align: right; font-weight: 700; color: #0284c7;">${paymentStatus} (${paymentMethod})</td>
          </tr>
          <tr>
            <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 6px;"></td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600; vertical-align: top;">Product:</td>
            <td style="text-align: right; font-weight: 700; color: #0f172a;">
              ${productImage ? `<img src="${productImage}" alt="${productName}" width="48" height="48" style="vertical-align: middle; border-radius: 6px; object-fit: cover; margin-right: 8px; border: 1px solid #e2e8f0;" />` : ""}
              ${productName}
            </td>
          </tr>
          ${(order.brand || items[0]?.brand) ? `
          <tr>
            <td style="color: #64748b; font-weight: 600;">Brand:</td>
            <td style="text-align: right; color: #334155;">${order.brand || items[0]?.brand}</td>
          </tr>` : ""}
          ${(order.variant || order.productVariant || items[0]?.variant) ? `
          <tr>
            <td style="color: #64748b; font-weight: 600;">Variant:</td>
            <td style="text-align: right; color: #334155;">${order.variant || order.productVariant || items[0]?.variant}</td>
          </tr>` : ""}
          ${(order.color || items[0]?.color) ? `
          <tr>
            <td style="color: #64748b; font-weight: 600;">Color:</td>
            <td style="text-align: right; color: #334155;">${order.color || items[0]?.color}</td>
          </tr>` : ""}
          ${(order.size || items[0]?.size) ? `
          <tr>
            <td style="color: #64748b; font-weight: 600;">Size:</td>
            <td style="text-align: right; color: #334155;">${order.size || items[0]?.size}</td>
          </tr>` : ""}
          <tr>
            <td style="color: #64748b; font-weight: 600;">Quantity:</td>
            <td style="text-align: right; color: #334155;">${quantity}</td>
          </tr>
          ${indianPriceINR ? `
          <tr>
            <td style="color: #64748b; font-weight: 600;">Original Indian Price:</td>
            <td style="text-align: right; color: #334155;">₹${indianPriceINR.toLocaleString()} INR</td>
          </tr>` : ""}
          <tr>
            <td style="color: #64748b; font-weight: 600;">Product Price (NPR):</td>
            <td style="text-align: right; color: #334155;">NPR ${conversionAmountNPR.toLocaleString()}</td>
          </tr>
          ${serviceChargeNPR ? `
          <tr>
            <td style="color: #64748b; font-weight: 600;">Service Charge:</td>
            <td style="text-align: right; color: #334155;">NPR ${serviceChargeNPR.toLocaleString()}</td>
          </tr>` : ""}
          <tr>
            <td style="color: #64748b; font-weight: 600;">Delivery Charge:</td>
            <td style="text-align: right; color: #334155;">NPR ${deliveryChargeNPR.toLocaleString()}</td>
          </tr>
          ${customsTaxesNPR ? `
          <tr>
            <td style="color: #64748b; font-weight: 600;">Customs / Taxes:</td>
            <td style="text-align: right; color: #334155;">NPR ${customsTaxesNPR.toLocaleString()}</td>
          </tr>` : ""}
          ${discountNPR ? `
          <tr>
            <td style="color: #64748b; font-weight: 600;">Discount:</td>
            <td style="text-align: right; color: #16a34a;">-NPR ${discountNPR.toLocaleString()}</td>
          </tr>` : ""}
          <tr>
            <td colspan="2" style="border-top: 2px solid #cbd5e1; padding-top: 10px;"></td>
          </tr>
          <tr>
            <td style="font-size: 15px; font-weight: 800; color: #0f172a;">Total Amount:</td>
            <td style="text-align: right; font-size: 16px; font-weight: 900; color: #d97706;">NPR ${finalAmountNPR.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <!-- Delivery Address Info -->
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
          Delivery Destination in Nepal:
        </span>
        <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 20px;">
          <strong>${customerName}</strong><br>
          ${deliveryAddress}
        </p>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 28px 0 24px;">
        <a href="${trackUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
          View & Track Order ➔
        </a>
      </div>

      <p style="margin: 0 0 16px; font-size: 14px; line-height: 22px; color: #475569;">
        We will notify you at each milestone as your package progresses from the Indian marketplace to your doorstep in Nepal.
      </p>
      <p style="margin: 0 0 20px; font-size: 14px; line-height: 22px; color: #475569;">
        Thank you for choosing SajiloMarts.
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 18px; color: #64748b;">
        Regards,<br>
        <strong style="color: #0f172a;">SajiloMarts Team</strong>
      </p>
    `;

    const htmlContent = buildEmailLayout({
      headerTitle: `Order Confirmed #${orderId}`,
      headerSubtitle: "Order Confirmation • SajiloMarts",
      bodyContent
    });

    const mailOptions = {
      from: getEmailFrom(),
      to: cleanEmail,
      subject,
      text: textContent,
      html: htmlContent
    };

    console.log(`[Email Service] Sending ORDER_CONFIRMATION #${orderId} to ${maskEmail(cleanEmail)}...`);
    const info = await sendMailWithResilience(mailOptions);
    console.log(`[Email Service] ✓ ORDER_CONFIRMATION #${orderId} sent to ${maskEmail(cleanEmail)} (MessageId: ${info.messageId || "N/A"})`);

    // Record notification in DB for idempotency
    await EmailNotificationModel.create({
      recipient: cleanEmail,
      emailType: "ORDER_CONFIRMATION",
      orderId,
      userId: order.userId ? String(order.userId) : "",
      subject,
      messageId: info.messageId || "",
      success: true
    });

    await Promise.allSettled([
      OrderModel.updateOne({ orderId }, { $set: { confirmationEmailSent: true } }),
      IndiaOrderModel.updateOne({ orderId }, { $set: { confirmationEmailSent: true } })
    ]);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[Email Service] ✗ Order confirmation email failed for #${order?.orderId || "unknown"} to ${maskEmail(toEmail)}:`, error?.message || error);
    return { success: false, error: error?.message || "Failed to send order confirmation email" };
  }
}

/**
 * Send Order Status Update Email when admin updates order status (excluding DELIVERED)
 */
export async function sendOrderStatusEmail(toEmail, order, newStatus, oldStatus = "") {
  try {
    const cleanEmail = (toEmail || order?.email || order?.shippingAddress?.email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.endsWith(".internal")) {
      return { success: false, error: "Invalid email address" };
    }

    const orderId = String(order?.orderId || order?._id || "ORD").trim();
    const cleanNewStatus = String(newStatus || "").trim();
    const cleanOldStatus = String(oldStatus || "").trim();

    // Rule: Only send when status ACTUALLY changes
    if (cleanNewStatus.toLowerCase() === cleanOldStatus.toLowerCase()) {
      return { success: true, skipped: true, reason: "Status unchanged" };
    }

    // Rule: For DELIVERED, route to sendOrderDeliveredEmail instead
    if (cleanNewStatus.toLowerCase() === "delivered") {
      return sendOrderDeliveredEmail(cleanEmail, order);
    }

    // 1. Idempotency Check: Don't send duplicate email for this specific status
    const alreadySent = await EmailNotificationModel.findOne({
      orderId,
      emailType: "STATUS_UPDATE",
      status: cleanNewStatus.toUpperCase(),
      success: true
    }).lean();

    if (alreadySent) {
      return { success: true, skipped: true, reason: `Status update email for ${cleanNewStatus} already sent` };
    }

    const client = getTransporter();
    const customerName = (
      order.customerName ||
      order.fullName ||
      order.shippingAddress?.fullName ||
      "Valued Customer"
    ).trim();

    const frontendUrl = getFrontendUrl();
    const trackUrl = `${frontendUrl}/track-order?id=${encodeURIComponent(orderId)}`;
    const subject = `Order Update — SajiloMarts #${orderId}`;

    // Contextual description for various supported statuses
    const statusUpper = cleanNewStatus.toUpperCase();
    let statusDescription = `Your order status has been updated to: ${cleanNewStatus}.`;
    let statusBadgeColor = "#2563eb";

    if (statusUpper === "CONFIRMED" || statusUpper === "VERIFIED") {
      statusDescription = "Your order and pricing have been verified and confirmed by our sourcing team. We are preparing to purchase your items.";
      statusBadgeColor = "#0284c7";
    } else if (statusUpper === "PROCESSING") {
      statusDescription = "Our team is actively processing your order and coordinating fulfillment.";
      statusBadgeColor = "#6366f1";
    } else if (statusUpper === "PURCHASED") {
      statusDescription = "Great news! Your item has been successfully purchased from the Indian marketplace and is en route to our Indian warehouse.";
      statusBadgeColor = "#8b5cf6";
    } else if (statusUpper === "IN_TRANSIT" || statusUpper === "IN TRANSIT" || statusUpper === "SHIPPED") {
      statusDescription = "Your package is on the way! It has been dispatched and is in cross-border transit to Nepal.";
      statusBadgeColor = "#d97706";
    } else if (statusUpper === "ARRIVED_IN_NEPAL" || statusUpper === "ARRIVED IN NEPAL") {
      statusDescription = "Your package has arrived at our sorting hub in Nepal and is undergoing customs clearance and local dispatch preparation.";
      statusBadgeColor = "#0d9488";
    } else if (statusUpper === "OUT_FOR_DELIVERY" || statusUpper === "OUT FOR DELIVERY") {
      statusDescription = "Your package is out for delivery today! Our local courier partner will contact you shortly.";
      statusBadgeColor = "#059669";
    } else if (statusUpper === "CANCELLED") {
      statusDescription = "Your order has been cancelled. If you made an advance payment or have questions, our support team is ready to assist you.";
      statusBadgeColor = "#dc2626";
    }

    const textContent = `Hi ${customerName},

There is an update on your SajiloMarts order #${orderId}.

Your order status is now:

${cleanNewStatus}

${statusDescription}

Track your order anytime: ${trackUrl}

We will continue to keep you updated.

Thank you for choosing SajiloMarts.

Regards,
SajiloMarts Team`;

    const bodyContent = `
      <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 800; color: #0f172a;">
        Order Update 📦
      </h2>
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 22px; color: #334155;">
        Hi <strong>${customerName}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 14px; line-height: 22px; color: #334155;">
        There is an update on your SajiloMarts order <strong style="color: #0f172a;">#${orderId}</strong>.
      </p>

      <!-- Status Highlight Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px; margin-bottom: 24px; text-align: center;">
        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1px; display: block; margin-bottom: 8px;">
          Current Order Status:
        </span>
        <div style="display: inline-block; background-color: ${statusBadgeColor}; color: #ffffff; font-size: 16px; font-weight: 800; padding: 8px 24px; border-radius: 9999px; margin-bottom: 12px; letter-spacing: 0.5px;">
          ${cleanNewStatus}
        </div>
        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #475569; max-width: 440px; margin-left: auto; margin-right: auto;">
          ${statusDescription}
        </p>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 28px 0 24px;">
        <a href="${trackUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);">
          Track Your Order ➔
        </a>
      </div>

      <p style="margin: 0 0 16px; font-size: 14px; line-height: 22px; color: #475569;">
        We will continue to keep you updated.
      </p>
      <p style="margin: 0 0 20px; font-size: 14px; line-height: 22px; color: #475569;">
        Thank you for choosing SajiloMarts.
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 18px; color: #64748b;">
        Regards,<br>
        <strong style="color: #0f172a;">SajiloMarts Team</strong>
      </p>
    `;

    const htmlContent = buildEmailLayout({
      headerTitle: `Order Update #${orderId}`,
      headerSubtitle: "Status Notification • SajiloMarts",
      bodyContent
    });

    const mailOptions = {
      from: getEmailFrom(),
      to: cleanEmail,
      subject,
      text: textContent,
      html: htmlContent
    };

    console.log(`[Email Service] Sending STATUS_UPDATE (${cleanNewStatus}) for #${orderId} to ${maskEmail(cleanEmail)}...`);
    const info = await sendMailWithResilience(mailOptions);
    console.log(`[Email Service] ✓ STATUS_UPDATE (${cleanNewStatus}) for #${orderId} sent to ${maskEmail(cleanEmail)} (MessageId: ${info.messageId || "N/A"})`);

    // Record notification in DB for idempotency
    await EmailNotificationModel.create({
      recipient: cleanEmail,
      emailType: "STATUS_UPDATE",
      orderId,
      userId: order.userId ? String(order.userId) : "",
      status: cleanNewStatus.toUpperCase(),
      subject,
      messageId: info.messageId || "",
      success: true
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[Email Service] ✗ Status update email failed for #${order?.orderId || "unknown"} to ${maskEmail(toEmail)}:`, error?.message || error);
    return { success: false, error: error?.message || "Failed to send status update email" };
  }
}

/**
 * Send Dedicated Order Delivered Email when order status changes to DELIVERED
 */
export async function sendOrderDeliveredEmail(toEmail, order) {
  try {
    const cleanEmail = (toEmail || order?.email || order?.shippingAddress?.email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.endsWith(".internal")) {
      return { success: false, error: "Invalid email address" };
    }

    const orderId = String(order?.orderId || order?._id || "ORD").trim();

    // 1. Idempotency Check: Don't send duplicate delivered email
    if (order?.deliveredEmailSent) {
      return { success: true, skipped: true, reason: "Delivered email already sent" };
    }

    const alreadySent = await EmailNotificationModel.findOne({
      orderId,
      emailType: "DELIVERED",
      success: true
    }).lean();

    if (alreadySent) {
      await Promise.allSettled([
        OrderModel.updateOne({ orderId }, { $set: { deliveredEmailSent: true } }),
        IndiaOrderModel.updateOne({ orderId }, { $set: { deliveredEmailSent: true } })
      ]);
      return { success: true, skipped: true, reason: "Delivered email already sent" };
    }

    const client = getTransporter();
    const customerName = (
      order.customerName ||
      order.fullName ||
      order.shippingAddress?.fullName ||
      "Valued Customer"
    ).trim();

    const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];
    const productName = (order.productName || items[0]?.name || "Sourced Indian Product").trim();
    const quantity = order.quantity || (items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)) || 1;
    const finalAmountNPR = order.finalAmountNPR || order.totalAmount || order.total || 0;

    const deliveryDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const frontendUrl = getFrontendUrl();
    const supportUrl = `${frontendUrl}/support`;
    const accountUrl = `${frontendUrl}/account`;
    const subject = `Your Order Has Been Delivered — SajiloMarts #${orderId} 🎉`;

    const textContent = `Hi ${customerName},

Your SajiloMarts order #${orderId} has been successfully delivered. 🎉

Order Summary:
- Order Number: #${orderId}
- Product: ${productName} (Qty: ${quantity})
- Total: NPR ${finalAmountNPR.toLocaleString()}
- Delivery Date: ${deliveryDate}

Thank you for trusting SajiloMarts to bring your products from India to Nepal.

We truly appreciate your order and support.

If you have any issue with your order, please contact our support team at: ${supportUrl}

Regards,
SajiloMarts Team`;

    const bodyContent = `
      <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #047857;">
        Your Order Has Been Delivered 🎉
      </h2>
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 22px; color: #334155;">
        Hi <strong>${customerName}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 14px; line-height: 22px; color: #334155;">
        Your SajiloMarts order <strong style="color: #0f172a;">#${orderId}</strong> has been successfully delivered.
      </p>

      <!-- Delivered Appreciation Card -->
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 10px; font-size: 14px; line-height: 22px; color: #065f46; font-weight: 700;">
          Thank you for trusting SajiloMarts to bring your products from India to Nepal!
        </p>
        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #047857;">
          We truly appreciate your order and support. We hope you love your new purchase.
        </p>
      </div>

      <!-- Order Summary Box -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 13px; color: #334155;">
          <tr>
            <td style="color: #64748b; font-weight: 600;">Order Number:</td>
            <td style="text-align: right; font-weight: 800; color: #0f172a;">#${orderId}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Product:</td>
            <td style="text-align: right; font-weight: 700; color: #0f172a;">${productName} (Qty: ${quantity})</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Delivered On:</td>
            <td style="text-align: right; color: #334155;">${deliveryDate}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-weight: 600;">Total Landed Price:</td>
            <td style="text-align: right; font-weight: 800; color: #047857;">NPR ${finalAmountNPR.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <!-- Buttons -->
      <div style="text-align: center; margin: 28px 0 24px;">
        <a href="${supportUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 12px 26px; border-radius: 10px; margin-right: 8px;">
          Contact Support Team
        </a>
        <a href="${accountUrl}" style="display: inline-block; background-color: #f1f5f9; color: #1e293b; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 26px; border-radius: 10px; border: 1px solid #cbd5e1;">
          My Account
        </a>
      </div>

      <p style="margin: 0 0 16px; font-size: 13px; line-height: 22px; color: #475569;">
        If you have any issue with your order, please do not hesitate to contact our customer care team.
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 18px; color: #64748b;">
        Warm regards,<br>
        <strong style="color: #0f172a;">SajiloMarts Team</strong>
      </p>
    `;

    const htmlContent = buildEmailLayout({
      headerTitle: `Delivered #${orderId}`,
      headerSubtitle: "Package Delivered • SajiloMarts",
      bodyContent,
      badgeColor: "#10b981",
      badgeTextColor: "#ffffff"
    });

    const mailOptions = {
      from: getEmailFrom(),
      to: cleanEmail,
      subject,
      text: textContent,
      html: htmlContent
    };

    console.log(`[Email Service] Sending DELIVERED email for #${orderId} to ${maskEmail(cleanEmail)}...`);
    const info = await sendMailWithResilience(mailOptions);
    console.log(`[Email Service] ✓ DELIVERED email for #${orderId} sent to ${maskEmail(cleanEmail)} (MessageId: ${info.messageId || "N/A"})`);

    // Record notification in DB for idempotency
    await EmailNotificationModel.create({
      recipient: cleanEmail,
      emailType: "DELIVERED",
      orderId,
      userId: order.userId ? String(order.userId) : "",
      status: "DELIVERED",
      subject,
      messageId: info.messageId || "",
      success: true
    });

    await Promise.allSettled([
      OrderModel.updateOne({ orderId }, { $set: { deliveredEmailSent: true } }),
      IndiaOrderModel.updateOne({ orderId }, { $set: { deliveredEmailSent: true } })
    ]);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[Email Service] ✗ Delivered email failed for #${order?.orderId || "unknown"} to ${maskEmail(toEmail)}:`, error?.message || error);
    return { success: false, error: error?.message || "Failed to send delivered email" };
  }
}

/**
 * Send Password Reset OTP verification code email
 */
export async function sendPasswordResetOtpEmail(toEmail, otpCode, recipientName) {
  try {
    const cleanEmail = (toEmail || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }

    const client = getTransporter();
    const name = recipientName || "Valued Customer";

    const mailOptions = {
      from: getEmailFrom(),
      to: cleanEmail,
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
</html>`
    };

    console.log(`[Email Service] Sending OTP email to ${maskEmail(cleanEmail)}...`);
    const info = await sendMailWithResilience(mailOptions);
    console.log(`[Email Service] ✓ OTP email sent to ${maskEmail(cleanEmail)} (MessageId: ${info.messageId || "N/A"})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[Email Service] ✗ OTP email failed for ${maskEmail(toEmail)}:`, error?.message || error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}

export default {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendOrderDeliveredEmail,
  sendPasswordResetOtpEmail,
  verifySmtpConnection,
  maskEmail
};
