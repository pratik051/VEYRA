import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const NykaaProvider: MarketplaceProvider = {
  id: "nykaa",
  name: "Nykaa",
  displayName: "Nykaa",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "nykaa",
        sourceProductId: "7819200",
        sourceUrl: "https://www.nykaa.com/p/7819200",
        title: "Minimalist 10% Niacinamide + Zinc 1% Blemish & Oil Control Face Serum",
        slug: "nykaa-minimalist-10-niacinamide-serum",
        description: "Aloe vera based lightweight daily facial serum to reduce sebum activity, fade hyperpigmentation, and strengthen skin barrier.",
        images: [
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Minimalist",
        category: "Beauty & Lifestyle",
        subcategory: "Skincare Serums",
        priceINR: 599,
        originalPriceINR: 649,
        discountPercentage: 8,
        rating: 4.8,
        reviewCount: 4120,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isTrending: true,
        trendingScore: 93,
        badges: ["#1 BEST SELLER", "VIRAL"],
        tags: ["skincare", "serum", "niacinamide", "minimalist", "beauty"],
        specs: {
          "Key Actives": "10% Pure Niacinamide (Vitamin B3) + 1% Zinc PCA",
          "Skin Type": "All Skin Types (Acne-Prone / Oily)",
          "Volume": "30 ml Glass Dropper Bottle"
        }
      },
      {
        source: "nykaa",
        sourceProductId: "7819201",
        sourceUrl: "https://www.nykaa.com/p/7819201",
        title: "Maybelline New York Superstay Matte Ink Liquid Lipstick",
        slug: "nykaa-maybelline-superstay-matte-ink",
        description: "Flawless matte liquid lipstick that lasts up to 16 hours. Highly-pigmented color formula with precision arrow applicator.",
        images: [
          "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Maybelline New York",
        category: "Beauty & Lifestyle",
        subcategory: "Cosmetics",
        priceINR: 524,
        originalPriceINR: 699,
        discountPercentage: 25,
        rating: 4.7,
        reviewCount: 5200,
        availability: "in_stock",
        isFlashSale: true,
        isBestSeller: true,
        bestsellerRank: 2,
        isDeal: true,
        dealBadge: "Nykaa Pink Friday Deal",
        trendingScore: 95,
        badges: ["NYKAA DEAL", "#2 BEST SELLER"],
        tags: ["lipstick", "cosmetics", "maybelline", "makeup", "beauty"],
        variants: [
          { name: "Shade", values: ["Seductress", "Pioneer", "Ruler", "Lover"] }
        ],
        specs: {
          "Finish": "Long-Lasting Matte",
          "Duration": "Up to 16 Hours Transfer-Proof",
          "Volume": "5 ml"
        }
      }
    ];
  }
};
