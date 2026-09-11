import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const NoiseProvider: MarketplaceProvider = {
  id: "noise",
  name: "Noise",
  displayName: "Noise India",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "noise",
        sourceProductId: "NOISE-COLOR-PRO4",
        sourceUrl: "https://www.gonoise.com/products/colorfit-pro-4-smartwatch",
        title: "Noise ColorFit Pro 4 Advanced 1.72\" TruView 60Hz Bluetooth Calling Smartwatch",
        slug: "noise-colorfit-pro-4-smartwatch",
        description: "Smooth 60Hz refresh rate 1.72\" TruView display with digital crown navigation, Bluetooth calling, and 100 sports modes.",
        images: [
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Noise",
        category: "Watches",
        subcategory: "Smartwatches",
        priceINR: 1999,
        originalPriceINR: 5999,
        discountPercentage: 66,
        rating: 4.6,
        reviewCount: 4280,
        availability: "in_stock",
        isFlashSale: true,
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "Noise Mega Deal",
        isTrending: true,
        trendingScore: 96,
        badges: ["NOISE MEGA DEAL", "#1 BEST SELLER"],
        tags: ["noise", "smartwatch", "fitness", "truview", "gadget"],
        variants: [
          { name: "Color", values: ["Jet Black", "Charcoal Gray", "Teal Green", "Rose Pink"] }
        ],
        specs: {
          "Display": "1.72\" TFT TruView Display (60Hz, 500 nits)",
          "Navigation": "Functional Digital Crown for UI scrolling",
          "Health": "24*7 Heart Rate, SpO2, Sleep Monitor",
          "Water Resistance": "IP68 Water Resistant"
        }
      }
    ];
  }
};
