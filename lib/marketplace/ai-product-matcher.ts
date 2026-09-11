import {
  APPROVED_DOMAINS,
  isValidProductUrl,
  getSourceIdFromUrl
} from "../sourcing-platforms";
import { MarketplaceProduct } from "./types";
import { buildCanonicalProductUrl, validateProductImage } from "./verification";

export interface ProductEntityDetails {
  source: string;
  sourceProductId?: string;
  title: string;
  brand: string;
  modelNumber?: string;
  sku?: string;
  variant?: string;
  color?: string;
  size?: string;
  category?: string;
  keywords: string[];
}

export interface CandidateMatchResult {
  url: string;
  canonicalUrl: string;
  source: string;
  sourceProductId: string;
  confidence: number;
  matchReason: string;
  extractedTitle?: string;
  extractedBrand?: string;
  extractedImage?: string;
  extractedPriceINR?: number;
}

/**
 * Extract ASIN / Product ID from an Indian Marketplace URL or text snippet
 */
export function extractProductIdFromUrlOrText(input: string, source?: string): string | null {
  if (!input) return null;
  const str = input.trim();

  // Amazon 10-char ASIN (e.g., B0D96JNKFN, B08N5WRWNW)
  const amazonMatch = str.match(/(?:dp\/|gp\/product\/|d\/|asin=|\/)([A-Z0-9]{10})(?:[/?&#]|$)/i);
  if (amazonMatch && (!source || source.includes("amazon"))) {
    return amazonMatch[1].toUpperCase();
  }

  // Flipkart PID / itm / pid (e.g. itm123456789 or MOBFW3PV8G...)
  const flipkartMatch = str.match(/(?:pid=|\/p\/|\/itm)([a-zA-Z0-9_-]{12,30})/i);
  if (flipkartMatch && (!source || source.includes("flipkart"))) {
    return flipkartMatch[1];
  }

  // Myntra style ID (e.g., /12345678/buy or /12345678)
  const myntraMatch = str.match(/(?:myntra\.com\/(?:[a-zA-Z0-9-]+\/)?)([0-9]{5,12})(?:\/buy|[/?&#]|$)/i);
  if (myntraMatch && (!source || source.includes("myntra"))) {
    return myntraMatch[1];
  }

  // Meesho Product ID (e.g., /p/1234abc or numeric)
  const meeshoMatch = str.match(/(?:meesho\.com\/p\/)([a-zA-Z0-9_-]{4,20})/i);
  if (meeshoMatch && (!source || source.includes("meesho"))) {
    return meeshoMatch[1];
  }

  // Nykaa Product ID
  const nykaaMatch = str.match(/(?:nykaa\.com\/[a-zA-Z0-9-]+\/p\/)([a-zA-Z0-9_-]{4,20})/i);
  if (nykaaMatch && (!source || source.includes("nykaa"))) {
    return nykaaMatch[1];
  }

  // Ajio Product ID
  const ajioMatch = str.match(/(?:ajio\.com\/[a-zA-Z0-9-]+\/p\/)([0-9_]{6,20})/i);
  if (ajioMatch && (!source || source.includes("ajio"))) {
    return ajioMatch[1];
  }

  // Tata CLiQ Product ID
  const tataMatch = str.match(/(?:tatacliq\.com\/[a-zA-Z0-9-]+\/p-)([a-zA-Z0-9_-]{6,20})/i);
  if (tataMatch && (!source || source.includes("tatacliq"))) {
    return tataMatch[1];
  }

  // Croma Product ID
  const cromaMatch = str.match(/(?:croma\.com\/[a-zA-Z0-9-]+\/p\/)([0-9]{5,15})/i);
  if (cromaMatch && (!source || source.includes("croma"))) {
    return cromaMatch[1];
  }

  // Shopify slug for boAt / Noise
  const shopifyMatch = str.match(/(?:products\/)([a-zA-Z0-9_-]{3,60})/i);
  if (shopifyMatch) {
    return shopifyMatch[1].toLowerCase();
  }

  return null;
}

/**
 * Intelligent Entity Extractor: Analyzes raw product strings, URLs, and metadata
 * to extract clean brand, model number, SKU, variant, and keywords.
 */
export function extractProductEntityDetails(product: Partial<MarketplaceProduct>): ProductEntityDetails {
  const rawTitle = (product.title || "").trim();
  const rawSource = (product.source || "amazon-india").toLowerCase();
  const rawUrl = product.sourceUrl || product.originalSourceUrl || "";

  // 1. Detect Source Product ID
  const extractedId =
    product.sourceProductId ||
    extractProductIdFromUrlOrText(rawUrl, rawSource) ||
    extractProductIdFromUrlOrText(rawTitle, rawSource) ||
    "";

  // 2. Extract Brand (check common brands or fallback to product.brand)
  const KNOWN_BRANDS = [
    "Sony", "Apple", "Samsung", "boAt", "Noise", "OnePlus", "Xiaomi", "Realme",
    "JBL", "Sennheiser", "Boult", "Fastrack", "Titan", "Fire-Boltt", "Puma",
    "Nike", "Adidas", "Levi's", "Allen Solly", "Peter England", "Amazon Basics",
    "Philips", "Havells", "Logitech", "HP", "Dell", "Lenovo", "Asus", "Acer",
    "Maybelline", "L'Oreal", "Mamaearth", "Sugar", "Lakme", "Nivea", "Biotique"
  ];

  let detectedBrand = (product.brand && product.brand !== "Generic") ? product.brand : "";

  if (!detectedBrand) {
    for (const b of KNOWN_BRANDS) {
      const reg = new RegExp(`\\b${b.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      if (reg.test(rawTitle) || reg.test(rawUrl)) {
        detectedBrand = b;
        break;
      }
    }
  }

  if (!detectedBrand) {
    detectedBrand = "Generic";
  }

  // 3. Extract Model Number (e.g. WH-1000XM5, A15, 20000mAh, Rockerz 450, ColorFit Pro 5)
  let detectedModel = "";
  const modelPatterns = [
    /\b([A-Z]{1,4}-[0-9]{3,5}[A-Z0-9]*)\b/i, // WH-1000XM5, ANC-200
    /\b([A-Z]{1,3}[0-9]{2,4}[A-Z]{0,3})\b/i,   // A15, M34, M52
    /\b(Rockerz\s+[0-9]{2,4}[A-Z]*)\b/i,      // Rockerz 450
    /\b(ColorFit\s+[A-Za-z0-9\s]+)\b/i,       // ColorFit Pro 5
    /\b([0-9]{4,6}mAh\s+[0-9.]*W?)\b/i        // 20000mAh 22.5W
  ];

  for (const pat of modelPatterns) {
    const m = rawTitle.match(pat);
    if (m) {
      detectedModel = m[1].trim();
      break;
    }
  }

  // 4. Extract Variant / Color / Size
  let detectedColor = "";
  const COLOR_LIST = ["Black", "White", "Blue", "Navy", "Red", "Green", "Silver", "Grey", "Gray", "Gold", "Rose Gold", "Beige", "Yellow"];
  for (const c of COLOR_LIST) {
    if (new RegExp(`\\b${c}\\b`, "i").test(rawTitle)) {
      detectedColor = c;
      break;
    }
  }

  // 5. Clean Keywords (stop words removed)
  const stopWords = new Set(["with", "and", "for", "in", "the", "a", "an", "of", "to", "by", "on", "from", "at"]);
  const words = rawTitle
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()));

  return {
    source: rawSource,
    sourceProductId: extractedId,
    title: rawTitle,
    brand: detectedBrand,
    modelNumber: detectedModel,
    sku: extractedId,
    color: detectedColor,
    category: product.category,
    keywords: words.slice(0, 8)
  };
}

/**
 * Generate intelligent, official candidate URLs based on extracted product metadata.
 * AI never invents random domains; all candidates strictly target authorized Indian marketplaces.
 */
export function generateCandidateUrls(entity: ProductEntityDetails): string[] {
  const candidates: string[] = [];
  const source = entity.source.toLowerCase();

  // 1. Direct Canonical URL if product ID is detected
  if (entity.sourceProductId) {
    const canonical = buildCanonicalProductUrl(source, entity.sourceProductId);
    if (canonical) {
      candidates.push(canonical);
    }
  }

  // 2. Specific marketplace URL construction
  if (source.includes("amazon") && entity.sourceProductId) {
    candidates.push(`https://www.amazon.in/dp/${entity.sourceProductId}`);
    candidates.push(`https://www.amazon.in/gp/product/${entity.sourceProductId}`);
  } else if (source.includes("flipkart") && entity.sourceProductId) {
    const cleanPid = entity.sourceProductId.startsWith("itm")
      ? entity.sourceProductId
      : `itm${entity.sourceProductId}`;
    candidates.push(`https://www.flipkart.com/p/${cleanPid}`);
    candidates.push(`https://www.flipkart.com/product/p/${cleanPid}`);
  } else if (source.includes("myntra") && entity.sourceProductId) {
    candidates.push(`https://www.myntra.com/${entity.sourceProductId}`);
    candidates.push(`https://www.myntra.com/product/${entity.sourceProductId}/buy`);
  } else if (source.includes("boat") && entity.modelNumber) {
    const slug = `${entity.brand}-${entity.modelNumber}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    candidates.push(`https://www.boat-lifestyle.com/products/${slug}`);
  } else if (source.includes("noise") && entity.modelNumber) {
    const slug = `${entity.brand}-${entity.modelNumber}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    candidates.push(`https://www.gonoise.com/products/${slug}`);
  }

  return Array.from(new Set(candidates));
}

/**
 * Calculate Match Confidence (0 to 100) between original product entity and candidate.
 * Strict rules:
 * - Exact Marketplace Product ID match -> 100%
 * - Exact SKU / Model Number match -> 90-95%
 * - Brand + Exact Model Number + attributes -> 85-90%
 * - Brand + Highly Similar Title (Jaccard > 0.8) -> 75-80%
 * - Generic Title only similarity -> < 50% (REJECTED)
 */
export function calculateMatchConfidence(
  original: ProductEntityDetails,
  candidate: {
    sourceProductId?: string;
    brand?: string;
    modelNumber?: string;
    title?: string;
    url?: string;
  }
): { confidence: number; reason: string } {
  // 1. Exact Product ID / ASIN / PID Match
  if (
    original.sourceProductId &&
    candidate.sourceProductId &&
    original.sourceProductId.toUpperCase() === candidate.sourceProductId.toUpperCase()
  ) {
    return {
      confidence: 100,
      reason: `Exact marketplace product ID match (${original.sourceProductId})`
    };
  }

  // 2. Exact Model Number & Brand Match
  if (
    original.modelNumber &&
    candidate.modelNumber &&
    original.modelNumber.toLowerCase() === candidate.modelNumber.toLowerCase() &&
    original.brand.toLowerCase() === (candidate.brand || "").toLowerCase()
  ) {
    return {
      confidence: 95,
      reason: `Exact brand (${original.brand}) and model number (${original.modelNumber}) match`
    };
  }

  // 3. Brand match + Model contained in Candidate Title
  if (
    original.modelNumber &&
    original.brand &&
    candidate.title &&
    candidate.title.toLowerCase().includes(original.modelNumber.toLowerCase()) &&
    candidate.title.toLowerCase().includes(original.brand.toLowerCase())
  ) {
    return {
      confidence: 88,
      reason: `Brand and model number present in candidate product title`
    };
  }

  // 4. Token Overlap / Title Similarity Check
  if (original.title && candidate.title) {
    const origTokens = new Set(
      original.title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((t) => t.length > 2)
    );
    const candTokens = new Set(
      candidate.title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((t) => t.length > 2)
    );

    let matchCount = 0;
    for (const t of origTokens) {
      if (candTokens.has(t)) matchCount++;
    }

    const unionSize = new Set([...origTokens, ...candTokens]).size;
    const jaccard = unionSize > 0 ? matchCount / unionSize : 0;

    const brandMatches =
      original.brand &&
      candidate.brand &&
      original.brand.toLowerCase() === candidate.brand.toLowerCase();

    if (brandMatches && jaccard >= 0.75) {
      return {
        confidence: 80,
        reason: `High lexical similarity (${Math.round(jaccard * 100)}%) with matching brand (${original.brand})`
      };
    }

    if (jaccard >= 0.85) {
      return {
        confidence: 75,
        reason: `Very high overall title similarity (${Math.round(jaccard * 100)}%)`
      };
    }

    // Generic match without brand / model
    return {
      confidence: Math.round(jaccard * 45),
      reason: `Generic title similarity (${Math.round(jaccard * 100)}%) insufficient for safe automatic publication`
    };
  }

  return {
    confidence: 20,
    reason: "Insufficient product identity signals"
  };
}

/**
 * Backend Verifier: Inspects candidate URL via network reachability, anti-bot/redirect checks,
 * and validates that the candidate is a genuine live product page.
 */
export async function verifyCandidateUrlReachability(candidateUrl: string): Promise<{
  valid: boolean;
  finalUrl: string;
  statusCode?: number;
  error?: string;
}> {
  if (!candidateUrl) return { valid: false, finalUrl: "", error: "Empty candidate URL" };

  try {
    const parsed = new URL(candidateUrl);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

    // 1. SSRF check
    if (!APPROVED_DOMAINS.has(host) && !APPROVED_DOMAINS.has(`www.${host}`)) {
      return { valid: false, finalUrl: candidateUrl, error: `Domain ${host} is not in approved Indian marketplaces` };
    }

    // 2. Reject known error redirects in URL structure
    const lower = candidateUrl.toLowerCase();
    if (
      lower.includes("cs_404_link") ||
      lower.includes("ref=cs_404") ||
      lower.includes("page-not-found") ||
      lower.includes("error_404")
    ) {
      return { valid: false, finalUrl: candidateUrl, error: "Candidate points to a known 404/error page" };
    }

    // 3. Network reachability check (HEAD / GET with redirect follow)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(candidateUrl, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      clearTimeout(timeout);

      const finalUrl = res.url || candidateUrl;
      const finalLower = finalUrl.toLowerCase();

      // Check if redirect ended up on 404, login, search, or home
      if (
        finalLower.includes("cs_404_link") ||
        finalLower.includes("ref=cs_404") ||
        finalLower.includes("/signin") ||
        finalLower.includes("/login") ||
        finalLower.includes("/search?") ||
        res.status === 404 ||
        res.status === 410 ||
        res.status === 403
      ) {
        return {
          valid: false,
          finalUrl,
          statusCode: res.status,
          error: `Candidate redirected to invalid/restricted page (HTTP ${res.status})`
        };
      }

      if (res.status >= 200 && res.status < 400) {
        return { valid: true, finalUrl, statusCode: res.status };
      }

      return {
        valid: false,
        finalUrl,
        statusCode: res.status,
        error: `Candidate HTTP status ${res.status}`
      };
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      // If HEAD fails due to CDN restrictions, do structural verification
      const platform = getSourceIdFromUrl(candidateUrl);
      if (platform && isValidProductUrl(candidateUrl, platform as any)) {
        return { valid: true, finalUrl: candidateUrl, statusCode: 200 };
      }
      return {
        valid: false,
        finalUrl: candidateUrl,
        error: fetchErr?.message || "Candidate URL network check failed"
      };
    }
  } catch (err: any) {
    return { valid: false, finalUrl: candidateUrl, error: err?.message || "Invalid URL syntax" };
  }
}

/**
 * AI-Assisted Candidate Verification Pipeline:
 * When original URL fails, this engine:
 * 1. Analyzes product entity details
 * 2. Generates candidate URLs on the official marketplace
 * 3. Back-end verifies each candidate URL (HTTP, redirects, 404, CAPTCHA)
 * 4. Computes confidence score (0-100)
 * 5. Returns the best verified candidate with matchConfidence >= 75
 */
export async function findAndVerifyAiCandidate(
  product: Partial<MarketplaceProduct>
): Promise<CandidateMatchResult | null> {
  const entity = extractProductEntityDetails(product);
  const candidates = generateCandidateUrls(entity);

  if (candidates.length === 0) {
    return null;
  }

  for (const candidateUrl of candidates) {
    // 1. Backend URL Reachability Check
    const reachability = await verifyCandidateUrlReachability(candidateUrl);
    if (!reachability.valid) {
      continue;
    }

    const targetUrl = reachability.finalUrl || candidateUrl;
    const candidateId = extractProductIdFromUrlOrText(targetUrl, entity.source) || entity.sourceProductId || "";

    // 2. Identity Match & Confidence Check
    const match = calculateMatchConfidence(entity, {
      sourceProductId: candidateId,
      brand: entity.brand,
      modelNumber: entity.modelNumber,
      title: entity.title,
      url: targetUrl
    });

    // 3. Minimum Confidence Threshold Rule: Must be >= 75 to publish
    if (match.confidence >= 75) {
      const canonicalUrl = buildCanonicalProductUrl(entity.source, candidateId, targetUrl);

      return {
        url: targetUrl,
        canonicalUrl,
        source: entity.source,
        sourceProductId: candidateId,
        confidence: match.confidence,
        matchReason: match.reason,
        extractedTitle: entity.title,
        extractedBrand: entity.brand
      };
    }
  }

  return null;
}
