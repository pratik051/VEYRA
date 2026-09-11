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
        subcategory: "Chronograph",
        priceINR: 7495,
        originalPriceINR: 12495,
        discountPercentage: 40,
        rating: 4.8,
        reviewCount: 2940,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "40% OFF End of Season",
        trendingScore: 93,
        badges: ["LUXURY WATCH", "40% OFF"],
        tags: ["watch", "fossil", "chronograph", "leather-strap", "luxury"],
        specs: {
          "Case Size": "44 mm Stainless Steel",
          "Water Resistance": "5 ATM (50 Meters)",
          "Movement": "Quartz Chronograph Subdials"
        }
      },
      {
        source: "myntra",
        sourceProductId: "33190182",
        sourceUrl: "https://www.myntra.com/jeans/levis/levis-mens-511-slim-fit-stretch-denim-jeans/33190182/buy",
        title: "Levi's Men's 511 Slim Fit Stretch Denim Jeans (Dark Indigo Rinse)",
        slug: "myntra-levis-511-slim-fit-stretch-jeans",
        description: "The modern slim with room to move. Added stretch for all-day comfort with zip fly and iconic red tab styling.",
        images: [
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Levi's",
        category: "Fashion",
        subcategory: "Jeans",
        priceINR: 2399,
        originalPriceINR: 3999,
        discountPercentage: 40,
        rating: 4.7,
        reviewCount: 4890,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "40% OFF",
        isTrending: true,
        trendingScore: 95,
        badges: ["#1 DENIM", "40% OFF"],
        tags: ["jeans", "levis", "slim-fit", "denim", "mens-fashion"],
        variants: [
          { name: "Waist (Inches)", values: ["30", "32", "34", "36", "38"] },
          { name: "Inseam", values: ["32", "34"] }
        ],
        specs: {
          "Fabric": "99% Cotton, 1% Elastane",
          "Fit": "Slim Through Thigh & Leg",
          "Rise": "Mid Rise"
        }
      },
      {
        source: "myntra",
        sourceProductId: "44910293",
        sourceUrl: "https://www.myntra.com/shoes/nike/nike-mens-air-max-sc-leather-running-sneakers/44910293/buy",
        title: "Nike Air Max SC Leather Heritage Running & Streetwear Sneakers",
        slug: "myntra-nike-air-max-sc-leather-sneakers",
        description: "With its easy-going lines, heritage track look and visible Air cushioning, Nike Air Max SC is the ideal finish to any outfit.",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Nike",
        category: "Footwear",
        subcategory: "Sneakers",
        priceINR: 5295,
        originalPriceINR: 5995,
        discountPercentage: 12,
        rating: 4.8,
        reviewCount: 3600,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        trendingScore: 96,
        badges: ["ICONIC AIR MAX", "PREMIUM"],
        tags: ["nike", "air-max", "sneakers", "streetwear", "shoes"],
        variants: [
          { name: "Size (UK)", values: ["7", "8", "9", "10", "11"] },
          { name: "Color", values: ["White Black", "Triple Black", "White Gym Red"] }
        ],
        specs: {
          "Upper": "Leather, textile and mesh combination",
          "Cushioning": "Max Air unit delivers lightweight all-day comfort",
          "Outsole": "Rubber with flex grooves for durable traction"
        }
      },
      {
        source: "myntra",
        sourceProductId: "55190283",
        sourceUrl: "https://www.myntra.com/hoodies/hm/hm-relaxed-fit-heavyweight-hoodie/55190283/buy",
        title: "H&M Relaxed Fit Heavyweight French Terry Fleece Hoodie",
        slug: "myntra-hm-relaxed-fit-heavyweight-hoodie",
        description: "Soft sweat fabric hoodie in organic cotton blend with jersey-lined wrapover hood, kangaroo pocket and wide ribbing at cuffs.",
        images: [
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "H&M",
        category: "Fashion",
        subcategory: "Hoodies",
        priceINR: 1999,
        originalPriceINR: 2499,
        discountPercentage: 20,
        rating: 4.6,
        reviewCount: 2190,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "H&M Seasonal 20% OFF",
        trendingScore: 89,
        badges: ["TRENDING FIT", "20% OFF"],
        tags: ["hoodie", "hm", "fleece", "winterwear", "cozy"],
        variants: [
          { name: "Size", values: ["XS", "S", "M", "L", "XL"] },
          { name: "Color", values: ["Sage Green", "Charcoal Melange", "Beige Oat"] }
        ],
        specs: {
          "Material": "80% Cotton, 20% Polyester",
          "Interior": "Brushed Soft Fleece"
        }
      }
    ];
  }
};
