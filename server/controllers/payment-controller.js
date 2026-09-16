import QRCode from "qrcode";
import PaymentModel from "../models/payment-model.js";
import IndiaOrderModel from "../models/india-order-model.js";

const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
const KHALTI_PUBLIC_KEY = process.env.NEXT_PUBLIC_KHALTI_PUBLIC_KEY || "live_public_key_sajilomarts_12345";
const MYPAY_MERCHANT_ID = process.env.MYPAY_MERCHANT_ID || "MYPAY_SAJILOMARTS_NP";

export async function createPaymentQR(req, res) {
  try {
    const body = req.body || {};
    const provider = body.provider || "eSewa";
    const paymentMode = body.paymentMode === "FULL_PAYMENT" ? "FULL_PAYMENT" : "COD";
    const amountToPay = Number(body.amount || body.subtotal) || 0;
    const orderId = String(body.orderId || `TEMP-${Date.now()}`).trim();

    if (amountToPay <= 0) {
      return res.status(400).json({
        success: false,
        code: "INVALID_AMOUNT",
        message: "Payment amount must be greater than zero."
      });
    }

    let qrPayloadText = "";
    let providerReference = "";

    if (provider === "eSewa") {
      providerReference = `ESEWA-${orderId}`;
      qrPayloadText = `esewa://pay?merchant=${ESEWA_MERCHANT_CODE}&amount=${amountToPay}&refId=${orderId}&desc=SAJILOMARTS_Order`;
    } else if (provider === "Khalti") {
      providerReference = `KHALTI-${orderId}`;
      const amountPaisa = amountToPay * 100;
      qrPayloadText = `khalti://pay?public_key=${KHALTI_PUBLIC_KEY}&amount=${amountPaisa}&purchase_order_id=${orderId}&purchase_order_name=SAJILOMARTS_Order`;
    } else if (provider === "MyPay") {
      providerReference = `MYPAY-${orderId}`;
      qrPayloadText = `mypay://pay?merchant_id=${MYPAY_MERCHANT_ID}&amount=${amountToPay}&order_id=${orderId}`;
    } else {
      providerReference = `GENERIC-${orderId}`;
      qrPayloadText = `sajilomarts://pay?provider=${provider}&amount=${amountToPay}&order_id=${orderId}`;
    }

    const qrCodeBase64 = await QRCode.toDataURL(qrPayloadText, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
      color: { dark: "#09090b", light: "#ffffff" }
    });

    return res.json({
      success: true,
      paymentId: providerReference,
      amount: amountToPay,
      paymentMode,
      provider,
      qrCode: qrCodeBase64,
      qrPayloadText,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error("[Payment QR Error]:", error);
    return res.status(500).json({
      success: false,
      code: "PAYMENT_QR_UNAVAILABLE",
      message: "Payment QR is temporarily unavailable."
    });
  }
}

export async function submitPaymentProof(req, res) {
  try {
    const { orderId, transactionCode, screenshot, provider, amount } = req.body || {};
    if (!orderId || !transactionCode) {
      return res.status(400).json({ error: "Order ID and Transaction Code are required." });
    }

    const payment = await PaymentModel.create({
      userId: req.user ? req.user._id : null,
      orderId,
      provider: provider || "eSewa",
      paymentMethod: provider || "eSewa",
      amount: Number(amount) || 0,
      transactionCode: String(transactionCode).trim(),
      screenshot: screenshot || "",
      status: "submitted",
      submittedAt: new Date()
    });

    await IndiaOrderModel.updateOne(
      { orderId },
      { $set: { paymentStatus: "PAID", paymentTransactionId: transactionCode, paymentScreenshot: screenshot } }
    );

    return res.json({ success: true, message: "Payment proof submitted successfully.", payment });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to submit payment proof." });
  }
}
