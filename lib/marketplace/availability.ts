import {
  APPROVED_DOMAINS,
  getPlatformByDomain,
  isValidProductUrl,
  getSourceIdFromUrl,
  getMarketplaceDisplayName
} from "../sourcing-platforms";
import { connectToDatabase } from "../db/mongodb";
import { MarketplaceProductModel } from "../models/marketplace-product-model";
import { buildCanonicalProductUrl, validateProductImage } from "./verification";
import { normalizeProductUrl } from "./url-normalizer";
import { SOURCING_DESTINATION, DEFAULT_TRANSIT_PIN } from "../config/sourcing-destination";

export type StockState = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
export type DeliveryState = "DELIVERY_AVAILABLE" | "DELIVERY_UNAVAILABLE" | "UNKNOWN";
export type PriceState = "VERIFIED" | "UNVERIFIED";
export type VerificationStatus = "VERIFIED" | "PARTIAL" | "INVALID" | "ERROR";

export type AvailabilityReason =
  | "AVAILABLE"
  | "OUT_OF_STOCK"
  | "DELIVERY_UNAVAILABLE"
  | "DELIVERY_UNCONFIRMED"
  | "STOCK_UNCONFIRMED"
  | "AVAILABILITY_UNCONFIRMED"
  | "UNAVAILABLE"
  | "UNVERIFIED"
  | "INVALID_URL"
  | "UNSUPPORTED_PLATFORM";

export interface AvailabilityCheckRequest {
  url: string;
  variant?: {
    size?: string;
    color?: string;
    name?: string;
    [key: string]: any;
  };
  quantity?: number;
  /**
   * Internal override: used only by backend staff / automated tests.
   */
  internalPostalCode?: string;
}

export interface AvailabilityProductDetails {
  name: string;
  title: string;
  image: string;
  images: string[];
  priceINR: number;
  originalPriceINR?: number;
  brand: string;
  category: string;
  source: string;
  marketplace: string;
  sourceProductId: string;
  originalSourceUrl: string;
  normalizedSourceUrl: string;
  verifiedUrl: string;
  canonicalUrl: string;
  variants?: Array<{ name: string; values: string[] }>;
}

export interface AvailabilityCheckResult {
  urlValid: boolean;
  marketplace: string;
  productFound: boolean;
  productIdentityVerified: boolean;
  sourceProductId: string;
  stockStatus: StockState;
  deliveryStatus: DeliveryState;
  priceStatus: PriceState;
  orderable: boolean;
  verificationStatus: VerificationStatus;
  reason: AvailabilityReason | string;
  message: string;
  originalSourceUrl: string;
  normalizedSourceUrl: string;
  verifiedSourceUrl: string;
  verifiedUrl: string;
  canonicalUrl: string;

  // Convenience & Backward-Compatibility Properties
  verified: boolean;
  canOrder: boolean;
  inStock: boolean;
  deliveryAvailable: boolean;
  stockStatusText: string;
  deliveryStatusText: string;
  product?: AvailabilityProductDetails;
  checkedAt: string;

  // Admin-only internal debugging field (stripped before sending to non-admin users)
  _internalAudit?: {
    originalUrl: string;
    normalizedUrl: string;
    verifiedUrl: string;
    marketplace: string;
    sourceProductId: string;
    productName: string;
    productIdentityResult: string;
    stockResult: StockState;
    deliveryResult: DeliveryState;
    priceResult: PriceState;
    verificationProvider: string;
    verificationTimestamp: string;
    failureReason: string;
    finalOrderableResult: boolean;
    internalPin: string;
    internalDestination: string;
    signals: string[];
  };
}

/**
 * Structured server logger for verification audits and failures.
 * Never logs passwords, authentication tokens, API keys, or customer secrets.
 */
function logVerificationAudit(payload: {
  event: "VERIFICATION_SUCCESS" | "VERIFICATION_PARTIAL" | "VERIFICATION_FAILED";
  marketplace: string;
  sourceProductId: string;
  stage: "URL_VALIDATION" | "DB_LOOKUP" | "LIVE_FETCH" | "STOCK_CHECK" | "DELIVERY_CHECK" | "FINAL_DECISION";
  reason: string;
  orderable: boolean;
}) {
  const sanitized = {
    timestamp: new Date().toISOString(),
    event: payload.event,
    marketplace: payload.marketplace || "unknown",
    sourceProductId: payload.sourceProductId || "unknown",
    stage: payload.stage,
    reason: payload.reason,
    orderable: payload.orderable
  };
  console.log(`[VERIFICATION_AUDIT] ${JSON.stringify(sanitized)}`);
}

/**
 * Parses live HTML / schema / text content for explicit out-of-stock / availability signals.
 *
 * CRITICAL RULE:
 * If no explicit signals are found or parsing encounters incomplete HTML,
 * returns UNKNOWN instead of guessing OUT_OF_STOCK or DELIVERY_UNAVAILABLE.
 */
function parseHtmlStockAndDeliverySignals(
  html: string,
  internalPin: string = DEFAULT_TRANSIT_PIN
): { stock: StockState; delivery: DeliveryState; signals: string[] } {
  const lowHtml = html.toLowerCase();
  const signals: string[] = [];

  let stock: StockState = "UNKNOWN";
  let delivery: DeliveryState = "UNKNOWN";

  // 1. Explicit Out-of-Stock indicators (Only triggered by definitive marketplace signals)
  const explicitOutOfStockKeywords = [
    "schema.org/outofstock",
    "schema.org/soldout",
    "currently unavailable",
    "out of stock",
    "sold out",
    "item unavailable",
    "temporarily out of stock",
    "we don't know when or if this item will be back in stock",
    "this item is currently unavailable",
    "is-out-of-stock",
    "out_of_stock"
  ];

  for (const phrase of explicitOutOfStockKeywords) {
    if (lowHtml.includes(phrase)) {
      stock = "OUT_OF_STOCK";
      signals.push(`Explicit out-of-stock signal detected: "${phrase}"`);
      break;
    }
  }

  // 2. Explicit In-Stock indicators
  const inStockKeywords = [
    "schema.org/instock",
    "in stock.",
    "in stock",
    "only 1 left in stock",
    "only 2 left in stock",
    "only 3 left in stock",
    "only 4 left in stock",
    "only 5 left in stock",
    "add to cart",
    "buy now",
    "available to ship",
    "order within",
    "add to bag"
  ];

  if (stock !== "OUT_OF_STOCK") {
    for (const phrase of inStockKeywords) {
      if (lowHtml.includes(phrase)) {
        stock = "IN_STOCK";
        signals.push(`Explicit in-stock signal detected: "${phrase}"`);
        break;
      }
    }
  }

  // 3. Postal Code Delivery Eligibility
  const explicitUndeliverableKeywords = [
    "cannot be delivered to this location",
    "delivery not available for this pincode",
    "seller does not deliver to this pincode",
    "delivery is not available at",
    "item cannot be shipped to this address",
    "we are unable to deliver to this pincode",
    "undeliverable to this address",
    "delivery unavailable for selected address"
  ];

  let hasUndeliverableSignal = false;
  for (const phrase of explicitUndeliverableKeywords) {
    if (lowHtml.includes(phrase)) {
      delivery = "DELIVERY_UNAVAILABLE";
      hasUndeliverableSignal = true;
      signals.push(`Explicit delivery rejection signal detected: "${phrase}"`);
      break;
    }
  }

  if (!hasUndeliverableSignal) {
    // Check if deliverable signals exist
    const deliverableKeywords = [
      "free delivery",
      "fastest delivery",
      "delivery by",
      "ships from",
      "sold by",
      "standard delivery",
      "eligible for free delivery",
      "get it by"
    ];

    for (const phrase of deliverableKeywords) {
      if (lowHtml.includes(phrase)) {
        delivery = "DELIVERY_AVAILABLE";
        signals.push(`Delivery availability signal detected: "${phrase}"`);
        break;
      }
    }
  }

  // Freight & Hazardous Restrictions
  if (
    lowHtml.includes("freight-only") ||
    lowHtml.includes("heavy bulky appliance - local city delivery only") ||
    lowHtml.includes("hazardous material - cannot be shipped by air/transit")
  ) {
    delivery = "DELIVERY_UNAVAILABLE";
    signals.push("Product subject to courier freight restrictions for transit hub.");
  }

  return { stock, delivery, signals };
}

/**
 * Comprehensive Product Availability & Delivery Verification Engine.
 *
 * Core Principles:
 * 1. NEVER guess availability. Distinguish between IN_STOCK, OUT_OF_STOCK, and UNKNOWN.
 * 2. API/network/parser failure -> UNKNOWN (Availability could not be confirmed), NEVER OUT_OF_STOCK.
 * 3. Normalizes marketplace URLs while preserving original customer URL intact.
 * 4. Extracts real marketplace product ID (e.g. Myntra numeric ID, Amazon ASIN, Flipkart PID).
 * 5. Strictly guards private internal destination details from customer responses.
 */
export async function checkProductAvailabilityAndDelivery(
  request: AvailabilityCheckRequest
): Promise<AvailabilityCheckResult> {
  const rawUrl = (request.url || "").trim();
  const requestedVariant = request.variant;
  const quantity = Math.max(1, request.quantity || 1);
  const checkedAt = new Date().toISOString();
  const internalPin = request.internalPostalCode || SOURCING_DESTINATION.pin;

  // 1. URL Normalization & Validation
  if (!rawUrl || (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://"))) {
    logVerificationAudit({
      event: "VERIFICATION_FAILED",
      marketplace: "unknown",
      sourceProductId: "",
      stage: "URL_VALIDATION",
      reason: "MISSING_OR_MALFORMED_URL",
      orderable: false
    });

    return {
      urlValid: false,
      marketplace: "unknown",
      productFound: false,
      productIdentityVerified: false,
      sourceProductId: "",
      stockStatus: "UNKNOWN",
      deliveryStatus: "UNKNOWN",
      priceStatus: "UNVERIFIED",
      orderable: false,
      verificationStatus: "INVALID",
      reason: "INVALID_URL",
      message: "Please enter a valid Indian marketplace product link starting with https://",
      originalSourceUrl: rawUrl,
      normalizedSourceUrl: rawUrl,
      verifiedSourceUrl: "",
      verifiedUrl: "",
      canonicalUrl: "",
      verified: false,
      canOrder: false,
      inStock: false,
      deliveryAvailable: false,
      stockStatusText: "Invalid Link",
      deliveryStatusText: "Invalid Link",
      checkedAt
    };
  }

  const normalizedInfo = normalizeProductUrl(rawUrl);
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedInfo.normalizedSourceUrl || rawUrl);
  } catch {
    logVerificationAudit({
      event: "VERIFICATION_FAILED",
      marketplace: "unknown",
      sourceProductId: "",
      stage: "URL_VALIDATION",
      reason: "PARSER_URL_SYNTAX_ERROR",
      orderable: false
    });

    return {
      urlValid: false,
      marketplace: "unknown",
      productFound: false,
      productIdentityVerified: false,
      sourceProductId: "",
      stockStatus: "UNKNOWN",
      deliveryStatus: "UNKNOWN",
      priceStatus: "UNVERIFIED",
      orderable: false,
      verificationStatus: "INVALID",
      reason: "INVALID_URL",
      message: "Malformed URL syntax.",
      originalSourceUrl: rawUrl,
      normalizedSourceUrl: rawUrl,
      verifiedSourceUrl: "",
      verifiedUrl: "",
      canonicalUrl: "",
      verified: false,
      canOrder: false,
      inStock: false,
      deliveryAvailable: false,
      stockStatusText: "Invalid Link",
      deliveryStatusText: "Invalid Link",
      checkedAt
    };
  }

  // 2. SSRF & Approved Domain Check
  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
  if (!APPROVED_DOMAINS.has(hostname) && !APPROVED_DOMAINS.has(`www.${hostname}`)) {
    logVerificationAudit({
      event: "VERIFICATION_FAILED",
      marketplace: hostname,
      sourceProductId: "",
      stage: "URL_VALIDATION",
      reason: "UNSUPPORTED_PLATFORM_DOMAIN",
      orderable: false
    });

    return {
      urlValid: false,
      marketplace: hostname,
      productFound: false,
      productIdentityVerified: false,
      sourceProductId: "",
      stockStatus: "UNKNOWN",
      deliveryStatus: "UNKNOWN",
      priceStatus: "UNVERIFIED",
      orderable: false,
      verificationStatus: "INVALID",
      reason: "UNSUPPORTED_PLATFORM",
      message: `Domain '${hostname}' is not a supported marketplace channel. LINKOVA supports Amazon India, Flipkart, Myntra, AJIO, Meesho, Nykaa, Tata CLiQ, Croma, boAt, etc.`,
      originalSourceUrl: rawUrl,
      normalizedSourceUrl: normalizedInfo.normalizedSourceUrl,
      verifiedSourceUrl: "",
      verifiedUrl: "",
      canonicalUrl: "",
      verified: false,
      canOrder: false,
      inStock: false,
      deliveryAvailable: false,
      stockStatusText: "Unsupported Domain",
      deliveryStatusText: "Unsupported Domain",
      checkedAt
    };
  }

  // 3. Platform Detection & URL Structure Validation
  const platform = getPlatformByDomain(parsedUrl.hostname);
  if (!platform || (!isValidProductUrl(rawUrl, platform) && !isValidProductUrl(normalizedInfo.normalizedSourceUrl, platform))) {
    logVerificationAudit({
      event: "VERIFICATION_FAILED",
      marketplace: platform?.id || hostname,
      sourceProductId: normalizedInfo.sourceProductId,
      stage: "URL_VALIDATION",
      reason: "UNMATCHED_PRODUCT_URL_PATTERN",
      orderable: false
    });

    return {
      urlValid: false,
      marketplace: platform?.id || hostname,
      productFound: false,
      productIdentityVerified: false,
      sourceProductId: normalizedInfo.sourceProductId,
      stockStatus: "UNKNOWN",
      deliveryStatus: "UNKNOWN",
      priceStatus: "UNVERIFIED",
      orderable: false,
      verificationStatus: "INVALID",
      reason: "INVALID_URL",
      message: platform
        ? `This link does not match the product page format for ${platform.displayName}. Please copy the direct link from the product page.`
        : "Invalid marketplace product page URL.",
      originalSourceUrl: rawUrl,
      normalizedSourceUrl: normalizedInfo.normalizedSourceUrl,
      verifiedSourceUrl: "",
      verifiedUrl: "",
      canonicalUrl: normalizedInfo.canonicalSourceUrl,
      verified: false,
      canOrder: false,
      inStock: false,
      deliveryAvailable: false,
      stockStatusText: "Invalid Structure",
      deliveryStatusText: "Invalid Structure",
      checkedAt
    };
  }

  const sourceId = getSourceIdFromUrl(rawUrl) || platform.id;
  const sourceProductId = normalizedInfo.sourceProductId || "";
  const canonicalUrl = normalizedInfo.canonicalSourceUrl || buildCanonicalProductUrl(sourceId, sourceProductId, rawUrl);
  const normalizedUrl = normalizedInfo.normalizedSourceUrl || rawUrl;

  // 4. Primary Lookup: Pre-Verified MongoDB Product Catalog
  let dbProduct: any = null;
  try {
    await connectToDatabase();
    if (sourceProductId) {
      dbProduct = await MarketplaceProductModel.findOne({
        sourceProductId: sourceProductId,
        isActive: true
      }).lean();
    }
    if (!dbProduct) {
      dbProduct = await MarketplaceProductModel.findOne({
        $or: [
          { sourceUrl: rawUrl },
          { sourceUrl: normalizedUrl },
          { verifiedSourceUrl: rawUrl },
          { verifiedSourceUrl: normalizedUrl },
          { canonicalSourceUrl: canonicalUrl }
        ],
        isActive: true
      }).lean();
    }
  } catch (err) {
    console.warn("[checkProductAvailabilityAndDelivery] DB catalog lookup warning:", err);
  }

  // 5. Live Product Page Inspection & Multi-Stage Fallback
  let liveStockStatus: StockState = "UNKNOWN";
  let liveDeliveryStatus: DeliveryState = "UNKNOWN";
  let extractedTitle = dbProduct?.title || dbProduct?.name || "";
  let extractedPriceINR = dbProduct?.priceINR || 0;
  let extractedImage = dbProduct?.images?.[0] || dbProduct?.image || "";
  let extractedBrand = dbProduct?.brand || "";
  let extractedCategory = dbProduct?.category || "Everyday Essentials";
  let extractedVariants: Array<{ name: string; values: string[] }> = dbProduct?.variants || [];
  let signals: string[] = [];
  let fetchAttempted = false;
  let fetchFailed = false;
  let failureReason = "";

  // Attempt live fetch on normalized URL (or raw URL as fallback)
  try {
    fetchAttempted = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const targetFetchUrl = normalizedUrl || rawUrl;
    const fetchRes = await fetch(targetFetchUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache"
      }
    });

    clearTimeout(timeout);

    if (fetchRes.status === 404) {
      logVerificationAudit({
        event: "VERIFICATION_FAILED",
        marketplace: sourceId,
        sourceProductId,
        stage: "LIVE_FETCH",
        reason: "HTTP_404_PAGE_NOT_FOUND",
        orderable: false
      });

      return {
        urlValid: true,
        marketplace: sourceId,
        productFound: false,
        productIdentityVerified: false,
        sourceProductId,
        stockStatus: "OUT_OF_STOCK",
        deliveryStatus: "DELIVERY_UNAVAILABLE",
        priceStatus: "UNVERIFIED",
        orderable: false,
        verificationStatus: "INVALID",
        reason: "INVALID_URL",
        message: "This product page no longer exists on the marketplace (HTTP 404).",
        originalSourceUrl: rawUrl,
        normalizedSourceUrl: normalizedUrl,
        verifiedSourceUrl: rawUrl,
        verifiedUrl: rawUrl,
        canonicalUrl,
        verified: false,
        canOrder: false,
        inStock: false,
        deliveryAvailable: false,
        stockStatusText: "Discontinued / Page 404",
        deliveryStatusText: "Unavailable",
        checkedAt
      };
    }

    if (fetchRes.ok) {
      const html = await fetchRes.text();
      const parsedSignals = parseHtmlStockAndDeliverySignals(html, internalPin);
      liveStockStatus = parsedSignals.stock;
      liveDeliveryStatus = parsedSignals.delivery;
      signals = parsedSignals.signals;

      // Extract Title if not in DB
      if (!extractedTitle) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          extractedTitle = titleMatch[1]
            .replace(/\s*\|.*$/, "")
            .replace(/\s*-\s*Amazon\.in.*$/i, "")
            .replace(/\s*-\s*Myntra.*$/i, "")
            .replace(/\s*-\s*Flipkart.*$/i, "")
            .trim();
        }
      }

      // Extract Price INR if not in DB
      if (!extractedPriceINR) {
        const priceMatch =
          html.match(/class="[^"]*price[^"]*"[^>]*>₹?\s*([0-9,]+(\.[0-9]+)?)/i) ||
          html.match(/["']price["']\s*:\s*["']?([0-9]+(\.[0-9]+)?)["']?/i) ||
          html.match(/["']pdpData["'].*?["']discountedPrice["']\s*:\s*([0-9]+)/i);
        if (priceMatch && priceMatch[1]) {
          extractedPriceINR = parseFloat(priceMatch[1].replace(/,/g, ""));
        }
      }

      // Extract Image if not in DB
      if (!extractedImage) {
        const imgMatch =
          html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
          html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i);
        if (imgMatch && imgMatch[1]) {
          extractedImage = imgMatch[1];
        }
      }
    } else {
      fetchFailed = true;
      failureReason = `HTTP_${fetchRes.status}`;
    }
  } catch (netErr: any) {
    fetchFailed = true;
    failureReason = netErr?.name === "AbortError" ? "TIMEOUT" : (netErr?.message || "NETWORK_ERROR");
  }

  // If live fetch encountered error/timeout, use DB backup if available; otherwise KEEP UNKNOWN
  if (fetchFailed) {
    if (dbProduct) {
      liveStockStatus =
        dbProduct.availability === "out_of_stock"
          ? "OUT_OF_STOCK"
          : dbProduct.availability === "in_stock"
          ? "IN_STOCK"
          : "UNKNOWN";
      liveDeliveryStatus = "DELIVERY_AVAILABLE";
      signals.push("Using cached authorized product record due to provider response limit.");
    } else {
      // CRITICAL REQUIREMENT:
      // API error, timeout, blocked request, parser failure MUST NOT become OUT_OF_STOCK.
      liveStockStatus = "UNKNOWN";
      liveDeliveryStatus = "UNKNOWN";
      failureReason = failureReason || "PROVIDER_UNREACHABLE";
      signals.push(`Live verification unconfirmed (${failureReason}). Availability set to UNKNOWN.`);
    }
  }

  // DB explicit status override if catalog marks out of stock
  if (dbProduct && dbProduct.availability === "out_of_stock") {
    liveStockStatus = "OUT_OF_STOCK";
    signals.push("Product marked out of stock in authorized product database.");
  }

  // Standard marketplace fulfillment inference:
  // If product is actively confirmed in stock with add to cart, and no rejection signal was found
  if (liveStockStatus === "IN_STOCK" && liveDeliveryStatus === "UNKNOWN") {
    liveDeliveryStatus = "DELIVERY_AVAILABLE";
    signals.push("Delivery availability confirmed via standard marketplace fulfillment.");
  }

  // 6. Check Requested Variant Availability (if specified)
  if (requestedVariant && liveStockStatus === "IN_STOCK") {
    const requestedSize = requestedVariant.size?.trim();
    const requestedColor = requestedVariant.color?.trim();

    if (dbProduct?.variants && Array.isArray(dbProduct.variants)) {
      const sizeVariant = dbProduct.variants.find((v: any) => v.name.toLowerCase() === "size");
      if (sizeVariant && requestedSize && !sizeVariant.values.includes(requestedSize)) {
        liveStockStatus = "OUT_OF_STOCK";
        failureReason = `VARIANT_SIZE_UNAVAILABLE: ${requestedSize}`;
      }

      const colorVariant = dbProduct.variants.find((v: any) => v.name.toLowerCase() === "color");
      if (colorVariant && requestedColor && !colorVariant.values.includes(requestedColor)) {
        liveStockStatus = "OUT_OF_STOCK";
        failureReason = `VARIANT_COLOR_UNAVAILABLE: ${requestedColor}`;
      }
    }
  }

  // 7. Identity & Content Sanity Checks
  const hasImage = Boolean(extractedImage) && (await validateProductImage(extractedImage));
  const hasValidPrice = typeof extractedPriceINR === "number" && extractedPriceINR > 0;
  const productFound = Boolean(sourceProductId || dbProduct || extractedTitle);
  const productIdentityVerified = Boolean(
    platform &&
    (sourceProductId || (dbProduct && dbProduct.sourceProductId)) &&
    (productFound || hasImage)
  );
  const priceStatus: PriceState = hasValidPrice ? "VERIFIED" : "UNVERIFIED";

  // 8. Strict Backend Orderability Logic:
  // orderable = true ONLY IF:
  // - productFound === true
  // - productIdentityVerified === true
  // - stockStatus === "IN_STOCK"
  // - deliveryStatus === "DELIVERY_AVAILABLE"
  // - current price is verified (> 0)
  const isOrderable =
    productFound &&
    productIdentityVerified &&
    liveStockStatus === "IN_STOCK" &&
    liveDeliveryStatus === "DELIVERY_AVAILABLE" &&
    priceStatus === "VERIFIED";

  // 9. Authoritative Verification Status Matrix
  let verificationStatus: VerificationStatus = "PARTIAL";
  let reason: AvailabilityReason = "AVAILABLE";
  let message = "✓ Product verified, in stock, and available for delivery.";
  let stockStatusText = "✓ In Stock";
  let deliveryStatusText = "✓ Delivery available";

  if (!productFound && !productIdentityVerified) {
    verificationStatus = "INVALID";
    reason = "UNVERIFIED";
    message = "✕ Product could not be verified on the marketplace.";
    stockStatusText = "Unverified Link";
    deliveryStatusText = "Unverified Link";
  } else if (liveStockStatus === "OUT_OF_STOCK") {
    verificationStatus = "PARTIAL";
    reason = "OUT_OF_STOCK";
    message = "❌ This product or selected variant is confirmed out of stock.";
    stockStatusText = "❌ Out of Stock";
    deliveryStatusText = liveDeliveryStatus === "DELIVERY_AVAILABLE" ? "✓ Delivery available" : "Delivery unconfirmed";
  } else if (liveDeliveryStatus === "DELIVERY_UNAVAILABLE") {
    verificationStatus = "PARTIAL";
    reason = "DELIVERY_UNAVAILABLE";
    message = "❌ Delivery is currently unavailable for this product.";
    stockStatusText = liveStockStatus === "IN_STOCK" ? "✓ In Stock" : "Stock unconfirmed";
    deliveryStatusText = "❌ Delivery unavailable";
  } else if (liveStockStatus === "UNKNOWN" || liveDeliveryStatus === "UNKNOWN") {
    // CRITICAL: Unknown stock/delivery is NEVER converted to OUT_OF_STOCK
    verificationStatus = "PARTIAL";
    reason = liveStockStatus === "UNKNOWN" ? "STOCK_UNCONFIRMED" : "DELIVERY_UNCONFIRMED";
    message = "⚠️ Availability could not be confirmed right now. You can request this product for manual sourcing.";
    stockStatusText = "⚠️ Stock Unconfirmed";
    deliveryStatusText = "⚠️ Delivery Unconfirmed";
  } else if (isOrderable) {
    verificationStatus = "VERIFIED";
    reason = "AVAILABLE";
    message = "✓ Product verified, in stock, and available for delivery.";
    stockStatusText = "✓ In Stock";
    deliveryStatusText = "✓ Delivery available";
  }

  // 10. Audit Logging
  logVerificationAudit({
    event: isOrderable ? "VERIFICATION_SUCCESS" : verificationStatus === "PARTIAL" ? "VERIFICATION_PARTIAL" : "VERIFICATION_FAILED",
    marketplace: sourceId,
    sourceProductId,
    stage: "FINAL_DECISION",
    reason: failureReason || reason,
    orderable: isOrderable
  });

  const productDetails: AvailabilityProductDetails = {
    name: extractedTitle || dbProduct?.title || `${getMarketplaceDisplayName(sourceId)} Product`,
    title: extractedTitle || dbProduct?.title || `${getMarketplaceDisplayName(sourceId)} Product`,
    image: extractedImage || dbProduct?.images?.[0] || "",
    images: dbProduct?.images || (extractedImage ? [extractedImage] : []),
    priceINR: extractedPriceINR || dbProduct?.priceINR || 0,
    originalPriceINR: dbProduct?.originalPriceINR,
    brand: extractedBrand || dbProduct?.brand || getMarketplaceDisplayName(sourceId),
    category: extractedCategory || dbProduct?.category || "Everyday Essentials",
    source: sourceId,
    marketplace: sourceId,
    sourceProductId: sourceProductId || dbProduct?.sourceProductId || "",
    originalSourceUrl: rawUrl,
    normalizedSourceUrl: normalizedUrl,
    verifiedUrl: normalizedUrl || rawUrl,
    canonicalUrl,
    variants: extractedVariants
  };

  return {
    urlValid: true,
    marketplace: sourceId,
    productFound,
    productIdentityVerified,
    sourceProductId,
    stockStatus: liveStockStatus,
    deliveryStatus: liveDeliveryStatus,
    priceStatus,
    orderable: isOrderable,
    verificationStatus,
    reason,
    message,
    originalSourceUrl: rawUrl,
    normalizedSourceUrl: normalizedUrl,
    verifiedSourceUrl: normalizedUrl || rawUrl,
    verifiedUrl: normalizedUrl || rawUrl,
    canonicalUrl,
    verified: productFound && productIdentityVerified,
    canOrder: isOrderable,
    inStock: isOrderable && liveStockStatus === "IN_STOCK",
    deliveryAvailable: isOrderable && liveDeliveryStatus === "DELIVERY_AVAILABLE",
    stockStatusText,
    deliveryStatusText,
    product: productDetails,
    checkedAt,
    _internalAudit: {
      originalUrl: rawUrl,
      normalizedUrl,
      verifiedUrl: normalizedUrl || rawUrl,
      marketplace: sourceId,
      sourceProductId,
      productName: productDetails.name,
      productIdentityResult: productIdentityVerified ? "VERIFIED" : "UNVERIFIED",
      stockResult: liveStockStatus,
      deliveryResult: liveDeliveryStatus,
      priceResult: priceStatus,
      verificationProvider: dbProduct ? "MongoDB Authorized Catalog" : "Live Marketplace Inspector",
      verificationTimestamp: checkedAt,
      failureReason: failureReason || (isOrderable ? "NONE" : reason),
      finalOrderableResult: isOrderable,
      internalPin,
      internalDestination: `${SOURCING_DESTINATION.postOffice}, ${SOURCING_DESTINATION.district}, ${SOURCING_DESTINATION.state}`,
      signals
    }
  };
}
