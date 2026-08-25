/**
 * VEYRA Sourcing Platform Registry — SERVER ONLY
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
 * The private sourcing PIN is read from the environment server-side only.
 * It is NEVER included in any API response, log, or client-side variable.
 */
export function getSourcePin(): string {
  const pin = process.env.INDIA_SOURCE_PIN;
  if (!pin) {
    // In production this must be set. During development we fail loudly.
    throw new Error("INDIA_SOURCE_PIN is not configured in environment variables.");
  }
  return pin;
}

/**
 * Strict SSRF allowlist of approved platform domains.
 * Requests to any domain not in this list are rejected before any
 * network call is made.
 */
export const APPROVED_DOMAINS = new Set([
  "amazon.in",
  "www.amazon.in",
  "flipkart.com",
  "www.flipkart.com",
  "myntra.com",
  "www.myntra.com",
  "ajio.com",
  "www.ajio.com",
  "meesho.com",
  "www.meesho.com",
  "nykaa.com",
  "www.nykaa.com",
  "bigbasket.com",
  "www.bigbasket.com",
  "tatacliq.com",
  "www.tatacliq.com",
  "croma.com",
  "www.croma.com",
  "reliancedigital.in",
  "www.reliancedigital.in"
]);

/**
 * Platform registry — modular design so new platforms can be added
 * from the admin dashboard without rewriting the verification logic.
 */
export const SOURCING_PLATFORMS: SourcingPlatform[] = [
  {
    id: "amazon-india",
    name: "Amazon India",
    displayName: "Amazon India",
    domains: ["amazon.in", "www.amazon.in"],
    productUrlPatterns: [
      /amazon\.in\/(dp|gp\/product|s\?k=|d\/)[A-Z0-9/?\-=&%+.]+/i,
      /amazon\.in\/.*\/dp\/[A-Z0-9]{10}/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "flipkart",
    name: "Flipkart",
    displayName: "Flipkart",
    domains: ["flipkart.com", "www.flipkart.com"],
    productUrlPatterns: [
      /flipkart\.com\/[a-z0-9-]+\/p\//i,
      /flipkart\.com\/.*pid=[A-Z0-9]+/i
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
      /myntra\.com\/[a-z0-9-]+\/[a-z0-9-]+\/[0-9]+\/buy/i,
      /myntra\.com\/[a-z0-9-]+\/[a-z0-9-]+\/[0-9]+/i
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
      /ajio\.com\/[a-z0-9-]+\/p\/[A-Z0-9]+/i
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
      /meesho\.com\/[a-z0-9-]+\/p\/[0-9]+/i
    ],
    enabled: true,
    verificationMethod: "manual",
    manualVerificationAllowed: true
  },
  {
    id: "nykaa",
    name: "Nykaa",
    displayName: "Nykaa",
    domains: ["nykaa.com", "www.nykaa.com"],
    productUrlPatterns: [
      /nykaa\.com\/[a-z0-9-]+\/p\/[0-9]+/i,
      /nykaa\.com\/.*productId=[0-9]+/i
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
      /bigbasket\.com\/[a-z0-9-]+\/[0-9]+\//i
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
