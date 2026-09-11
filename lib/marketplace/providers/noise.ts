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
      },
      {
        source: "noise",
        sourceProductId: "NOISE-HALO-PLUS",
        sourceUrl: "https://www.gonoise.com/products/noise-colorfit-halo-plus",
        title: "Noise ColorFit Halo Plus 1.46\" AMOLED Metallic Smartwatch with Bluetooth Calling",
        slug: "noise-colorfit-halo-plus-amoled-smartwatch",
        description: "Premium stainless steel strap and bezel with 1.46\" vivid AMOLED Always-On Display (AOD) and TruSync Bluetooth calling.",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Noise",
        category: "Watches",
        subcategory: "Smartwatches",
        priceINR: 3499,
        originalPriceINR: 8999,
        discountPercentage: 61,
        rating: 4.8,
        reviewCount: 2900,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "61% OFF Premium AMOLED",
        isTrending: true,
        trendingScore: 97,
        badges: ["AMOLED AOD", "61% OFF"],
        tags: ["noise", "smartwatch", "amoled", "metallic", "luxury"],
        variants: [
          { name: "Strap", values: ["Elite Silver Steel", "Elite Black Steel", "Vintage Brown Leather"] }
        ],
        specs: {
          "Display": "1.46\" Super AMOLED Always-On Display (466x466px)",
          "Build": "Zinc Alloy Metallic Frame with Stainless Steel Strap",
          "Battery": "Up to 7 Days Battery Life"
        }
      },
      {
        source: "noise",
        sourceProductId: "NOISE-BUDS-VS102",
        sourceUrl: "https://www.gonoise.com/products/noise-buds-vs102-plus",
        title: "Noise Buds VS102 Plus with 70H Playtime, Quad Mic ENC & Instacharge",
        slug: "noise-buds-vs102-plus-tws-earbuds",
        description: "Unique flybird design with 11mm speaker drivers, 70 hours massive playtime, ultra-clear Quad Mic with Environmental Noise Cancellation.",
        images: [
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Noise",
        category: "Tech & Gadgets",
        subcategory: "Wireless Earbuds",
        priceINR: 1299,
        originalPriceINR: 3999,
        discountPercentage: 67,
        rating: 4.5,
        reviewCount: 6800,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "67% OFF Super Saver",
        trendingScore: 92,
        badges: ["70H PLAYTIME", "67% OFF"],
        tags: ["noise", "earbuds", "tws", "quad-mic", "bluetooth"],
        variants: [
          { name: "Color", values: ["Deep Black", "Calm Beige", "Mint Green"] }
        ],
        specs: {
          "Playtime": "70 Hours Massive Battery Life",
          "Fast Charging": "Instacharge 10 Mins = 120 Mins Playtime",
          "Drivers": "11mm Deep Bass Drivers"
        }
      }
    ];
  }
};
