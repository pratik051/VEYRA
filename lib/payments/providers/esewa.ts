import { createHmac } from "node:crypto";
import { PaymentInitiationInput, PaymentInitiationResult } from "@/lib/payments/types";

const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "";
const ESEWA_BASE_URL = process.env.ESEWA_BASE_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

function signEsewa(payload: string) {
  if (!ESEWA_SECRET_KEY) return "";
  return createHmac("sha256", ESEWA_SECRET_KEY).update(payload).digest("base64");
}

export function initiateEsewaPayment(input: PaymentInitiationInput): PaymentInitiationResult {
  const transactionUuid = `${input.orderId}-${Date.now()}`;
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const signaturePayload = `${input.amount},${transactionUuid},${ESEWA_MERCHANT_CODE}`;
  const signature = signEsewa(signaturePayload);

  return {
    provider: "eSewa",
    status: "PENDING_REDIRECT",
    redirectUrl: ESEWA_BASE_URL,
    payload: {
      amount: String(input.amount),
      tax_amount: "0",
      total_amount: String(input.amount),
      transaction_uuid: transactionUuid,
      product_code: ESEWA_MERCHANT_CODE,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout?payment=success`,
      failure_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout?payment=failed`,
      signed_field_names: signedFieldNames,
      signature
    }
  };
}
