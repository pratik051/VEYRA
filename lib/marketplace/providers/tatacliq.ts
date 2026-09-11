import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const TataCliqProvider: MarketplaceProvider = {
  id: "tatacliq",
  name: "Tata CLiQ",
  displayName: "Tata CLiQ",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "tatacliq",
        sourceProductId: "TC-WAT-90812",
        sourceUrl: "https://www.tatacliq.com/p-TC-WAT-90812",
        title: "Titan Neo Splash Blue Textured Dial Analog Stainless Steel Watch",
        slug: "tatacliq-titan-neo-splash-analog-watch",
        description: "Modern minimalist analog watch with ocean blue sunburst dial, mineral glass crystal, and solid stainless steel linked bracelet.",
        images: [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Titan",
        category: "Watches",
        subcategory: "Analog Watches",
        priceINR: 4295,
        originalPriceINR: 5995,
        discountPercentage: 28,
        rating: 4.7,
        reviewCount: 780,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isNewArrival: true,
        isDeal: true,
        dealBadge: "Tata CLiQ Luxury Deal",
        trendingScore: 86,
        badges: ["#1 BEST SELLER", "28% OFF"],
        tags: ["titan", "watch", "analog", "stainless-steel", "mens-watch"],
        variants: [
          { name: "Strap", values: ["Silver Stainless Steel", "Mesh Steel", "Leather"] }
        ],
        specs: {
          "Case Diameter": "42 mm",
          "Glass": "Scratch-Resistant Mineral Crystal",
          "Water Resistance": "50m Water Resistant"
        }
      }
    ];
  }
};
