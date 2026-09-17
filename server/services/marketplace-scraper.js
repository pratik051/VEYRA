import { calculateOrderPrice } from "../utils/pricing.js";
import { GoogleGenAI } from "@google/genai";

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

// Extract product metadata via HTML tags, OpenGraph, JSON-LD, and regex
async function extractFromHtml(html, platform) {
  let title = "";
  let image = "";
  let price = null;
  let inStock = true;

  // 1. OpenGraph Meta Tags
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i);
  if (ogTitleMatch) title = ogTitleMatch[1].trim();

  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (ogImageMatch) image = ogImageMatch[1].trim();

  const ogPriceMatch = html.match(/<meta[^>]+property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i);
  if (ogPriceMatch) price = parseCleanPrice(ogPriceMatch[1]);

  // 2. JSON-LD Structured Data
  const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const block of jsonLdMatches) {
      try {
        const jsonContent = block.replace(/<\/?script[^>]*>/gi, "").trim();
        const parsed = JSON.parse(jsonContent);
        const product = Array.isArray(parsed) ? parsed.find((p) => p["@type"] === "Product") : (parsed["@type"] === "Product" ? parsed : null);

        if (product) {
          if (!title && product.name) title = product.name;
          if (!image && product.image) {
            image = Array.isArray(product.image) ? product.image[0] : (typeof product.image === "string" ? product.image : product.image.url || "");
          }
          if (product.offers) {
            const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
            if (offer.price) price = parseCleanPrice(offer.price);
            if (offer.availability && offer.availability.includes("OutOfStock")) inStock = false;
          }
        }
      } catch {
        // Continue searching blocks
      }
    }
  }

  // 3. Platform-specific regex patterns
  if (!price) {
    if (platform.shortName === "Amazon") {
      const amazonPriceMatch = html.match(/class=["']a-price-whole["'][^>]*>([0-9,]+)/i) ||
        html.match(/id=["']priceblock_ourprice["'][^>]*>₹?\s*([0-9,.]+)/i) ||
        html.match(/id=["']priceblock_dealprice["'][^>]*>₹?\s*([0-9,.]+)/i) ||
        html.match(/"priceAmount":\s*([0-9.]+)/i);
      if (amazonPriceMatch) price = parseCleanPrice(amazonPriceMatch[1]);
    } else if (platform.shortName === "Flipkart") {
      const flipkartMatch = html.match(/class=["'][^"']*_30jeq3[^"']*["'][^>]*>₹?\s*([0-9,]+)/i) ||
        html.match(/"price":\s*([0-9]+)/i);
      if (flipkartMatch) price = parseCleanPrice(flipkartMatch[1]);
    } else if (platform.shortName === "Myntra") {
      const myntraMatch = html.match(/class=["']pdp-price["'][^>]*><strong>₹?\s*([0-9,]+)/i) ||
        html.match(/"discountedPrice":\s*([0-9]+)/i) ||
        html.match(/"price":\s*([0-9]+)/i);
      if (myntraMatch) price = parseCleanPrice(myntraMatch[1]);
    } else if (platform.shortName === "Meesho") {
      const meeshoMatch = html.match(/"special_price":\s*([0-9.]+)/i) ||
        html.match(/"price":\s*([0-9.]+)/i) ||
        html.match(/₹\s*([0-9,]+)/i);
      if (meeshoMatch) price = parseCleanPrice(meeshoMatch[1]);
    } else {
      const genericMatch = html.match(/₹\s*([0-9,]+(\.[0-9]{1,2})?)/i) ||
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
        .replace(/-?\s*(Amazon\.in|Flipkart|Myntra|AJIO|Meesho|Nykaa).*$/i, "")
        .trim();
    }
  }

  return { title, image, price, inStock };
}

// AI fallback via Google Gemini if HTML is bot-blocked or dynamic
async function extractViaGemini(url, platform, rawHtmlSnippet = "") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "<YOUR_GEMINI_API_KEY>") {
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyze this Indian e-commerce product URL from ${platform.name}:
URL: ${url}
Snippet: ${rawHtmlSnippet.slice(0, 3000)}

Extract the product information accurately. Return ONLY a valid JSON object with these keys:
{
  "title": "Clean product title",
  "priceINR": 1499,
  "imageUrl": "https://...",
  "inStock": true
}
Do not return markdown or explanation. If the exact price is not discernable, return "priceINR": null.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    const responseText = response.text || "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const price = parseCleanPrice(parsed.priceINR);
      if (price && price > 0) {
        return {
          title: parsed.title || "",
          image: parsed.imageUrl || "",
          price,
          inStock: parsed.inStock !== false
        };
      }
    }
  } catch (err) {
    console.warn("[Gemini Price Extraction Warning]:", err.message);
  }
  return null;
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

  // If price not found or blocked, try Gemini AI extraction
  if (!extracted || !extracted.price) {
    const aiResult = await extractViaGemini(cleanUrl, platform, html);
    if (aiResult && aiResult.price) {
      extracted = {
        title: extracted?.title || aiResult.title,
        image: extracted?.image || aiResult.image,
        price: aiResult.price,
        inStock: aiResult.inStock
      };
    }
  }

  // Validate extracted price
  if (!extracted || !extracted.price || isNaN(extracted.price) || extracted.price <= 0) {
    return {
      success: false,
      verified: false,
      platform: platform.name,
      platformShort: platform.shortName,
      productName: extracted?.title || "",
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
