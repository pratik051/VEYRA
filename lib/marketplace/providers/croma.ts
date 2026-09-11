import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const CromaProvider: MarketplaceProvider = {
  id: "croma",
  name: "Croma",
  displayName: "Croma",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "croma",
        sourceProductId: "CR-PB-30219",
        sourceUrl: "https://www.croma.com/p/CR-PB-30219",
        title: "Croma 20000mAh 22.5W Fast Charging Power Bank (Type-C PD + Dual USB)",
        slug: "croma-20000mah-22-5w-fast-power-bank",
        description: "Heavy-duty 20000mAh high-density lithium polymer power bank supporting 22.5W two-way fast charge and multi-layer safety protections.",
        images: [
          "https://images.unsplash.com/photo-1609592426038-0b5c92c90666?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Croma",
        category: "Mobile Accessories",
        subcategory: "Power Banks",
        priceINR: 1499,
        originalPriceINR: 2990,
        discountPercentage: 50,
        rating: 4.5,
        reviewCount: 1890,
        availability: "in_stock",
        isFlashSale: true,
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "50% Off Mega Tech Deal",
        trendingScore: 91,
        badges: ["50% TECH DEAL", "#1 BEST SELLER"],
        tags: ["powerbank", "fast-charging", "20000mah", "battery", "croma"],
        variants: [
          { name: "Color", values: ["Matte Black", "Metallic Gray"] }
        ],
        specs: {
          "Battery Capacity": "20,000 mAh Li-Polymer",
          "Power Output": "22.5W Max Fast Charge",
          "Input/Output": "Type-C PD In/Out, 2x USB-A QC 3.0"
        }
      }
    ];
  }
};
