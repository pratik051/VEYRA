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
      },
      {
        source: "tatacliq",
        sourceProductId: "TC-WAT-90813",
        sourceUrl: "https://www.tatacliq.com/p-TC-WAT-90813",
        title: "Casio Edifice Solar Powered Chronograph with Sapphire Crystal",
        slug: "tatacliq-casio-edifice-solar-chronograph",
        description: "Motorsports inspired solar charging high-performance chronograph with anti-reflective sapphire glass and 100m water resistance.",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Casio",
        category: "Watches",
        subcategory: "Chronograph",
        priceINR: 11995,
        originalPriceINR: 15995,
        discountPercentage: 25,
        rating: 4.9,
        reviewCount: 1420,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "25% OFF Luxury",
        isTrending: true,
        trendingScore: 95,
        badges: ["EDIFICE SOLAR", "SAPPHIRE GLASS"],
        tags: ["casio", "edifice", "solar", "chronograph", "luxury-watch"],
        specs: {
          "Power": "Tough Solar (Never needs battery replacement)",
          "Glass": "Scratch-Proof Sapphire Crystal",
          "Water Resistance": "100 Meters / 10 BAR"
        }
      },
      {
        source: "tatacliq",
        sourceProductId: "TC-WAT-90814",
        sourceUrl: "https://www.tatacliq.com/p-TC-WAT-90814",
        title: "Tommy Hilfiger Men Decker Multi-Function Black Leather Watch",
        slug: "tatacliq-tommy-hilfiger-decker-leather-watch",
        description: "Distinguished sporty luxury timepiece with multi-eye sub-dials, iconic TH flag crest, and premium contrast stitched genuine leather band.",
        images: [
          "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Tommy Hilfiger",
        category: "Watches",
        subcategory: "Multi-Function",
        priceINR: 8995,
        originalPriceINR: 14995,
        discountPercentage: 40,
        rating: 4.8,
        reviewCount: 980,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "40% OFF Tata Exclusive",
        trendingScore: 92,
        badges: ["EXCLUSIVE DEAL", "40% OFF"],
        tags: ["tommy-hilfiger", "designer-watch", "leather", "luxury"],
        specs: {
          "Dial Color": "Sunray Jet Black with Rose Gold Accents",
          "Case": "46 mm Ion-Plated Stainless Steel",
          "Strap": "Calfskin Leather Band"
        }
      },
      {
        source: "tatacliq",
        sourceProductId: "TC-WAT-90815",
        sourceUrl: "https://www.tatacliq.com/p-TC-WAT-90815",
        title: "Fastrack Limitless FS1 Pro 1.96\" Super AMOLED BT Calling Smartwatch",
        slug: "tatacliq-fastrack-limitless-fs1-pro-smartwatch",
        description: "Arched Super AMOLED display with 410x502 resolution, NitroFast single-sync Bluetooth calling, AI voice assistant and 110+ sports modes.",
        images: [
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Fastrack",
        category: "Watches",
        subcategory: "Smartwatches",
        priceINR: 2495,
        originalPriceINR: 4995,
        discountPercentage: 50,
        rating: 4.5,
        reviewCount: 3100,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 2,
        isDeal: true,
        dealBadge: "50% Flash Deal",
        trendingScore: 89,
        badges: ["AMOLED DISPLAY", "50% OFF"],
        tags: ["smartwatch", "fastrack", "amoled", "bluetooth-calling"],
        variants: [
          { name: "Color", values: ["Jet Black", "Teal Blue", "Olive Green"] }
        ],
        specs: {
          "Display": "1.96\" Super AMOLED 410x502px",
          "Calling": "SingleSync BT Calling with Mic & Speaker",
          "Battery": "Up to 7 Days Standard Use"
        }
      }
    ];
  }
};
