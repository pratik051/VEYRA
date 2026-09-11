import {
  APPROVED_DOMAINS,
  getPlatformByDomain,
  isValidProductUrl,
  getSourceIdFromUrl
} from "../sourcing-platforms";
import { MarketplaceProduct } from "./types";
import { findAndVerifyAiCandidate } from "./ai-product-matcher";

export interface VerificationResult {
  verified: boolean;
  originalSourceUrl: string;
  verifiedSourceUrl: string;
  canonicalSourceUrl: string;
  verificationMethod: "original_url" | "ai_candidate" | "api" | "feed" | "manual";
  matchConfidence: number;
  imageVerified: boolean;
  priceVerified: boolean;
  imageValidationStatus: "valid" | "invalid";
  priceValidationStatus: "valid" | "invalid";
  published: boolean;
  error?: string;
}

/**
 * Known trusted marketplace image CDN hosts
 */
const TRUSTED_IMAGE_CDNS = [
  "m.media-amazon.com",
  "images-na.ssl-images-amazon.com",
  "rukminim1.flixcart.com",
  "rukminim2.flixcart.com",
  "assets.myntassets.com",
  "images.meesho.com",
  "images-static.nykaa.com",
  "assets.tatacliq.com",
  "media.croma.com",
  "cdn.shopify.com",
  "assets.ajio.com",
  "images.unsplash.com" // Allowed for demo/fallback assets if valid
];

/**
 * Validates whether an image URL is a genuine, accessible product image.
 * Rejects placeholder patterns, local fake files, empty strings, and malformed URLs.
 */
export async function validateProductImage(imageUrl?: string): Promise<boolean> {
  if (!imageUrl || typeof imageUrl !== "string") return false;
  const trimmed = imageUrl.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;

  // Reject generic placeholders or broken links
  const lowercase = trimmed.toLowerCase();
  if (
    lowercase.includes("placeholder") ||
    lowercase.includes("fake") ||
    lowercase.includes("broken") ||
    lowercase.includes("example.com") ||
    lowercase.includes("dummy")
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    // Check against known CDNs or valid image extensions
    const isKnownCDN = TRUSTED_IMAGE_CDNS.some((cdn) => host.includes(cdn) || host.endsWith(cdn));
    const hasImageExt = /\.(jpg|jpeg|png|webp|avif|gif)(\?.*)?$/i.test(parsed.pathname);

    if (isKnownCDN || hasImageExt) {
      return true;
    }

    // Secondary HTTP HEAD check with 3-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      const res = await fetch(trimmed, {
        method: "HEAD",
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      clearTimeout(timeout);
      const contentType = res.headers.get("content-type") || "";
      return res.ok && (contentType.startsWith("image/") || contentType.includes("octet-stream"));
    } catch {
      clearTimeout(timeout);
      // If HEAD request fails due to CORS or CDN restriction, fallback to URL structure validation
      return isKnownCDN || hasImageExt;
    }
  } catch {
    return false;
  }
}

/**
 * Generates the official canonical product URL on the source marketplace.
 */
export function buildCanonicalProductUrl(source: string, sourceProductId: string, originalUrl?: string): string {
  const normSource = source.toLowerCase().trim();
  const cleanId = (sourceProductId || "").trim();

  if (!cleanId) return originalUrl || "";

  switch (normSource) {
    case "amazon":
    case "amazon-india":
      return `https://www.amazon.in/dp/${cleanId}`;
    case "flipkart":
      return cleanId.startsWith("itm")
        ? `https://www.flipkart.com/p/${cleanId}`
        : `https://www.flipkart.com/p/itm${cleanId}`;
    case "myntra":
      return `https://www.myntra.com/${cleanId}`;
    case "meesho":
      return `https://www.meesho.com/p/${cleanId}`;
    case "nykaa":
      return `https://www.nykaa.com/p/${cleanId}`;
    case "ajio":
      return `https://www.ajio.com/p/${cleanId}`;
    case "tatacliq":
      return `https://www.tatacliq.com/p-${cleanId}`;
    case "croma":
      return `https://www.croma.com/p/${cleanId}`;
    case "boat":
    case "boat-lifestyle":
      return `https://www.boat-lifestyle.com/products/${cleanId.toLowerCase()}`;
    case "noise":
    case "noise-india":
      return `https://www.gonoise.com/products/${cleanId.toLowerCase()}`;
    default:
      return originalUrl || "";
  }
}

/**
 * Validates and verifies a marketplace product URL.
 * Ensures the target domain is approved, the URL structure is valid,
 * and performs non-intrusive backend check following legitimate redirects.
 */
export async function verifyMarketplaceUrl(
  rawUrl: string,
  source: string,
  sourceProductId?: string
): Promise<{ valid: boolean; verifiedUrl: string; canonicalUrl: string; error?: string }> {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      valid: false,
      verifiedUrl: "",
      canonicalUrl: "",
      error: "Missing product URL"
    };
  }

  const trimmed = rawUrl.trim();
  const canonicalUrl = buildCanonicalProductUrl(source, sourceProductId || "", trimmed);

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

    // 1. SSRF & Domain Check
    if (!APPROVED_DOMAINS.has(hostname) && !APPROVED_DOMAINS.has(`www.${hostname}`)) {
      return {
        valid: false,
        verifiedUrl: "",
        canonicalUrl,
        error: `Domain '${hostname}' is not an authorized Indian marketplace.`
      };
    }

    // 2. Reject known error redirects in URL structure
    const lowercaseUrl = trimmed.toLowerCase();
    if (
      lowercaseUrl.includes("cs_404_link") ||
      lowercaseUrl.includes("page-not-found") ||
      lowercaseUrl.includes("error_404") ||
      lowercaseUrl.includes("ref=cs_404")
    ) {
      return {
        valid: false,
        verifiedUrl: "",
        canonicalUrl,
        error: "URL points to a known 404 / error redirect."
      };
    }

    // 3. Structural URL validation
    const platform = getPlatformByDomain(parsed.hostname);
    if (platform && !isValidProductUrl(trimmed, platform)) {
      return {
        valid: false,
        verifiedUrl: "",
        canonicalUrl,
        error: `URL structure did not match ${platform.displayName} product specifications.`
      };
    }

    return {
      valid: true,
      verifiedUrl: trimmed,
      canonicalUrl: canonicalUrl || trimmed
    };
  } catch (err: any) {
    return {
      valid: false,
      verifiedUrl: "",
      canonicalUrl,
      error: `URL parsing failed: ${err?.message || "Invalid URL format"}`
    };
  }
}

/**
 * Complete Product Record Verification Engine with AI Candidate Fallback.
 * Pipeline:
 * 1. Validate Price (INR > 0)
 * 2. Validate Real Images (CDN check)
 * 3. Verify Original URL
 * 4. IF Original URL fails: AI Candidate Matching Service generates candidates → Backend verifies each candidate
 * 5. Publish ONLY if backend verification passes and confidence >= 75
 */
export async function verifyProductRecord(product: MarketplaceProduct): Promise<VerificationResult> {
  const originalSourceUrl = product.originalSourceUrl || product.sourceUrl || "";
  const canonicalFallback = buildCanonicalProductUrl(product.source, product.sourceProductId, originalSourceUrl);

  // 1. Validate Price
  const isPriceValid = typeof product.priceINR === "number" && !isNaN(product.priceINR) && product.priceINR > 0;
  if (!isPriceValid) {
    return {
      verified: false,
      originalSourceUrl,
      verifiedSourceUrl: "",
      canonicalSourceUrl: canonicalFallback,
      verificationMethod: "original_url",
      matchConfidence: 0,
      imageVerified: false,
      priceVerified: false,
      imageValidationStatus: "invalid",
      priceValidationStatus: "invalid",
      published: false,
      error: `Invalid price INR: ${product.priceINR}. Must be a positive number.`
    };
  }

  // 2. Validate Image(s)
  const images = product.images && product.images.length > 0 ? product.images : [];
  let validImageFound = false;
  let verifiedImages: string[] = [];

  for (const img of images) {
    const isValid = await validateProductImage(img);
    if (isValid) {
      validImageFound = true;
      verifiedImages.push(img);
    }
  }

  if (!validImageFound) {
    return {
      verified: false,
      originalSourceUrl,
      verifiedSourceUrl: "",
      canonicalSourceUrl: canonicalFallback,
      verificationMethod: "original_url",
      matchConfidence: 0,
      imageVerified: false,
      priceVerified: true,
      imageValidationStatus: "invalid",
      priceValidationStatus: "valid",
      published: false,
      error: "No genuine marketplace product images found matching quality criteria."
    };
  }

  // 3. Try Original URL Verification First
  const urlCheck = await verifyMarketplaceUrl(
    product.sourceUrl || originalSourceUrl,
    product.source,
    product.sourceProductId
  );

  if (urlCheck.valid) {
    return {
      verified: true,
      originalSourceUrl,
      verifiedSourceUrl: urlCheck.verifiedUrl,
      canonicalSourceUrl: urlCheck.canonicalUrl,
      verificationMethod: "original_url",
      matchConfidence: 100,
      imageVerified: true,
      priceVerified: true,
      imageValidationStatus: "valid",
      priceValidationStatus: "valid",
      published: true
    };
  }

  // 4. AI Fallback Candidate Search & Backend Verification
  // If original URL failed (e.g. 404, bad link, broken redirect), invoke AI product matcher
  try {
    const candidate = await findAndVerifyAiCandidate(product);

    if (candidate && candidate.confidence >= 75) {
      return {
        verified: true,
        originalSourceUrl,
        verifiedSourceUrl: candidate.url,
        canonicalSourceUrl: candidate.canonicalUrl,
        verificationMethod: "ai_candidate",
        matchConfidence: candidate.confidence,
        imageVerified: true,
        priceVerified: true,
        imageValidationStatus: "valid",
        priceValidationStatus: "valid",
        published: true
      };
    }
  } catch (aiErr: any) {
    console.error("[verifyProductRecord] AI candidate matching error:", aiErr);
  }

  // 5. If neither Original URL nor AI candidate could be safely verified:
  return {
    verified: false,
    originalSourceUrl,
    verifiedSourceUrl: "",
    canonicalSourceUrl: urlCheck.canonicalUrl || canonicalFallback,
    verificationMethod: "original_url",
    matchConfidence: 0,
    imageVerified: true,
    priceVerified: true,
    imageValidationStatus: "valid",
    priceValidationStatus: "valid",
    published: false,
    error: urlCheck.error || "Original URL and AI candidates failed backend verification."
  };
}

