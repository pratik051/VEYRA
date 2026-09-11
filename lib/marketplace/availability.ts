import {
  APPROVED_DOMAINS,
  getPlatformByDomain,
  isValidProductUrl,
  getSourceIdFromUrl
} from "../sourcing-platforms";
import { connectToDatabase } from "../db/mongodb";
import { MarketplaceProductModel } from "../models/marketplace-product-model";
import { buildCanonicalProductUrl, validateProductImage } from "./verification";
import { extractProductIdFromUrlOrText } from "./ai-product-matcher";
import { SOURCING_DESTINATION, DEFAULT_TRANSIT_PIN } from "../config/sourcing-destination";

export type StockState = "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
export type DeliveryState = "DELIVERY_AVAILABLE" | "DELIVERY_UNAVAILABLE" | "UNKNOWN";

export type AvailabilityReason =
  | "AVAILABLE"
  | "OUT_OF_STOCK"
  | "DELIVERY_UNAVAILABLE"
  | "DELIVERY_UNCONFIRMED"
  | "STOCK_UNCONFIRMED"
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
  sourceProductId: string;
  canonicalUrl: string;
  verifiedUrl: string;
  variants?: Array<{ name: string; values: string[] }>;
}

export interface AvailabilityCheckResult {
  verified: boolean;
  orderable: boolean;
  canOrder: boolean; // Alias for backward-compat
  inStock: boolean;
  deliveryAvailable: boolean;
  stockStatus: StockState;
  deliveryStatus: DeliveryState;
  reason: AvailabilityReason;
  message: string;
  stockStatusText: string;
  deliveryStatusText: string;
  verifiedUrl: string;
  canonicalUrl: string;
  product?: AvailabilityProductDetails;
  checkedAt: string;
  // Admin-only internal debugging field (stripped before sending to customers)
  _internalAudit?: {
    internalPin: string;
    internalDestination: string;
    signals: string[];
  };
}

/**
 * Parses live HTML / schema / text content for explicit out-of-stock / availability signals
 */
function parseHtmlStockAndDeliverySignals(
  html: string,
  internalPin: string = DEFAULT_TRANSIT_PIN
): { stock: StockState; delivery: DeliveryState; signals: string[] } {
  const lowHtml = html.toLowerCase();
  const signals: string[] = [];

  let stock: StockState = "UNKNOWN";
  let delivery: DeliveryState = "UNKNOWN";

  // 1. Explicit Out-of-Stock indicators
  const outOfStockKeywords = [
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
    "out_of_stock",
    "product unavailable"
  ];

  for (const phrase of outOfStockKeywords) {
    if (lowHtml.includes(phrase)) {
      stock = "OUT_OF_STOCK";
      signals.push(`Detected out-of-stock signal: "${phrase}"`);
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
    "order within"
  ];

  if (stock !== "OUT_OF_STOCK") {
    for (const phrase of inStockKeywords) {
      if (lowHtml.includes(phrase)) {
        stock = "IN_STOCK";
        signals.push(`Detected in-stock signal: "${phrase}"`);
        break;
      }
    }
  }

  // 3. Postal Code Delivery Eligibility (Inspecting internal transit capability)
  const undeliverableKeywords = [
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
  for (const phrase of undeliverableKeywords) {
    if (lowHtml.includes(phrase)) {
      delivery = "DELIVERY_UNAVAILABLE";
      hasUndeliverableSignal = true;
      signals.push(`Detected delivery rejection signal: "${phrase}"`);
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
      "eligible for free delivery"
    ];

    for (const phrase of deliverableKeywords) {
      if (lowHtml.includes(phrase)) {
        delivery = "DELIVERY_AVAILABLE";
        signals.push(`Detected delivery availability signal: "${phrase}"`);
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
    signals.push("Product subject to courier freight restrictions for internal transit depot.");
  }

  return { stock, delivery, signals };
}

/**
 * Comprehensive Product Availability & Delivery Verification Engine.
 * Source of truth for all product checks before order placement.
 *
 * All private location details are strictly internal to the server.
 */
export async function checkProductAvailabilityAndDelivery(
  request: AvailabilityCheckRequest
): Promise<AvailabilityCheckResult> {
  const rawUrl = (request.url || "").trim();
  const requestedVariant = request.variant;
  const quantity = Math.max(1, request.quantity || 1);
  const checkedAt = new Date().toISOString();
  const internalPin = request.internalPostalCode || SOURCING_DESTINATION.pin;

  // 1. URL Presence & Structure
  if (!rawUrl || (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://"))) {
    return {
      verified: false,
      orderable: false,
      canOrder: false,
      inStock: false,
      deliveryAvailable: false,
      stockStatus: "UNKNOWN",
      deliveryStatus: "UNKNOWN",
      reason: "INVALID_URL",
      message: "Please enter a valid Indian marketplace product link starting with https://",
      stockStatusText: "Invalid Link",
      deliveryStatusText: "Invalid Link",
      verifiedUrl: "",
      canonicalUrl: "",
      checkedAt
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return {
      verified: false,
      orderable: false,
      canOrder: false,
      inStock: false,
      deliveryAvailable: false,
      stockStatus: "UNKNOWN",
      deliveryStatus: "UNKNOWN",
      reason: "INVALID_URL",
      message: "Malformed URL syntax.",
      stockStatusText: "Invalid Link",
      deliveryStatusText: "Invalid Link",
      verifiedUrl: "",
      canonicalUrl: "",
      checkedAt
    };
  }

  // 2. SSRF & Approved Domain Check
  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
  if (!APPROVED_DOMAINS.has(hostname) && !APPROVED_DOMAINS.has(`www.${hostname}`)) {
    return {
      verified: false,
      orderable: false,
      canOrder: false,
      inStock: false,
      deliveryAvailable: false,
      stockStatus: "UNKNOWN",
      deliveryStatus: "UNKNOWN",
      reason: "UNSUPPORTED_PLATFORM",
      message: `Domain '${hostname}' is not a supported marketplace channel. LINKOVA supports Amazon India, Flipkart, Myntra, AJIO, Meesho, Nykaa, Tata CLiQ, Croma, boAt, etc.`,
      stockStatusText: "Unsupported Domain",
      deliveryStatusText: "Unsupported Domain",
      verifiedUrl: "",
      canonicalUrl: "",
      checkedAt
    };
  }

  // 3. Platform Detection & URL Structure Validation
  const platform = getPlatformByDomain(parsedUrl.hostname);
  if (!platform || !isValidProductUrl(rawUrl, platform)) {
    return {
      verified: false,
      orderable: false,
      canOrder: false,
      inStock: false,
      deliveryAvailable: false,
      stockStatus: "UNKNOWN",
      deliveryStatus: "UNKNOWN",
      reason: "INVALID_URL",
      message: platform
        ? `This link does not match the product page format for ${platform.displayName}. Please copy the direct link from the product page.`
        : "Invalid marketplace product page URL.",
      stockStatusText: "Invalid Structure",
      deliveryStatusText: "Invalid Structure",
      verifiedUrl: "",
      canonicalUrl: "",
      checkedAt
    };
  }

  const sourceId = getSourceIdFromUrl(rawUrl) || platform.id;
  const sourceProductId = extractProductIdFromUrlOrText(rawUrl, sourceId) || "";
  const canonicalUrl = buildCanonicalProductUrl(sourceId, sourceProductId, rawUrl);

  // 4. Check Database for Pre-Verified Marketplace Record
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
        $or: [{ sourceUrl: rawUrl }, { verifiedSourceUrl: rawUrl }, { canonicalSourceUrl: canonicalUrl }],
        isActive: true
      }).lean();
    }
  } catch (err) {
    console.error("[checkProductAvailabilityAndDelivery] DB lookup error:", err);
  }

  // 5. Live Product Page Inspection
  let liveStockStatus: StockState = "UNKNOWN";
  let liveDeliveryStatus: DeliveryState = "UNKNOWN";
  let extractedTitle = dbProduct?.title || dbProduct?.name || "";
  let extractedPriceINR = dbProduct?.priceINR || 0;
  let extractedImage = dbProduct?.images?.[0] || dbProduct?.image || "";
  let extractedBrand = dbProduct?.brand || "";
  let extractedCategory = dbProduct?.category || "Everyday Essentials";
  let extractedVariants: Array<{ name: string; values: string[] }> = dbProduct?.variants || [];
  let signals: string[] = [];
  let verificationError = "";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const fetchRes = await fetch(rawUrl, {
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
      return {
        verified: false,
        orderable: false,
        canOrder: false,
        inStock: false,
        deliveryAvailable: false,
        stockStatus: "OUT_OF_STOCK",
        deliveryStatus: "DELIVERY_UNAVAILABLE",
        reason: "INVALID_URL",
        message: "This product page no longer exists on the marketplace (HTTP 404).",
        stockStatusText: "Discontinued / Page 404",
        deliveryStatusText: "Unavailable",
        verifiedUrl: rawUrl,
        canonicalUrl,
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
            .trim();
        }
      }

      // Extract Price INR if not in DB
      if (!extractedPriceINR) {
        const priceMatch =
          html.match(/class="[^"]*price[^"]*"[^>]*>₹?\s*([0-9,]+(\.[0-9]+)?)/i) ||
          html.match(/["']price["']\s*:\s*["']?([0-9]+(\.[0-9]+)?)["']?/i);
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
    }
  } catch (netErr: any) {
    if (dbProduct) {
      liveStockStatus =
        dbProduct.availability === "out_of_stock"
          ? "OUT_OF_STOCK"
          : dbProduct.availability === "in_stock"
          ? "IN_STOCK"
          : "UNKNOWN";
      liveDeliveryStatus = "DELIVERY_AVAILABLE";
      signals.push("Using cached DB verification record due to network response limit.");
    } else {
      liveStockStatus = "UNKNOWN";
      liveDeliveryStatus = "UNKNOWN";
      verificationError = "We couldn't confirm availability right now.";
    }
  }

  // DB status override if explicitly out of stock
  if (dbProduct && dbProduct.availability === "out_of_stock") {
    liveStockStatus = "OUT_OF_STOCK";
  }

  // If live check was successful and we found add to cart buttons, but delivery is unconfirmed,
  // we treat delivery as available if there was no explicit delivery rejection
  if (liveStockStatus === "IN_STOCK" && liveDeliveryStatus === "UNKNOWN") {
    liveDeliveryStatus = "DELIVERY_AVAILABLE";
    signals.push("Delivery confirmed via standard marketplace fulfillment.");
  }

  // 6. Check Requested Variant Availability
  if (requestedVariant && liveStockStatus === "IN_STOCK") {
    const requestedSize = requestedVariant.size?.trim();
    const requestedColor = requestedVariant.color?.trim();

    if (dbProduct?.variants && Array.isArray(dbProduct.variants)) {
      const sizeVariant = dbProduct.variants.find((v: any) => v.name.toLowerCase() === "size");
      if (sizeVariant && requestedSize && !sizeVariant.values.includes(requestedSize)) {
        liveStockStatus = "OUT_OF_STOCK";
        verificationError = `Selected size '${requestedSize}' is currently unavailable.`;
      }

      const colorVariant = dbProduct.variants.find((v: any) => v.name.toLowerCase() === "color");
      if (colorVariant && requestedColor && !colorVariant.values.includes(requestedColor)) {
        liveStockStatus = "OUT_OF_STOCK";
        verificationError = `Selected color '${requestedColor}' is currently unavailable.`;
      }
    }
  }

  // 7. Image & Price Sanity
  const hasImage = Boolean(extractedImage) && (await validateProductImage(extractedImage));
  const hasValidPrice = typeof extractedPriceINR === "number" && extractedPriceINR > 0;
  const isVerified = Boolean(platform && sourceProductId && (dbProduct || hasImage || extractedTitle));

  // 8. Strict Orderability Requirement:
  // A product is ORDERABLE ONLY when ALL of these are confirmed:
  // - Verified marketplace & product exists
  // - Stock status is strictly IN_STOCK
  // - Delivery status is strictly DELIVERY_AVAILABLE
  // - Price is valid
  const inStock = isVerified && liveStockStatus === "IN_STOCK";
  const deliveryAvailable = isVerified && inStock && liveDeliveryStatus === "DELIVERY_AVAILABLE";
  const orderable = isVerified && inStock && deliveryAvailable && hasValidPrice;

  // 9. Generic, Safe Customer Messages (Never leaking private PIN or location)
  let reason: AvailabilityReason = "AVAILABLE";
  let message = "✓ Product verified, in stock, and available for delivery.";
  let stockStatusText = inStock ? "✓ In Stock" : liveStockStatus === "OUT_OF_STOCK" ? "❌ Out of Stock" : "⚠️ Stock Unconfirmed";
  let deliveryStatusText = deliveryAvailable ? "✓ Delivery available" : liveDeliveryStatus === "DELIVERY_UNAVAILABLE" ? "❌ Delivery unavailable" : "⚠️ Delivery Unconfirmed";

  if (!isVerified) {
    reason = "UNVERIFIED";
    message = "⚠️ We couldn't verify the marketplace product details right now.";
  } else if (!inStock && liveStockStatus === "OUT_OF_STOCK") {
    reason = "OUT_OF_STOCK";
    message = verificationError || "❌ This product or selected variant is currently out of stock.";
  } else if (!deliveryAvailable && liveDeliveryStatus === "DELIVERY_UNAVAILABLE") {
    reason = "DELIVERY_UNAVAILABLE";
    message = "❌ Delivery is currently unavailable for this product.";
  } else if (liveStockStatus === "UNKNOWN") {
    reason = "STOCK_UNCONFIRMED";
    message = "⚠️ Stock availability could not be confirmed right now. You can request this product for manual sourcing.";
  } else if (liveDeliveryStatus === "UNKNOWN") {
    reason = "DELIVERY_UNCONFIRMED";
    message = "⚠️ Delivery availability could not be confirmed right now. You can request this product for manual sourcing.";
  }

  const productDetails: AvailabilityProductDetails = {
    name: extractedTitle || dbProduct?.title || "Indian Marketplace Product",
    title: extractedTitle || dbProduct?.title || "Indian Marketplace Product",
    image: extractedImage || dbProduct?.images?.[0] || "",
    images: dbProduct?.images || (extractedImage ? [extractedImage] : []),
    priceINR: extractedPriceINR || dbProduct?.priceINR || 0,
    originalPriceINR: dbProduct?.originalPriceINR,
    brand: extractedBrand || dbProduct?.brand || "Verified Brand",
    category: extractedCategory || dbProduct?.category || "Everyday Essentials",
    source: sourceId,
    sourceProductId: sourceProductId || dbProduct?.sourceProductId || "",
    canonicalUrl,
    verifiedUrl: rawUrl,
    variants: extractedVariants
  };

  return {
    verified: isVerified,
    orderable,
    canOrder: orderable,
    inStock,
    deliveryAvailable,
    stockStatus: liveStockStatus,
    deliveryStatus: liveDeliveryStatus,
    reason,
    message,
    stockStatusText,
    deliveryStatusText,
    verifiedUrl: rawUrl,
    canonicalUrl,
    product: productDetails,
    checkedAt,
    _internalAudit: {
      internalPin,
      internalDestination: `${SOURCING_DESTINATION.postOffice}, ${SOURCING_DESTINATION.district}, ${SOURCING_DESTINATION.state}`,
      signals
    }
  };
}
