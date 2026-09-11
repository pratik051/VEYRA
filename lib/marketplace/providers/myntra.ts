import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const MyntraProvider: MarketplaceProvider = {
  id: "myntra",
  name: "Myntra",
  displayName: "Myntra",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "myntra",
        sourceProductId: "24891001",
        sourceUrl: "https://www.myntra.com/tshirts/roadster/roadster-mens-cotton-oversized-heavyweight-tshirt/24891001/buy",
        title: "Roadster Pure Cotton 240 GSM Acid-Washed Heavyweight Oversized Tee",
        slug: "myntra-roadster-heavyweight-oversized-tee",
        description: "Premium streetwear drop-shoulder crew neck tee crafted from 100% combed cotton jersey with ribbed neck band.",
        images: [
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Roadster",
        category: "Fashion",
        subcategory: "T-Shirts",
        priceINR: 699,
        originalPriceINR: 1499,
        discountPercentage: 53,
        rating: 4.5,
        reviewCount: 1820,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isFlashSale: true,
        isDeal: true,
        dealBadge: "EORS Special",
        isTrending: true,
        trendingScore: 90,
        badges: ["EORS SPECIAL", "#1 BEST SELLER"],
        tags: ["tshirt", "oversized", "cotton", "streetwear", "fashion"],
        variants: [
          { name: "Size", values: ["S", "M", "L", "XL", "XXL"] },
          { name: "Color", values: ["Charcoal Washed", "Vintage Olive", "Off-White"] }
        ],
        specs: {
          "Fabric": "100% Combed Heavy Cotton (240 GSM)",
          "Fit": "Relaxed Oversized Drop-Shoulder",
          "Wash Care": "Machine Wash Cold"
        }
      },
      {
        source: "myntra",
        sourceProductId: "29182300",
        sourceUrl: "https://www.myntra.com/watches/fossil/fossil-mens-grant-chronograph-leather-watch/29182300/buy",
        title: "Fossil Grant Chronograph Roman Dial Genuine Leather Watch",
        slug: "myntra-fossil-grant-chronograph-watch",
        description: "Classic Roman numeral index chronograph watch featuring built-in stopwatches and supple brown genuine leather strap.",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Fossil",
        category: "Watches",
        subcategory: "Chronographs",
        priceINR: 7495,
        originalPriceINR: 12495,
        discountPercentage: 40,
        rating: 4.8,
        reviewCount: 940,
        availability: "in_stock",
        isNewArrival: false,
        isDeal: true,
        dealBadge: "40% OFF Special",
        isTrending: true,
        trendingScore: 88,
        badges: ["40% OFF SPECIAL", "VERIFIED DEAL"],
        tags: ["watch", "chronograph", "fossil", "leather", "luxury"],
        variants: [
          { name: "Dial Color", values: ["Cream / Navy", "Black Sunray", "Silver"] }
        ],
        specs: {
          "Case Size": "44mm Stainless Steel",
          "Movement": "Quartz Chronograph",
          "Water Resistance": "5 ATM (50 Meters)"
        }
      }
    ];
  }
};
