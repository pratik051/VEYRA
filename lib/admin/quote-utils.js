/**
 * Minimal helpers for building/validating quote objects used by admin UI and API.
 * Kept intentionally small and dependency-free so tests can run without extra tooling.
 */

function numeric(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Validate quote fields provided by admin UI. Returns { valid, errors, quote }
 */
export function validateAndBuildQuote(fields) {
  const errors = [];
  const quote = {};

  if (fields.finalEstimatedPrice !== undefined && fields.finalEstimatedPrice !== "") {
    const n = numeric(fields.finalEstimatedPrice);
    if (n === undefined) errors.push("finalEstimatedPrice must be a number");
    else quote.finalEstimatedPrice = n;
  }

  if (fields.serviceFee !== undefined && fields.serviceFee !== "") {
    const n = numeric(fields.serviceFee);
    if (n === undefined) errors.push("serviceFee must be a number");
    else quote.serviceFee = n;
  }

  if (fields.shippingIndiaToNepal !== undefined && fields.shippingIndiaToNepal !== "") {
    const n = numeric(fields.shippingIndiaToNepal);
    if (n === undefined) errors.push("shippingIndiaToNepal must be a number");
    else quote.shippingIndiaToNepal = n;
  }

  if (fields.customsTaxes !== undefined && fields.customsTaxes !== "") {
    const n = numeric(fields.customsTaxes);
    if (n === undefined) errors.push("customsTaxes must be a number");
    else quote.customsTaxes = n;
  }

  if (fields.exchangeRate !== undefined && fields.exchangeRate !== "") {
    const n = numeric(fields.exchangeRate);
    if (n === undefined) errors.push("exchangeRate must be a number");
    else quote.exchangeRate = n;
  }

  if (fields.expectedDeliveryTime !== undefined) quote.expectedDeliveryTime = String(fields.expectedDeliveryTime);
  if (fields.quoteExpiry !== undefined) quote.quoteExpiry = String(fields.quoteExpiry);

  // Example business rule: if finalEstimatedPrice present, it must be >= 0
  if (quote.finalEstimatedPrice !== undefined && quote.finalEstimatedPrice < 0) {
    errors.push("finalEstimatedPrice must be >= 0");
  }

  return { valid: errors.length === 0, errors, quote };
}

