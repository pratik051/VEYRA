import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const MeeshoProvider: MarketplaceProvider = {
  id: "meesho",
  name: "Meesho",
  displayName: "Meesho",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "meesho",
        sourceProductId: "18928391",
        sourceUrl: "https://www.meesho.com/p/18928391",
        title: "Multi-Functional 7-in-1 Tech Cleaning Kit for Earbuds, Keyboard & Phone",
        slug: "meesho-7in1-tech-cleaning-kit",
        description: "Compact desk and gadget cleaning kit with high-density brush, silicone pen nib, flocking sponge, keycap puller and spray bottle.",
        images: [
          "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "CleanMaster",
        category: "Everyday Essentials",
        subcategory: "Tech Cleaners",
        priceINR: 249,
        originalPriceINR: 599,
        discountPercentage: 58,
        rating: 4.6,
        reviewCount: 2310,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isFlashSale: true,
        isDeal: true,
        dealBadge: "58% Off Maha Deal",
        isTrending: true,
        trendingScore: 87,
        badges: ["#1 BEST SELLER", "58% OFF"],
        tags: ["cleaning-kit", "gadgets", "keyboard", "earbuds", "essentials"],
        specs: {
          "Included": "Keycap puller, flocking sponge, spray bottle, high-density brush, silicone tip",
          "Material": "ABS + Silicone + Sponge"
        }
      },
      {
        source: "meesho",
        sourceProductId: "21983011",
        sourceUrl: "https://www.meesho.com/p/21983011",
        title: "Vintage Top-Grain Leather RFID Protected Bi-Fold Men's Wallet",
        slug: "meesho-vintage-leather-rfid-wallet",
        description: "Handcrafted genuine leather slim pocket wallet with 8 card slots, 2 cash compartments, and RFID blocking lining.",
        images: [
          "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Urban Hide",
        category: "Accessories",
        subcategory: "Wallets",
        priceINR: 499,
        originalPriceINR: 1199,
        discountPercentage: 58,
        rating: 4.5,
        reviewCount: 1640,
        availability: "in_stock",
        isNewArrival: true,
        isDeal: true,
        dealBadge: "Special Price",
        trendingScore: 82,
        badges: ["SPECIAL PRICE", "58% OFF"],
        tags: ["wallet", "leather", "rfid", "accessories", "mens-fashion"],
        variants: [
          { name: "Color", values: ["Vintage Brown", "Classic Black", "Tan"] }
        ],
        specs: {
          "Material": "100% Genuine Full-Grain Leather",
          "Protection": "13.56 MHz RFID Blocking Layer",
          "Dimensions": "11.5 cm x 9.5 cm"
        }
      }
    ];
  }
};
