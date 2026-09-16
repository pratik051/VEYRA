import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { calculateOrderBreakdown } from "@/lib/utils/order-calculator";

export const dynamic = "force-dynamic";

export interface CreatePaymentQRRequest {
  provider: "eSewa" | "Khalti" | "MyPay" | "Bank Transfer" | "Cash on Delivery" | "COD";
  paymentMode: "COD" | "FULL_PAYMENT";
  subtotal: number;
  deliveryFee?: number;
  referralCode?: string;
  orderId?: string;
}

// Configured payment credentials from env
const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBmpyzU26pAyD9h";
const KHALTI_PUBLIC_KEY = process.env.NEXT_PUBLIC_KHALTI_PUBLIC_KEY || "live_public_key_sajilomarts_12345";
const MYPAY_MERCHANT_ID = process.env.MYPAY_MERCHANT_ID || "MYPAY_SAJILOMARTS_NP";

export async function POST(req: Request) {
  try {
    const body: CreatePaymentQRRequest = await req.json().catch(() => ({}));

    const provider = body.provider || "eSewa";
    const paymentMode = body.paymentMode === "FULL_PAYMENT" ? "FULL_PAYMENT" : "COD";
    const subtotal = Number(body.subtotal) || 0;
    const deliveryFee = Number(body.deliveryFee) || 0;
    const referralCode = String(body.referralCode || "").trim();
    const orderId = String(body.orderId || `TEMP-${Date.now()}`).trim();

    // 1. Safe server-side diagnostic logging (no sensitive secrets logged)
    console.log("[Payment QR] Session Creation Started", {
      orderId,
      provider,
      paymentMode,
      subtotal,
      referralCode: referralCode || "None"
    });

    // 2. Authoritative backend price breakdown calculation
    const calc = calculateOrderBreakdown({
      subtotal,
      deliveryFee,
      referralCode,
      paymentMethod: paymentMode
    });

    // Determine exact amount to request via QR (50% online advance for COD, 100% for Full Online)
    const amountToPay = calc.onlineAmount;

    if (amountToPay <= 0) {
      console.error("[Payment QR] Creation failed: invalid amountToPay <= 0");
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_AMOUNT",
          message: "Payment amount must be greater than zero."
        },
        { status: 400 }
      );
    }

    // 3. Construct provider-specific dynamic QR string / payload URL
    let qrPayloadText = "";
    let providerReference = "";

    if (provider === "eSewa") {
      providerReference = `ESEWA-${orderId}`;
      // Format eSewa payment string
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

    // 4. Generate Base64 Data URL for the QR code
    let qrCodeBase64 = "";
    try {
      qrCodeBase64 = await QRCode.toDataURL(qrPayloadText, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 320,
        color: {
          dark: "#09090b",
          light: "#ffffff"
        }
      });
    } catch (qrGenErr) {
      console.error("[Payment QR] Base64 generation error:", qrGenErr);
      return NextResponse.json(
        {
          success: false,
          code: "PAYMENT_QR_UNAVAILABLE",
          message: "Payment QR could not be generated."
        },
        { status: 500 }
      );
    }

    console.log("[Payment QR] Session Created Successfully", {
      orderId,
      provider,
      amountToPay,
      providerReference
    });

    return NextResponse.json({
      success: true,
      paymentId: providerReference,
      amount: amountToPay,
      paymentMode,
      provider,
      qrCode: qrCodeBase64,
      qrPayloadText,
      breakdown: {
        totalAmount: calc.finalAmount,
        onlineAdvanceAmount: calc.onlineAmount,
        codRemainingAmount: calc.codAmount
      },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    });
  } catch (error: unknown) {
    console.error("[Payment QR] Unexpected Server Error:", error);
    return NextResponse.json(
      {
        success: false,
        code: "PAYMENT_QR_UNAVAILABLE",
        message: "Payment QR is temporarily unavailable."
      },
      { status: 500 }
    );
  }
}
