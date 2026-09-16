export function calculateOrderPrice(indianPriceINR) {
  if (typeof indianPriceINR !== "number" || isNaN(indianPriceINR) || indianPriceINR <= 0) {
    throw new Error("Please enter a valid positive INR product amount.");
  }

  const exchangeRate = Number(process.env.INDIA_NPR_CONVERSION_RATE) || 1.65;
  const servicePercent = (Number(process.env.SERVICE_CHARGE_PERCENT) || 20) / 100;
  const deliveryFee = Number(process.env.DELIVERY_CHARGE_NPR) || 200;

  const conversionAmount = Math.round(indianPriceINR * exchangeRate * 100) / 100;
  const serviceCharge = Math.round(conversionAmount * servicePercent * 100) / 100;
  const deliveryCharge = deliveryFee;
  const finalAmount = Math.round(conversionAmount + serviceCharge + deliveryCharge);

  return {
    indianPriceINR,
    conversionAmount,
    serviceCharge,
    deliveryCharge,
    finalAmount
  };
}

export function getCustomerFacingPrice(indianPriceINR) {
  const result = calculateOrderPrice(indianPriceINR);
  return {
    success: true,
    indianPriceINR: result.indianPriceINR,
    finalAmountNPR: result.finalAmount
  };
}
