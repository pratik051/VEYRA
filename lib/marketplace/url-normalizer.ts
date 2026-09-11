import { getSourceIdFromUrl } from "../sourcing-platforms";
import { extractProductIdFromUrlOrText } from "./ai-product-matcher";
import { buildCanonicalProductUrl } from "./verification";

/**
 * Tracking query parameters to strip during canonical URL normalization
 */
const TRACKING_QUERY_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "shared",
  "ref",
  "ref_",
  "tag",
  "gclid",
  "fbclid",
  "igshid",
  "pf_rd_r",
  "pf_rd_m",
  "pf_rd_p",
  "pf_rd_s",
  "pf_rd_t",
  "pf_rd_i",
  "_encoding",
  "pd_rd_r",
  "pd_rd_w",
  "pd_rd_wg",
  "sr",
  "qid",
  "sprefix",
  "crid",
  "keywords",
  "linkCode",
  "camp",
  "creative",
  "source",
  "dchild"
]);

export interface NormalizedUrlResult {
  originalSourceUrl: string;
  normalizedSourceUrl: string;
  canonicalSourceUrl: string;
  marketplace: string;
  sourceProductId: string;
  isValid: boolean;
}

/**
 * Normalizes marketplace URLs:
 * - Preserves the original URL intact.
 * - Strips all analytics/tracking/UTM parameters.
 * - Resolves special marketplace paths such as `/buy` on Myntra.
 * - Extracts marketplace-specific product ID.
 * - Generates clean normalized and canonical URLs.
 */
export function normalizeProductUrl(rawUrl: string): NormalizedUrlResult {
  const originalSourceUrl = (rawUrl || "").trim();
  if (!originalSourceUrl) {
    return {
      originalSourceUrl: "",
      normalizedSourceUrl: "",
      canonicalSourceUrl: "",
      marketplace: "unknown",
      sourceProductId: "",
      isValid: false
    };
  }

  try {
    const parsed = new URL(originalSourceUrl);
    const marketplace = getSourceIdFromUrl(originalSourceUrl) || "unknown";

    // 1. Remove all tracking search parameters
    const keysToDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      const lower = key.toLowerCase();
      if (
        TRACKING_QUERY_PARAMS.has(lower) ||
        lower.startsWith("utm_") ||
        lower.startsWith("pf_rd_") ||
        lower.startsWith("pd_rd_")
      ) {
        keysToDelete.push(key);
      }
    });
    for (const k of keysToDelete) {
      parsed.searchParams.delete(k);
    }

    // 2. Marketplace-specific path normalization
    let normalizedPath = parsed.pathname;

    // Myntra: Handle /buy suffix
    // e.g. /tshirts/hrx-by-hrithik-roshan/12187850/buy -> /tshirts/hrx-by-hrithik-roshan/12187850
    // or /12187850/buy -> /12187850
    if (marketplace === "myntra") {
      normalizedPath = normalizedPath.replace(/\/buy\/?$/i, "");
    }

    // Amazon: Strip trailing ref/query segments from path
    if (marketplace === "amazon-india" || marketplace === "amazon") {
      normalizedPath = normalizedPath.replace(/\/ref=[^/]+$/i, "");
    }

    parsed.pathname = normalizedPath;
    const normalizedSourceUrl = parsed.toString().replace(/\/$/, "");

    // 3. Extract Strongest Product Identity
    const sourceProductId = extractProductIdFromUrlOrText(normalizedSourceUrl, marketplace) ||
      extractProductIdFromUrlOrText(originalSourceUrl, marketplace) || "";

    // 4. Build Canonical Marketplace URL
    const canonicalSourceUrl = buildCanonicalProductUrl(marketplace, sourceProductId, normalizedSourceUrl);

    return {
      originalSourceUrl,
      normalizedSourceUrl,
      canonicalSourceUrl,
      marketplace,
      sourceProductId,
      isValid: true
    };
  } catch {
    return {
      originalSourceUrl,
      normalizedSourceUrl: originalSourceUrl,
      canonicalSourceUrl: originalSourceUrl,
      marketplace: "unknown",
      sourceProductId: "",
      isValid: false
    };
  }
}
