import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const FlipkartProvider: MarketplaceProvider = {
  id: "flipkart",
  name: "Flipkart",
  displayName: "Flipkart",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "flipkart",
        sourceProductId: "MOBGTAGY7GMG2WZZ",
        sourceUrl: "https://www.flipkart.com/p/itmMOBGTAGY7GMG2WZZ",
        title: "Realme 65W GaN Dual-Port SuperDart Fast Charger with Type-C Cable",
        slug: "flipkart-realme-65w-gan-superdart-charger",
        description: "Ultra-compact Gallium Nitride (GaN) fast charger compatible with laptops, tablets, and smartphones.",
        images: [
          "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Realme",
        category: "Mobile Accessories",
        subcategory: "Fast Chargers",
        priceINR: 1999,
        originalPriceINR: 2999,
        discountPercentage: 33,
        rating: 4.6,
        reviewCount: 1420,
        availability: "in_stock",
        isFlashSale: true,
        isDeal: true,
        dealBadge: "Super Deal",
        isTrending: true,
        trendingScore: 89,
        badges: ["SUPER DEAL", "33% OFF"],
        tags: ["charger", "gan", "fast-charging", "type-c", "mobile"],
        variants: [
          { name: "Color", values: ["Glossy White", "Stealth Black"] }
        ],
        specs: {
          "Wattage": "65W GaN III Technology",
          "Ports": "1x USB-C PD, 1x USB-A QC 3.0",
          "Cable": "1m 6.5A Type-C to Type-C included"
        }
      },
      {
        source: "flipkart",
        sourceProductId: "SHOFGQYZ7RTY6BZZ",
        sourceUrl: "https://www.flipkart.com/p/itmSHOFGQYZ7RTY6BZZ",
        title: "Asian Men's Lightweight Breathable Running Shoes (Air Max Cushion)",
        slug: "flipkart-asian-mens-lightweight-running-shoes",
        description: "Engineered mesh upper for maximum airflow with bouncy EVA sole for responsive shock absorption.",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Asian",
        category: "Footwear",
        subcategory: "Sneakers",
        priceINR: 899,
        originalPriceINR: 1799,
        discountPercentage: 50,
        rating: 4.4,
        reviewCount: 3100,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isFlashSale: true,
        isDeal: true,
        dealBadge: "Big Billion Deal",
        trendingScore: 91,
        badges: ["BIG BILLION DEAL", "#1 BEST SELLER"],
        tags: ["shoes", "sneakers", "running", "mens-fashion", "sports"],
        variants: [
          { name: "Size (UK/IND)", values: ["6", "7", "8", "9", "10"] },
          { name: "Color", values: ["Slate Gray/Orange", "All Black", "Navy/White"] }
        ],
        specs: {
          "Outer Material": "Breathable Flyknit Mesh",
          "Sole": "High-elasticity EVA Cushion",
          "Closure": "Lace-Up"
        }
      }
    ];
  }
};
