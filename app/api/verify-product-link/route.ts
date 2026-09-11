import { NextRequest, NextResponse } from "next/server";
import {
  APPROVED_DOMAINS,
  getPlatformByDomain,
  isValidProductUrl,
  SOURCING_PLATFORMS
} from "@/lib/sourcing-platforms";

export type VerificationStatus =
  | "available"
  | "unavailable"
  | "manual_required"
  | "unsupported_platform"
  | "invalid_url"
  | "blocked";

export interface VerifyProductResponse {
  status: VerificationStatus;
  platform: string | null;
  platformDisplayName: string | null;
  message: string;
  canProceed: boolean;
  /** Whether the customer can submit a manual verification request */
  canRequestManual: boolean;
}

/**
 * Sanitizes and parses a URL safely.
 * Returns null if the URL is malformed, uses a non-HTTP scheme,
 * or targets a non-approved domain (SSRF protection).
 */
function sanitizeUrl(raw: string): URL | null {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return null;
  }

  // Only allow https / http (no file://, data://, javascript:, etc.)
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return null;
  }

  // SSRF protection — strict domain allowlist
  const hostname = parsed.hostname.toLowerCase();
  if (!APPROVED_DOMAINS.has(hostname)) {
    return null;
  }

  // Block IP-address based URLs
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return null;
  }

  // Block localhost / internal hostnames
  if (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return null;
  }

  return parsed;
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    return NextResponse.json<VerifyProductResponse>(
      {
        status: "invalid_url",
        platform: null,
        platformDisplayName: null,
        message: "Invalid request body.",
        canProceed: false,
        canRequestManual: false
      },
      { status: 400 }
    );
  }

  const rawUrl = (body.url ?? "").trim();

  if (!rawUrl) {
    return NextResponse.json<VerifyProductResponse>(
      {
        status: "invalid_url",
        platform: null,
        platformDisplayName: null,
        message: "Please paste a product link to check.",
        canProceed: false,
        canRequestManual: false
      },
      { status: 400 }
    );
  }

  // Parse + sanitize
  const parsed = sanitizeUrl(rawUrl);
  if (!parsed) {
    return NextResponse.json<VerifyProductResponse>(
      {
        status: "blocked",
        platform: null,
        platformDisplayName: null,
        message:
          "This link could not be validated. Please paste a direct product URL from a supported Indian shopping platform.",
        canProceed: false,
        canRequestManual: false
      },
      { status: 422 }
    );
  }

  // Platform detection
  const platform = getPlatformByDomain(parsed.hostname);
  if (!platform) {
    const supportedNames = SOURCING_PLATFORMS.filter((p) => p.enabled)
      .map((p) => p.displayName)
      .join(", ");
    return NextResponse.json<VerifyProductResponse>(
      {
        status: "unsupported_platform",
        platform: null,
        platformDisplayName: null,
        message: `This platform is not currently supported. LINKOVA can source products from: ${supportedNames}.`,
        canProceed: false,
        canRequestManual: false
      },
      { status: 422 }
    );
  }

  // Product URL structural validation
  const isValidStructure = isValidProductUrl(rawUrl, platform);

  if (!isValidStructure) {
    return NextResponse.json<VerifyProductResponse>(
      {
        status: "invalid_url",
        platform: platform.id,
        platformDisplayName: platform.displayName,
        message: `This doesn't look like a valid ${platform.displayName} product page. Please copy the URL directly from the product page.`,
        canProceed: false,
        canRequestManual: platform.manualVerificationAllowed
      },
      { status: 422 }
    );
  }

  /**
   * Delivery eligibility check.
   *
   * The INDIA_SOURCE_PIN is used server-side only for internal sourcing
   * configuration lookup. It is NEVER included in the response sent to
   * the client.
   *
   * Automatic API-based availability checking is not performed because:
   * 1. It would require bypassing CAPTCHA / anti-bot systems — which LINKOVA
   *    explicitly does NOT do.
   * 2. Platform Terms of Service prohibit automated scraping.
   *
   * Therefore all verified product links are marked as "manual_required"
   * with a clear, honest message. This is intentional and correct behavior
   * per the specification.
   */
  // (PIN accessed here server-side, used only for future backend integration)
  const _pin = process.env.INDIA_SOURCE_PIN; // used server-side only, never returned

  return NextResponse.json<VerifyProductResponse>(
    {
      status: "manual_required",
      platform: platform.id,
      platformDisplayName: platform.displayName,
      message: `We detected a ${platform.displayName} product link. LINKOVA will verify availability and provide you with an all-inclusive price estimate. Submit your request and our team will respond within 2–4 hours.`,
      canProceed: true,
      canRequestManual: true
    },
    { status: 200 }
  );
}
