import { calculateOrderPrice } from "../utils/pricing.js";

export const MARKETPLACE_DOMAINS = [
  { domain: "amazon.in", name: "Amazon India", shortName: "Amazon" },
  { domain: "flipkart.com", name: "Flipkart", shortName: "Flipkart" },
  { domain: "myntra.com", name: "Myntra", shortName: "Myntra" },
  { domain: "ajio.com", name: "AJIO", shortName: "AJIO" },
  { domain: "meesho.com", name: "Meesho", shortName: "Meesho" },
  { domain: "nykaa.com", name: "Nykaa", shortName: "Nykaa" },
  { domain: "tatacliq.com", name: "Tata CLiQ", shortName: "Tata CLiQ" },
  { domain: "boat-lifestyle.com", name: "boAt Lifestyle", shortName: "boAt" },
  { domain: "gonoise.com", name: "Noise", shortName: "Noise" },
  { domain: "bewakoof.com", name: "Bewakoof", shortName: "Bewakoof" }
];

export function detectMarketplace(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const found = MARKETPLACE_DOMAINS.find((m) => host.includes(m.domain));
    return found || { domain: host, name: "Indian Marketplace", shortName: "Marketplace" };
  } catch {
    return { domain: "indian-marketplace", name: "Indian Marketplace", shortName: "Marketplace" };
  }
}

// Clean and extract positive numeric price from raw strings like "₹ 1,499.00"
function parseCleanPrice(priceStr) {
  if (!priceStr) return null;
  const cleaned = String(priceStr).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return !isNaN(num) && num > 0 ? num : null;
}

// Extract product metadata via HTML tags, OpenGraph, JSON-LD, and deterministic regex
async function extractFromHtml(html, platform) {
  let title = "";
  let brand = null;
  let variant = null;
  let image = "";
  let price = null;
  let inStock = true;

  // 1. OpenGraph & Meta Tags
  const ogTitleMatch =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
  if (ogTitleMatch) title = ogTitleMatch[1].trim();

  const ogBrandMatch =
    html.match(/<meta[^>]+property=["']og:brand["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+property=["']product:brand["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+name=["']brand["'][^>]+content=["']([^"']+)["']/i);
  if (ogBrandMatch && ogBrandMatch[1]?.trim()) brand = ogBrandMatch[1].trim();

  const ogColorMatch =
    html.match(/<meta[^>]+property=["']product:color["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+property=["']og:color["'][^>]+content=["']([^"']+)["']/i);
  const ogSizeMatch =
    html.match(/<meta[^>]+property=["']product:size["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+property=["']og:size["'][^>]+content=["']([^"']+)["']/i);

  if (ogColorMatch && ogSizeMatch) {
    variant = `${ogColorMatch[1].trim()} / ${ogSizeMatch[1].trim()}`;
  } else if (ogColorMatch) {
    variant = ogColorMatch[1].trim();
  } else if (ogSizeMatch) {
    variant = ogSizeMatch[1].trim();
  }

  const ogImageMatch =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (ogImageMatch) image = ogImageMatch[1].trim();

  const ogPriceMatch =
    html.match(/<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i);
  if (ogPriceMatch) price = parseCleanPrice(ogPriceMatch[1]);

  // 2. JSON-LD Structured Data
  const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const block of jsonLdMatches) {
      try {
        const jsonContent = block.replace(/<\/?script[^>]*>/gi, "").trim();
        const parsed = JSON.parse(jsonContent);
        const product = Array.isArray(parsed)
          ? parsed.find((p) => p && p["@type"] === "Product")
          : parsed && parsed["@type"] === "Product"
          ? parsed
          : null;

        if (product) {
          if (!title && product.name) title = product.name;
          if (!brand && product.brand) {
            brand = typeof product.brand === "object" ? product.brand.name || null : String(product.brand);
          }
          if (!variant) {
            if (product.color && product.size) {
              variant = `${product.color} / ${product.size}`;
            } else if (product.color) {
              variant = product.color;
            } else if (product.size) {
              variant = product.size;
            } else if (product.model) {
              variant = product.model;
            }
          }
          if (!image && product.image) {
            image = Array.isArray(product.image)
              ? product.image[0]
              : typeof product.image === "string"
              ? product.image
              : product.image.url || "";
          }
          if (product.offers) {
            const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
            if (offer && offer.price) price = parseCleanPrice(offer.price);
            if (offer && offer.availability && String(offer.availability).includes("OutOfStock")) inStock = false;
          }
        }
      } catch {
        // Continue searching blocks
      }
    }
  }

  // 3. Platform-specific deterministic extraction
  if (platform.shortName === "Amazon") {
    if (!brand) {
      const amazonBrandMatch =
        html.match(/<a[^>]+id=["']bylineInfo["'][^>]*>([^<]+)<\/a>/i) ||
        html.match(/class=["']po-brand["'][^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i);
      if (amazonBrandMatch) {
        brand = amazonBrandMatch[1].replace(/^(Brand:\s*|Visit the\s*|\s*Store)/gi, "").trim();
      }
    }
    if (!price) {
      const amazonPriceMatch =
        html.match(/class=["']a-price-whole["'][^>]*>([0-9,]+)/i) ||
        html.match(/id=["']priceblock_ourprice["'][^>]*>₹?\s*([0-9,.]+)/i) ||
        html.match(/id=["']priceblock_dealprice["'][^>]*>₹?\s*([0-9,.]+)/i) ||
        html.match(/class=["']apexPriceToPay["'][^>]*>[\s\S]*?class=["']a-offscreen["'][^>]*>₹?\s*([0-9,.]+)/i) ||
        html.match(/"priceAmount":\s*([0-9.]+)/i);
      if (amazonPriceMatch) price = parseCleanPrice(amazonPriceMatch[1]);
    }
  } else if (platform.shortName === "Flipkart") {
    if (!brand) {
      const fkBrandMatch =
        html.match(/class=["']G6XhRU["'][^>]*>([^<]+)<\/span>/i) ||
        html.match(/class=["']_2W-m08["'][^>]*>([^<]+)<\/div>/i);
      if (fkBrandMatch) brand = fkBrandMatch[1].trim();
    }
    if (!price) {
      const flipkartMatch =
        html.match(/class=["'][^"']*Nx9bqj[^"']*["'][^>]*>₹?\s*([0-9,]+)/i) ||
        html.match(/class=["'][^"']*_30jeq3[^"']*["'][^>]*>₹?\s*([0-9,]+)/i) ||
        html.match(/"price":\s*([0-9]+)/i);
      if (flipkartMatch) price = parseCleanPrice(flipkartMatch[1]);
    }
  } else if (platform.shortName === "Myntra") {
    if (!brand) {
      const myntraBrandMatch =
        html.match(/class=["']pdp-title["'][^>]*>([^<]+)<\/h1>/i) ||
        html.match(/"brand":\s*"([^"]+)"/i);
      if (myntraBrandMatch) brand = myntraBrandMatch[1].trim();
    }
    if (!price) {
      const myntraMatch =
        html.match(/class=["']pdp-price["'][^>]*><strong>₹?\s*([0-9,]+)/i) ||
        html.match(/"discountedPrice":\s*([0-9]+)/i) ||
        html.match(/"price":\s*([0-9]+)/i);
      if (myntraMatch) price = parseCleanPrice(myntraMatch[1]);
    }
  } else if (platform.shortName === "Meesho") {
    if (!brand) {
      const meeshoBrandMatch = html.match(/"brand_name":\s*"([^"]+)"/i);
      if (meeshoBrandMatch) brand = meeshoBrandMatch[1].trim();
    }
    if (!price) {
      const meeshoMatch =
        html.match(/"special_price":\s*([0-9.]+)/i) ||
        html.match(/"price":\s*([0-9.]+)/i) ||
        html.match(/₹\s*([0-9,]+)/i);
      if (meeshoMatch) price = parseCleanPrice(meeshoMatch[1]);
    }
  } else {
    if (!price) {
      const genericMatch =
        html.match(/₹\s*([0-9,]+(\.[0-9]{1,2})?)/i) ||
        html.match(/INR\s*([0-9,]+)/i) ||
        html.match(/Rs\.?\s*([0-9,]+)/i);
      if (genericMatch) price = parseCleanPrice(genericMatch[1]);
    }
  }

  // Fallback title from <title> tag
  if (!title) {
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleTagMatch) {
      title = titleTagMatch[1]
        .replace(/-?\s*(Amazon\.in|Flipkart|Myntra|AJIO|Meesho|Nykaa|Tata CLiQ|boAt|Noise).*$/i, "")
        .trim();
    }
  }

  return { title, brand, variant, image, price, inStock };
}

export async function fetchMarketplaceProduct(url) {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    throw new Error("Invalid URL format. Link must begin with http:// or https://");
  }

  const platform = detectMarketplace(cleanUrl);
  let html = "";

  try {
    const res = await fetch(cleanUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      html = await res.text();
    }
  } catch (fetchErr) {
    console.warn("[Marketplace Direct Fetch]:", fetchErr.message);
  }

  let extracted = null;
  if (html) {
    extracted = await extractFromHtml(html, platform);
  }

  // Validate extracted price deterministically
  if (!extracted || !extracted.price || isNaN(extracted.price) || extracted.price <= 0) {
    return {
      success: false,
      verified: false,
      platform: platform.name,
      platformShort: platform.shortName,
      productName: extracted?.title || "",
      brand: extracted?.brand || null,
      variant: extracted?.variant || null,
      productImage: extracted?.image || "",
      url: cleanUrl,
      message: "Could not automatically verify original marketplace price from this link. Please enter the INR amount manually below."
    };
  }

  // Calculate distinct SajiloMarts landed pricing
  const pricing = calculateOrderPrice(extracted.price);

  return {
    success: true,
    verified: true,
    platform: platform.name,
    platformShort: platform.shortName,
    productName: extracted.title || `${platform.shortName} Sourced Product`,
    brand: extracted.brand || null,
    variant: extracted.variant || null,
    productImage: extracted.image || "",
    originalPriceINR: pricing.indianPriceINR,
    currency: "INR",
    conversionAmountNPR: pricing.conversionAmount,
    serviceChargeNPR: pricing.serviceCharge,
    deliveryChargeNPR: pricing.deliveryCharge,
    finalAmountNPR: pricing.finalAmount,
    inStock: extracted.inStock !== false,
    url: cleanUrl,
    message: `${platform.name} product link verified. Landed pricing calculated accurately.`
  };
}
