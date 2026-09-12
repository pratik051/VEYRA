export interface CalculationInput {
  subtotal: number;
  deliveryFee: number;
  referralCode?: string;
  paymentMethod: "COD" | "FULL_PAYMENT" | "Khalti" | "eSewa" | "MyPay" | "Bank Transfer" | "Cash on Delivery";
}

export interface CalculationResult {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  finalAmount: number;
  onlineAmount: number;
  codAmount: number;
  referralApplied: boolean;
  referralMessage: string;
}

// Built-in referral & promo codes
const ACTIVE_REFERRALS: Record<string, { discountPercent?: number; discountFixed?: number; minSubtotal?: number }> = {
  REF10: { discountPercent: 10, minSubtotal: 500 },
  LINKOVA500: { discountFixed: 500, minSubtotal: 2500 },
  WELCOME10: { discountPercent: 10, minSubtotal: 1000 },
  VEYRA500: { discountFixed: 500, minSubtotal: 2500 }
};

export function calculateOrderBreakdown(input: CalculationInput): CalculationResult {
  const subtotal = Math.max(0, Math.round(Number(input.subtotal) || 0));
  const deliveryFee = Math.max(0, Math.round(Number(input.deliveryFee) || 0));

  let discount = 0;
  let referralApplied = false;
  let referralMessage = "";

  if (input.referralCode) {
    const cleanCode = input.referralCode.trim().toUpperCase();
    const rule = ACTIVE_REFERRALS[cleanCode];

    if (rule) {
      const minRequired = rule.minSubtotal || 0;
      if (subtotal >= minRequired) {
        if (rule.discountPercent) {
          discount = Math.round((subtotal * rule.discountPercent) / 100);
        } else if (rule.discountFixed) {
          discount = rule.discountFixed;
        }
        discount = Math.min(discount, subtotal); // Cannot exceed subtotal
        referralApplied = true;
        referralMessage = `✓ Referral code ${cleanCode} applied! Saved NPR ${discount.toLocaleString()}`;
      } else {
        referralMessage = `✕ Minimum subtotal of NPR ${minRequired.toLocaleString()} required for ${cleanCode}`;
      }
    } else {
      referralMessage = "✕ Invalid or expired referral code";
    }
  }

  const finalAmount = Math.max(0, subtotal - discount + deliveryFee);

  // 50% COD Advance vs 100% Full Payment Rule
  const isCod = input.paymentMethod === "COD" || input.paymentMethod === "Cash on Delivery";
  let onlineAmount = 0;
  let codAmount = 0;

  if (isCod) {
    onlineAmount = Math.round(finalAmount * 0.5);
    codAmount = finalAmount - onlineAmount; // Guarantees exact integer sum equality
  } else {
    onlineAmount = finalAmount;
    codAmount = 0;
  }

  return {
    subtotal,
    deliveryFee,
    discount,
    finalAmount,
    onlineAmount,
    codAmount,
    referralApplied,
    referralMessage
  };
}
