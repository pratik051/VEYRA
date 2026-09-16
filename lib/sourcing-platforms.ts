/**
 * SAJILOMARTS Sourcing Platform Registry — SERVER ONLY
 *
 * This file must NEVER be imported by any client component.
 * The INDIA_SOURCE_PIN environment variable is accessed only within
 * server-side API routes. It is never exposed to the browser.
 */

export type VerificationMethod = "structural" | "manual";

export interface SourcingPlatform {
  id: string;
  name: string;
  displayName: string;
  domains: string[];
  /** Regex patterns that valid product URLs must match */
  productUrlPatterns: RegExp[];
  enabled: boolean;
  verificationMethod: VerificationMethod;
  manualVerificationAllowed: boolean;
}

/**
 * Strict SSRF allowlist of approved platform domains.
 * Requests to any domain not in this list are rejected before any
 * network call is made.
 */
export const APPROVED_DOMAINS = new Set([
  "amazon.in",
  "www.amazon.in",
  "amzn.in",
  "www.amzn.in",
  "amzn.to",
  "www.amzn.to",
  "amazon.com",
  "www.amazon.com",
  "flipkart.com",
  "www.flipkart.com",
  "dl.flipkart.com",
  "fkrt.it",
  "myntra.com",
  "www.myntra.com",
  "ajio.com",
  "www.ajio.com",
  "meesho.com",
  "www.meesho.com",
  "nykaa.com",
  "www.nykaa.com",
  "nykaa.ly",
  "tatacliq.com",
  "www.tatacliq.com",
  "croma.com",
  "www.croma.com",
  "boat-lifestyle.com",
  "www.boat-lifestyle.com",
  "gonoise.com",
  "www.gonoise.com",
  "bigbasket.com",
  "www.bigbasket.com",
  "reliancedigital.in",
  "www.reliancedigital.in"
]);

/** Map from domain root → provider ID used in MarketplaceProduct.source */
export const DOMAIN_TO_SOURCE_ID: Record<string, string> = {
  "amazon.in": "amazon-india",
  "amzn.in": "amazon-india",
  "amzn.to": "amazon-india",
  "amazon.com": "amazon-india",
  "flipkart.com": "flipkart",
  "dl.flipkart.com": "flipkart",
  "fkrt.it": "flipkart",
  "myntra.com": "myntra",
  "ajio.com": "ajio",
  "meesho.com": "meesho",
  "nykaa.com": "nykaa",
  "nykaa.ly": "nykaa",
  "tatacliq.com": "tatacliq",
  "croma.com": "croma",
  "boat-lifestyle.com": "boat",
  "gonoise.com": "noise",
  "bigbasket.com": "bigbasket",
  "reliancedigital.in": "reliance-digital"
};

/** Human-readable marketplace display names */
export const SOURCE_DISPLAY_NAMES: Record<string, string> = {
  "amazon-india": "Amazon India",
  "amazon": "Amazon India",
  "flipkart": "Flipkart",
  "myntra": "Myntra",
  "ajio": "AJIO",
  "meesho": "Meesho",
  "nykaa": "Nykaa",
  "tatacliq": "Tata CLiQ",
  "croma": "Croma",
  "boat": "boAt Lifestyle",
  "noise": "Noise India",
  "bigbasket": "BigBasket",
  "reliance-digital": "Reliance Digital"
};

/**
 * Returns true if the URL belongs to an approved Indian marketplace.
 * Used by order create API and verify-product-link API.
 */
export function isValidMarketplaceUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return APPROVED_DOMAINS.has(hostname) || APPROVED_DOMAINS.has(`www.${hostname}`);
  } catch {
    return false;
  }
}

/**
 * Returns the source ID for a given URL (e.g. "amazon-india"), or null if not supported.
 */
export function getSourceIdFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return DOMAIN_TO_SOURCE_ID[hostname] ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns a human-readable marketplace name for a sourceId.
 */
export function getMarketplaceDisplayName(sourceId: string): string {
  return SOURCE_DISPLAY_NAMES[sourceId] ?? "Indian Marketplace";
}

/**
 * Complete platform registry with robust URL pattern matching.
 */
export const SOURCING_PLATFORMS: SourcingPlatform[] = [
  {
    id: "amazon-india",
    name: "Amazon India",
    displayName: "Amazon India",
    domains: ["amazon.in", "www.amazon.in", "amzn.in", "www.amzn.in", "amzn.to", "amazon.com", "www.amazon.com"],
    productUrlPatterns: [
      /amazon\.in\/.*dp\/[A-Z0-9]{10}/i,
      /amazon\.in\/(dp|d|gp\/product|product)\/[A-Z0-9]+/i,
      /amazon\.in\/[a-zA-Z0-9-_%]+\/dp\/[A-Z0-9]+/i,
      /amazon\.in\/(gp\/product|gp\/aw\/d)\/[A-Z0-9]+/i,
      /amzn\.in\/[a-zA-Z0-9/?\-=&%+.]+/i,
      /amzn\.to\/[a-zA-Z0-9/?\-=&%+.]+/i,
      /amazon\.in\/.+/i,
      /amzn\.in\/.+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "flipkart",
    name: "Flipkart",
    displayName: "Flipkart",
    domains: ["flipkart.com", "www.flipkart.com", "dl.flipkart.com", "fkrt.it"],
    productUrlPatterns: [
      /flipkart\.com\/[a-z0-9-]+\/p\//i,
      /flipkart\.com\/.*pid=[A-Z0-9]+/i,
      /flipkart\.com\/p\//i,
      /dl\.flipkart\.com\//i,
      /fkrt\.it\//i,
      /flipkart\.com\/.+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "myntra",
    name: "Myntra",
    displayName: "Myntra",
    domains: ["myntra.com", "www.myntra.com"],
    productUrlPatterns: [
      /myntra\.com\/[a-z0-9-]+\/[a-z0-9-]+\/[0-9]+/i,
      /myntra\.com\/[a-z0-9-]+\/[0-9]+/i,
      /myntra\.com\/[0-9]+/i,
      /myntra\.com\/buy\//i,
      /myntra\.com\/.+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "meesho",
    name: "Meesho",
    displayName: "Meesho",
    domains: ["meesho.com", "www.meesho.com"],
    productUrlPatterns: [
      /meesho\.com\/[a-z0-9-]+\/p\/[a-z0-9]+/i,
      /meesho\.com\/s\/p\/[a-z0-9]+/i,
      /meesho\.com\/p\/[a-z0-9]+/i,
      /meesho\.com\/.+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "nykaa",
    name: "Nykaa",
    displayName: "Nykaa",
    domains: ["nykaa.com", "www.nykaa.com", "nykaa.ly"],
    productUrlPatterns: [
      /nykaa\.com\/[a-z0-9-]+\/p\/[0-9]+/i,
      /nykaa\.com\/.*productId=[0-9]+/i,
      /nykaa\.com\/.*root=product/i,
      /nykaa\.com\/[a-z0-9-]+\/p\//i,
      /nykaa\.ly\/.+/i,
      /nykaa\.com\/.+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "ajio",
    name: "AJIO",
    displayName: "AJIO",
    domains: ["ajio.com", "www.ajio.com"],
    productUrlPatterns: [
      /ajio\.com\/[a-z0-9-]+\/p\/[A-Z0-9]+/i,
      /ajio\.com\/.*\/p\/[A-Z0-9]+/i,
      /ajio\.com\/.+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "tatacliq",
    name: "Tata CLiQ",
    displayName: "Tata CLiQ",
    domains: ["tatacliq.com", "www.tatacliq.com"],
    productUrlPatterns: [
      /tatacliq\.com\/[a-z0-9-]+\/p-[a-z0-9]+/i,
      /tatacliq\.com\/.*\/p-[a-z0-9]+/i,
      /tatacliq\.com\/p-[a-z0-9]+/i,
      /tatacliq\.com\/.+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "croma",
    name: "Croma",
    displayName: "Croma",
    domains: ["croma.com", "www.croma.com"],
    productUrlPatterns: [
      /croma\.com\/[a-z0-9-]+\/p\/[0-9]+/i,
      /croma\.com\/p\/[0-9]+/i,
      /croma\.com\/.+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "boat",
    name: "boAt Lifestyle",
    displayName: "boAt Lifestyle",
    domains: ["boat-lifestyle.com", "www.boat-lifestyle.com"],
    productUrlPatterns: [
      /boat-lifestyle\.com\/products\/[a-z0-9-]+/i,
      /boat-lifestyle\.com\/.+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "noise",
    name: "Noise India",
    displayName: "Noise",
    domains: ["gonoise.com", "www.gonoise.com"],
    productUrlPatterns: [
      /gonoise\.com\/products\/[a-z0-9-]+/i,
      /gonoise\.com\/.+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "bigbasket",
    name: "BigBasket",
    displayName: "BigBasket",
    domains: ["bigbasket.com", "www.bigbasket.com"],
    productUrlPatterns: [
      /bigbasket\.com\/pd\/[0-9]+\//i,
      /bigbasket\.com\/[a-z0-9-]+\/[0-9]+\//i,
      /bigbasket\.com\/.+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  }
];

/**
 * Look up a platform by its domain. Returns null if not found or disabled.
 */
export function getPlatformByDomain(hostname: string): SourcingPlatform | null {
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  return (
    SOURCING_PLATFORMS.find(
      (p) =>
        p.enabled &&
        p.domains.some((d) => d.replace(/^www\./, "") === normalized)
    ) ?? null
  );
}

/**
 * Validates whether a URL matches the expected product page pattern
 * for its detected platform.
 */
export function isValidProductUrl(url: string, platform: SourcingPlatform): boolean {
  return platform.productUrlPatterns.some((pattern) => pattern.test(url));
}
