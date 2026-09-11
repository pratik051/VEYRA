import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const BoatProvider: MarketplaceProvider = {
  id: "boat",
  name: "boAt",
  displayName: "boAt Lifestyle",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "boat",
        sourceProductId: "BOAT-AIR-141",
        sourceUrl: "https://www.boat-lifestyle.com/products/airdopes-141",
        title: "boAt Airdopes 141 ANC with 32dB Active Noise Cancellation & 42H Playtime",
        slug: "boat-airdopes-141-anc-earbuds",
        description: "True wireless earbuds with 32dB active noise cancellation, beast mode 50ms low latency for gaming, ENx quad mic tech, and ASAP charge.",
        images: [
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "boAt",
        category: "Tech & Gadgets",
        subcategory: "Wireless Earbuds",
        priceINR: 1499,
        originalPriceINR: 4490,
        discountPercentage: 67,
        rating: 4.6,
        reviewCount: 6840,
        availability: "in_stock",
        isFlashSale: true,
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "67% OFF Super Deal",
        isTrending: true,
        trendingScore: 97,
        badges: ["67% OFF SUPER DEAL", "#1 BEST SELLER"],
        tags: ["boat", "earbuds", "anc", "bluetooth", "gaming", "audio"],
        variants: [
          { name: "Color", values: ["Bold Black", "Cider Pink", "Gunmetal Gray"] }
        ],
        specs: {
          "Noise Cancellation": "Up to 32 dB Active Noise Cancellation",
          "Playtime": "Up to 42 Hours Total Playback",
          "Low Latency": "50ms Beast™ Mode",
          "Fast Charging": "10 Mins Charge = 150 Mins Playtime"
        }
      },
      {
        source: "boat",
        sourceProductId: "BOAT-WAV-FLEX",
        sourceUrl: "https://www.boat-lifestyle.com/products/wave-flex-connect",
        title: "boAt Wave Flex Connect 1.83\" HD Display Bluetooth Calling Smartwatch",
        slug: "boat-wave-flex-connect-smartwatch",
        description: "Large 1.83\" high-definition display, clear Bluetooth hands-free calling with dial pad, 20+ active sports modes, and heart rate/SpO2 health tracker.",
        images: [
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "boAt",
        category: "Watches",
        subcategory: "Smartwatches",
        priceINR: 1299,
        originalPriceINR: 6990,
        discountPercentage: 81,
        rating: 4.5,
        reviewCount: 3920,
        availability: "in_stock",
        isFlashSale: true,
        isDeal: true,
        dealBadge: "81% Mega Price Drop",
        isTrending: true,
        trendingScore: 94,
        badges: ["81% PRICE DROP", "MEGA DEAL"],
        tags: ["boat", "smartwatch", "fitness", "bluetooth-calling", "gadget"],
        variants: [
          { name: "Color", values: ["Active Black", "Cherry Blossom", "Deep Blue"] }
        ],
        specs: {
          "Screen Size": "1.83\" HD Display (2.5D Curved Glass)",
          "Calling": "Advanced Bluetooth Calling with Inbuilt Speaker",
          "Battery Life": "Up to 10 Days (3 Days with Calling)",
          "Water Resistance": "IP68 Dust, Sweat & Splash Proof"
        }
      }
    ];
  }
};
