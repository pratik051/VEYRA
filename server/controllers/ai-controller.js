import { fetchMarketplaceProduct, detectMarketplace } from "../services/marketplace-scraper.js";

export async function verifyProductLink(req, res) {
  try {
    const { url } = req.body || {};
    const rawUrl = (url || "").trim();

    if (!rawUrl) {
      return res.status(400).json({
        success: false,
        status: "invalid_url",
        platform: null,
        message: "Please paste a product link to check.",
        canProceed: false,
        canRequestManual: false
      });
    }

    const isHttp = rawUrl.startsWith("http://") || rawUrl.startsWith("https://");
    if (!isHttp) {
      return res.status(400).json({
        success: false,
        status: "invalid_url",
        platform: null,
        message: "URL must begin with http:// or https://",
        canProceed: false,
        canRequestManual: false
      });
    }

    const result = await fetchMarketplaceProduct(rawUrl);
    return res.json({
      status: result.verified ? "available" : "manual_input_needed",
      platform: result.platform,
      platformDisplayName: result.platform,
      canProceed: true,
      canRequestManual: true,
      ...result
    });
  } catch (error) {
    const platform = detectMarketplace(req.body?.url || "");
    return res.status(200).json({
      success: false,
      status: "manual_input_needed",
      platform: platform.name,
      platformDisplayName: platform.name,
      message: "Could not automatically extract price from this link. Please enter the INR amount manually.",
      canProceed: true,
      canRequestManual: true
    });
  }
}

export async function fetchMarketplaceLink(req, res) {
  return verifyProductLink(req, res);
}

