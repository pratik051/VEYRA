import { PaymentInitiationInput, PaymentInitiationResult } from "@/lib/payments/types";

const KHALTI_PUBLIC_KEY = process.env.NEXT_PUBLIC_KHALTI_PUBLIC_KEY || "";

export function initiateKhaltiPayment(input: PaymentInitiationInput): PaymentInitiationResult {
  return {
    provider: "Khalti",
    status: "PENDING_REDIRECT",
    redirectUrl: `${process.env.KHALTI_CHECKOUT_URL || "https://pay.khalti.com"}/`,
    payload: {
      publicKey: KHALTI_PUBLIC_KEY,
      purchase_order_id: input.orderId,
      purchase_order_name: input.productName,
      amount_paisa: String(Math.round(input.amount * 100)),
      customer_name: input.customerName,
      customer_phone: input.customerPhone
    }
  };
}
