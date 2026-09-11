import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const AjioProvider: MarketplaceProvider = {
  id: "ajio",
  name: "AJIO",
  displayName: "AJIO",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "ajio",
        sourceProductId: "46091823",
        sourceUrl: "https://www.ajio.com/p/46091823",
        title: "Puma Mens Wired Pro Lightweight Cushioned Daily Sneakers",
        slug: "ajio-puma-wired-pro-sneakers",
        description: "Breathable air mesh running and lifestyle trainers with SoftFoam+ comfort sockliner for instant step-in cushioning.",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Puma",
        category: "Footwear",
        subcategory: "Sneakers",
        priceINR: 1999,
        originalPriceINR: 3999,
        discountPercentage: 50,
        rating: 4.6,
        reviewCount: 1250,
        availability: "in_stock",
        isFlashSale: true,
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "AJIO Mania 50% Deal",
        trendingScore: 89,
        badges: ["AJIO MANIA DEAL", "#1 BEST SELLER"],
        tags: ["puma", "sneakers", "shoes", "footwear", "running"],
        variants: [
          { name: "Size (UK)", values: ["6", "7", "8", "9", "10", "11"] },
          { name: "Color", values: ["Puma Black-White", "High Risk Red", "Peacoat Navy"] }
        ],
        specs: {
          "Insole": "SoftFoam+ Comfort Sockliner",
          "Upper": "Engineered Knit Mesh",
          "Outsole": "Durable Non-Marking Rubber"
        }
      },
      {
        source: "ajio",
        sourceProductId: "46091824",
        sourceUrl: "https://www.ajio.com/p/46091824",
        title: "GAP Men Regular Fit Washed Denim Trucker Jacket",
        slug: "ajio-gap-washed-denim-trucker-jacket",
        description: "Classic American denim icon featuring sturdy cotton construction, button-flap chest pockets, and adjustable waist tabs.",
        images: [
          "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "GAP",
        category: "Fashion",
        subcategory: "Jackets",
        priceINR: 2799,
        originalPriceINR: 5999,
        discountPercentage: 53,
        rating: 4.7,
        reviewCount: 780,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 2,
        isDeal: true,
        dealBadge: "53% OFF Flash Deal",
        trendingScore: 91,
        badges: ["53% OFF", "#2 BEST SELLER"],
        tags: ["gap", "denim", "jacket", "streetwear", "fashion"],
        variants: [
          { name: "Size", values: ["S", "M", "L", "XL"] }
        ],
        specs: {
          "Material": "100% Rigid Cotton Denim",
          "Closure": "Button Front Placket",
          "Care": "Machine Wash Cold"
        }
      }
    ];
  }
};
