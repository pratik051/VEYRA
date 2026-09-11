import { initiateEsewaPayment } from "@/lib/payments/providers/esewa";
import { initiateKhaltiPayment } from "@/lib/payments/providers/khalti";
import { PaymentInitiationInput, PaymentInitiationResult, PaymentProvider } from "@/lib/payments/types";

export function initiatePayment(provider: PaymentProvider, input: PaymentInitiationInput): PaymentInitiationResult {
  if (provider === "eSewa") return initiateEsewaPayment(input);
  if (provider === "Khalti") return initiateKhaltiPayment(input);
  if (provider === "MyPay") return { provider, status: "MANUAL_REVIEW" };
  if (provider === "Bank Transfer") {
    return { provider, status: "MANUAL_REVIEW" };
  }
  return { provider: "Cash on Delivery", status: "COD_PENDING" };
}
