import QRCode from "qrcode";
import PaymentModel from "../models/payment-model.js";
import IndiaOrderModel from "../models/india-order-model.js";
import OrderModel from "../models/order-model.js";

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
    const body = req.body || {};
    const orderId = String(body.orderId || "").trim();
    const transactionCode = String(body.transactionCode || body.transactionId || "").trim();
    const provider = String(body.provider || body.paymentMethod || "eSewa").trim();
    const amount = Number(body.amount) || 0;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required to submit payment proof." });
    }
    if (!transactionCode) {
      return res.status(400).json({ error: "Transaction / Reference Code is required." });
    }

    // Resolve screenshot URL: from uploaded file or base64 data URI in body
    let screenshot = "";
    if (req.file) {
      screenshot = `/uploads/payments/${req.file.filename}`;
    } else if (body.screenshot) {
      screenshot = String(body.screenshot);
    }

    // Find the target order in either OrderModel or IndiaOrderModel
    const orderQuery = {
      $or: [
        { orderId },
        ...(orderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: orderId }] : [])
      ]
    };

    let targetOrder = await OrderModel.findOne(orderQuery);
    let orderType = "standard";

    if (!targetOrder) {
      targetOrder = await IndiaOrderModel.findOne(orderQuery);
      orderType = "india_sourcing";
    }

    if (!targetOrder) {
      return res.status(404).json({ error: `Order ${orderId} could not be found.` });
    }

    // Security check: verify order belongs to the user if user is authenticated (unless admin)
    if (req.user && req.user.role !== "admin") {
      const authUserId = String(req.user._id);
      const authEmail = req.user.email ? req.user.email.toLowerCase() : "";
      const authPhone = req.user.phone ? req.user.phone.trim() : "";

      const orderUserId = String(targetOrder.userId || targetOrder.customerId || "");
      const orderEmail = targetOrder.email ? targetOrder.email.toLowerCase() : "";
      const orderPhone = targetOrder.phone ? targetOrder.phone.trim() : "";

      const matches =
        (orderUserId && orderUserId === authUserId) ||
        (authEmail && orderEmail === authEmail) ||
        (authPhone && orderPhone === authPhone);

      if (!matches && orderUserId) {
        return res.status(403).json({ error: "You are not authorized to upload proof for this order." });
      }
    }

    // Create or update payment record
    const payment = await PaymentModel.findOneAndUpdate(
      { orderId },
      {
        $set: {
          userId: req.user ? req.user._id : targetOrder.userId,
          orderId,
          provider,
          paymentMethod: provider,
          amount: amount || targetOrder.totalAmount || targetOrder.finalAmountNPR || targetOrder.total || 0,
          transactionCode,
          screenshot: screenshot || targetOrder.paymentScreenshot,
          status: "submitted",
          submittedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Update the order's payment status to Pending Verification (NOT automatically verified!)
    const updateFields = {
      paymentStatus: "Pending Verification",
      paymentScreenshot: screenshot || targetOrder.paymentScreenshot,
      paymentReference: transactionCode,
      paymentTransactionId: transactionCode,
      "payment.status": "Pending Verification",
      "payment.transactionId": transactionCode,
      "payment.screenshot": screenshot || targetOrder.paymentScreenshot
    };

    if (orderType === "standard") {
      await OrderModel.updateOne(orderQuery, { $set: updateFields });
    } else {
      await IndiaOrderModel.updateOne(orderQuery, { $set: updateFields });
    }

    return res.json({
      success: true,
      message: "Payment screenshot submitted successfully! Our staff will verify your transaction shortly.",
      payment: {
        _id: payment._id,
        orderId,
        transactionId: transactionCode,
        status: "submitted",
        screenshot: payment.screenshot
      }
    });
  } catch (error) {
    console.error("[Submit Payment Proof Error]:", error);
    return res.status(400).json({ error: error.message || "Failed to submit payment proof." });
  }
}
