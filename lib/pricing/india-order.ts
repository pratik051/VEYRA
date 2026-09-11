/**
 * Nepal -> India Order System Pricing Engine
 * Internal Server-Side Calculation Logic:
 *   Base Conversion = indianPriceINR * (process.env.INDIA_NPR_CONVERSION_RATE || 1.65)
 *   Service/Conversion Charge = Base Conversion * ((process.env.SERVICE_CHARGE_PERCENT || 20) / 100)
 *   Delivery Charge = process.env.DELIVERY_CHARGE_NPR || 200
 *   Final Customer Amount = Base Conversion + Service Charge + Delivery Charge
 *
 * NOTE: Individual formula components (1.65, 20%, 200) must NEVER be exposed
 * to customer-facing client UIs.
 */

export interface PriceCalculationResult {
  indianPriceINR: number;
  conversionAmount: number;
  serviceCharge: number;
  deliveryCharge: number;
  finalAmount: number;
}

export function calculateOrderPrice(indianPriceINR: number): PriceCalculationResult {
  if (typeof indianPriceINR !== "number" || isNaN(indianPriceINR) || indianPriceINR <= 0) {
    throw new Error("Please enter a valid positive INR product amount.");
  }

  const exchangeRate = Number(process.env.INDIA_NPR_CONVERSION_RATE) || 1.65;
  const servicePercent = (Number(process.env.SERVICE_CHARGE_PERCENT) || 20) / 100;
  const deliveryFee = Number(process.env.DELIVERY_CHARGE_NPR) || 200;

  // Base conversion at exchange rate
  const conversionAmount = Math.round(indianPriceINR * exchangeRate * 100) / 100;

  // Service/Conversion Charge
  const serviceCharge = Math.round(conversionAmount * servicePercent * 100) / 100;

  // Fixed Delivery Charge
  const deliveryCharge = deliveryFee;

  // Total Final Landed Customer Price in NPR
  const finalAmount = Math.round(conversionAmount + serviceCharge + deliveryCharge);

  return {
    indianPriceINR,
    conversionAmount,
    serviceCharge,
    deliveryCharge,
    finalAmount
  };
}

/**
 * Returns customer-facing payload containing only the final payable amount.
 */
export function getCustomerFacingPrice(indianPriceINR: number): {
  success: boolean;
  indianPriceINR: number;
  finalAmountNPR: number;
} {
  const result = calculateOrderPrice(indianPriceINR);
  return {
    success: true,
    indianPriceINR: result.indianPriceINR,
    finalAmountNPR: result.finalAmount
  };
}

