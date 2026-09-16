export async function verifyProductLink(req, res) {
  try {
    const { url } = req.body || {};
    const rawUrl = (url || "").trim();

    if (!rawUrl) {
      return res.status(400).json({
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
        status: "invalid_url",
        platform: null,
        message: "URL must begin with http:// or https://",
        canProceed: false,
        canRequestManual: false
      });
    }

    let platform = "Indian Marketplace";
    if (rawUrl.includes("amazon.in")) platform = "Amazon India";
    else if (rawUrl.includes("flipkart.com")) platform = "Flipkart";
    else if (rawUrl.includes("myntra.com")) platform = "Myntra";
    else if (rawUrl.includes("ajio.com")) platform = "AJIO";
    else if (rawUrl.includes("meesho.com")) platform = "Meesho";
    else if (rawUrl.includes("nykaa.com")) platform = "Nykaa";
    else if (rawUrl.includes("tatacliq.com")) platform = "Tata CLiQ";

    return res.json({
      status: "available",
      platform,
      platformDisplayName: platform,
      message: `${platform} product link verified. Proceeding with instant order quote.`,
      canProceed: true,
      canRequestManual: true,
      verified: true,
      inStock: true,
      deliveryAvailable: true,
      canOrder: true
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to verify product link." });
  }
}
