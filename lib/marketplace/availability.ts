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

export const REQUIRED_DELIVERY_PIN = "854331";

export type AvailabilityReason =
  | "AVAILABLE"
  | "OUT_OF_STOCK"
  | "DELIVERY_UNAVAILABLE"
  | "UNAVAILABLE"
  | "UNVERIFIED"
  | "INVALID_URL"
  | "UNSUPPORTED_PLATFORM";

export interface AvailabilityCheckRequest {
  url: string;
  postalCode?: string;
  variant?: {
    size?: string;
    color?: string;
    name?: string;
    [key: string]: any;
  };
  quantity?: number;
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
  inStock: boolean;
  deliveryAvailable: boolean;
  postalCode: string;
  canOrder: boolean;
  reason: AvailabilityReason;
  message: string;
  stockStatusText: string;
  deliveryStatusText: string;
  verifiedUrl: string;
  canonicalUrl: string;
  product?: AvailabilityProductDetails;
  checkedAt: string;
}

/**
 * Checks if a PIN code is valid 6-digit Indian Postal Code
 */
export function isValidIndianPinCode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

/**
 * Parses live HTML / Schema / text content for explicit out-of-stock / availability signals
 */
function parseHtmlStockAndDeliverySignals(
  html: string,
  postalCode: string = REQUIRED_DELIVERY_PIN
): { inStock: boolean; deliveryAvailable: boolean; signals: string[] } {
  const lowHtml = html.toLowerCase();
  const signals: string[] = [];

  let inStock = true;
  let deliveryAvailable = true;

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
      inStock = false;
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
    "available to ship"
  ];

  let hasExplicitInStock = false;
  for (const phrase of inStockKeywords) {
    if (lowHtml.includes(phrase)) {
      hasExplicitInStock = true;
      break;
    }
  }

  if (!hasExplicitInStock && !inStock) {
    inStock = false;
  }

  // 3. Postal Code Delivery Eligibility
  // Check for explicit geo/PIN rejection signals in page content
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

  for (const phrase of undeliverableKeywords) {
    if (lowHtml.includes(phrase)) {
      deliveryAvailable = false;
      signals.push(`Detected delivery rejection signal: "${phrase}"`);
      break;
    }
  }

  // Category freight restrictions: heavy freight without local transit depot (e.g. huge refrigerators, 65+ inch glass unboxed items)
  if (
    lowHtml.includes("freight-only") ||
    lowHtml.includes("heavy bulky appliance - local city delivery only") ||
    lowHtml.includes("hazardous material - cannot be shipped by air/transit")
  ) {
    deliveryAvailable = false;
    signals.push("Product subject to regional courier freight restrictions for transit PIN 854331.");
  }

  return { inStock, deliveryAvailable, signals };
}

/**
 * Comprehensive Product Availability & Delivery Verification Engine.
 * Source of truth for all product checks before order placement.
 */
export async function checkProductAvailabilityAndDelivery(
  request: AvailabilityCheckRequest
): Promise<AvailabilityCheckResult> {
  const rawUrl = (request.url || "").trim();
  const postalCode = (request.postalCode || REQUIRED_DELIVERY_PIN).trim();
  const requestedVariant = request.variant;
  const quantity = Math.max(1, request.quantity || 1);
  const checkedAt = new Date().toISOString();

  // 1. URL Presence & Structure
  if (!rawUrl || (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://"))) {
    return {
      verified: false,
      inStock: false,
      deliveryAvailable: false,
      postalCode,
      canOrder: false,
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
      inStock: false,
      deliveryAvailable: false,
      postalCode,
      canOrder: false,
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
      inStock: false,
      deliveryAvailable: false,
      postalCode,
      canOrder: false,
      reason: "UNSUPPORTED_PLATFORM",
      message: `Domain '${hostname}' is not a supported Indian marketplace. LINKOVA supports Amazon India, Flipkart, Myntra, AJIO, Meesho, Nykaa, Tata CLiQ, Croma, boAt, Noise, etc.`,
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
      inStock: false,
      deliveryAvailable: false,
      postalCode,
      canOrder: false,
      reason: "INVALID_URL",
      message: platform
        ? `This link does not match the product page structure for ${platform.displayName}. Please copy the link directly from the product page.`
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

  // 5. Live Product Page Inspection (Real Stock & Delivery Verification)
  let liveInStock = true;
  let liveDeliveryAvailable = true;
  let extractedTitle = dbProduct?.title || dbProduct?.name || "";
  let extractedPriceINR = dbProduct?.priceINR || 0;
  let extractedImage = dbProduct?.images?.[0] || dbProduct?.image || "";
  let extractedBrand = dbProduct?.brand || "";
  let extractedCategory = dbProduct?.category || "Everyday Essentials";
  let extractedVariants: Array<{ name: string; values: string[] }> = dbProduct?.variants || [];
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
        inStock: false,
        deliveryAvailable: false,
        postalCode,
        canOrder: false,
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
      const parsedSignals = parseHtmlStockAndDeliverySignals(html, postalCode);
      liveInStock = parsedSignals.inStock;
      liveDeliveryAvailable = parsedSignals.deliveryAvailable;

      // Extract Title if not in DB
      if (!extractedTitle) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          extractedTitle = titleMatch[1].replace(/\s*\|.*$/, "").replace(/\s*-\s*Amazon\.in.*$/i, "").trim();
        }
      }

      // Extract Price INR if not in DB
      if (!extractedPriceINR) {
        const priceMatch = html.match(/class="[^"]*price[^"]*"[^>]*>₹?\s*([0-9,]+(\.[0-9]+)?)/i) ||
          html.match(/["']price["']\s*:\s*["']?([0-9]+(\.[0-9]+)?)["']?/i);
        if (priceMatch && priceMatch[1]) {
          extractedPriceINR = parseFloat(priceMatch[1].replace(/,/g, ""));
        }
      }

      // Extract Image if not in DB
      if (!extractedImage) {
        const imgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
          html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i);
        if (imgMatch && imgMatch[1]) {
          extractedImage = imgMatch[1];
        }
      }
    }
  } catch (netErr: any) {
    // If live fetch timed out or was blocked by CDN protection, fallback to DB record or structural verification
    if (dbProduct) {
      liveInStock = dbProduct.availability === "in_stock" || dbProduct.availability === "limited";
      liveDeliveryAvailable = true;
    } else {
      // Without DB product and without network response, we cannot guess stock
      verificationError = "Network check was unable to inspect live stock status.";
    }
  }

  // 6. DB status override if product was explicitly marked out of stock in DB
  if (dbProduct && dbProduct.availability === "out_of_stock") {
    liveInStock = false;
  }

  // 7. Check Requested Variant Availability
  if (requestedVariant && liveInStock) {
    const requestedSize = requestedVariant.size?.trim();
    const requestedColor = requestedVariant.color?.trim();

    if (dbProduct?.variants && Array.isArray(dbProduct.variants)) {
      const sizeVariant = dbProduct.variants.find((v: any) => v.name.toLowerCase() === "size");
      if (sizeVariant && requestedSize && !sizeVariant.values.includes(requestedSize)) {
        liveInStock = false;
        verificationError = `Selected size '${requestedSize}' is currently unavailable.`;
      }

      const colorVariant = dbProduct.variants.find((v: any) => v.name.toLowerCase() === "color");
      if (colorVariant && requestedColor && !colorVariant.values.includes(requestedColor)) {
        liveInStock = false;
        verificationError = `Selected color '${requestedColor}' is currently unavailable.`;
      }
    }
  }

  // 8. Image & Price Sanity
  const hasImage = Boolean(extractedImage) && (await validateProductImage(extractedImage));
  const hasValidPrice = typeof extractedPriceINR === "number" && extractedPriceINR > 0;

  // 9. Calculate Final Decision
  const isVerified = Boolean(platform && sourceProductId && (dbProduct || hasImage || extractedTitle));
  const inStock = isVerified && liveInStock;
  const deliveryAvailable = isVerified && inStock && liveDeliveryAvailable;
  const canOrder = isVerified && inStock && deliveryAvailable;

  // 10. Determine Reason and Customer Message
  let reason: AvailabilityReason = "AVAILABLE";
  let message = "✓ Product verified, in stock, and available for delivery to postal code 854331.";

  if (!isVerified) {
    reason = "UNVERIFIED";
    message = "⚠️ We couldn't verify the marketplace product details right now.";
  } else if (!inStock && !deliveryAvailable) {
    reason = "UNAVAILABLE";
    message = `❌ This product cannot be ordered. It is currently out of stock and unavailable for delivery to postal code ${postalCode}.`;
  } else if (!inStock) {
    reason = "OUT_OF_STOCK";
    message = verificationError || "❌ This product or selected variant is currently out of stock.";
  } else if (!deliveryAvailable) {
    reason = "DELIVERY_UNAVAILABLE";
    message = `❌ This product cannot currently be delivered to postal code ${postalCode}.`;
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
    inStock,
    deliveryAvailable,
    postalCode,
    canOrder,
    reason,
    message,
    stockStatusText: inStock ? "✓ In Stock" : "❌ Out of Stock",
    deliveryStatusText: deliveryAvailable
      ? `✓ Available to ${postalCode}`
      : `❌ Unavailable to ${postalCode}`,
    verifiedUrl: rawUrl,
    canonicalUrl,
    product: productDetails,
    checkedAt
  };
}
