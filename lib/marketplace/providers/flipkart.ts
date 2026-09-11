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
        sourceProductId: "FLIP-REALME-65W",
        sourceUrl: "https://www.flipkart.com/search?q=Realme+65W+Fast+Charger",
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
        sourceProductId: "FLIP-ASIAN-RUN-01",
        sourceUrl: "https://www.flipkart.com/search?q=Asian+Men+Running+Shoes",
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
        reviewCount: 3820,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 2,
        isDeal: true,
        dealBadge: "50% Off Big Billion",
        trendingScore: 85,
        badges: ["BIG BILLION DEAL", "50% OFF"],
        tags: ["shoes", "running", "asian", "sports", "sneakers"],
        variants: [
          { name: "Size (UK/IND)", values: ["6", "7", "8", "9", "10"] },
          { name: "Color", values: ["Black Red", "Navy Grey", "All White"] }
        ],
        specs: {
          "Upper Material": "Breathable Flyknit Mesh",
          "Sole": "High-Traction Phylon + Rubber",
          "Closure": "Lace-Up"
        }
      },
      {
        source: "flipkart",
        sourceProductId: "FLIP-NOTHING-EARA",
        sourceUrl: "https://www.flipkart.com/search?q=Nothing+Ear+a+ANC+Earbuds",
        title: "Nothing Ear (a) with 45dB Smart ANC & Hi-Res Wireless Audio",
        slug: "flipkart-nothing-ear-a-anc-earbuds",
        description: "Iconic transparent design with ChatGPT integration, 45dB Smart Active Noise Cancellation, and 42.5h total battery life.",
        images: [
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Nothing",
        category: "Tech & Gadgets",
        subcategory: "TWS Earbuds",
        priceINR: 6999,
        originalPriceINR: 9999,
        discountPercentage: 30,
        rating: 4.7,
        reviewCount: 4620,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "Flipkart Choice",
        isTrending: true,
        trendingScore: 97,
        badges: ["FLIPKART CHOICE", "#1 AUDIO"],
        tags: ["nothing", "earbuds", "anc", "wireless", "transparent"],
        variants: [
          { name: "Color", values: ["Vibrant Yellow", "Crisp White", "Charcoal Black"] }
        ],
        specs: {
          "ANC": "45dB Smart Active Noise Cancellation",
          "Audio Codec": "LDAC Hi-Res Certified",
          "Battery": "Up to 42.5 Hours total playback with Case"
        }
      },
      {
        source: "flipkart",
        sourceProductId: "FLIP-XIAOMI-360-CAM",
        sourceUrl: "https://www.flipkart.com/search?q=Xiaomi+360+2K+Smart+Security+Camera",
        title: "Xiaomi 360° 2K Full HD Smart Home Security Camera with Night Vision",
        slug: "flipkart-xiaomi-360-2k-smart-security-camera",
        description: "Ultra-clear 2K (1296p) resolution, 360° panoramic view, AI human detection, and 2-way real-time voice calls via Mi Home App.",
        images: [
          "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Xiaomi",
        category: "Tech & Gadgets",
        subcategory: "Smart Home",
        priceINR: 2899,
        originalPriceINR: 4499,
        discountPercentage: 35,
        rating: 4.6,
        reviewCount: 3190,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "35% OFF",
        trendingScore: 90,
        badges: ["SMART HOME", "35% OFF"],
        tags: ["security-camera", "xiaomi", "cctv", "smart-home", "wifi"],
        specs: {
          "Resolution": "2304 x 1296 (2K Super HD)",
          "Field of View": "360° Horizontal, 108° Vertical",
          "Storage": "MicroSD up to 256GB + Cloud NAS"
        }
      },
      {
        source: "flipkart",
        sourceProductId: "FLIP-BOULT-Z40",
        sourceUrl: "https://www.flipkart.com/search?q=Boult+Audio+Z40+Earbuds",
        title: "Boult Audio Z40 with 60H Playtime, ENC & 45ms Ultra-Low Latency Gaming",
        slug: "flipkart-boult-audio-z40-tws-earbuds",
        description: "BoomX rich bass drivers, Zen Quad-Mic Environmental Noise Cancellation, Type-C lightning bounc charging with IPX5 water resistance.",
        images: [
          "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Boult Audio",
        category: "Tech & Gadgets",
        subcategory: "TWS Earbuds",
        priceINR: 1199,
        originalPriceINR: 4999,
        discountPercentage: 76,
        rating: 4.5,
        reviewCount: 14200,
        availability: "in_stock",
        isFlashSale: true,
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "76% Mega Flash Sale",
        isTrending: true,
        trendingScore: 94,
        badges: ["#1 BUDGET TWS", "76% OFF"],
        tags: ["boult", "earbuds", "gaming", "bluetooth", "budget-audio"],
        variants: [
          { name: "Color", values: ["Denim Blue", "Caramel Brown", "White Opal"] }
        ],
        specs: {
          "Driver Size": "10mm BoomX Bass Boost Drivers",
          "Battery Life": "60 Hours Total with Fast Charging (10 min = 100 min)",
          "Water Resistance": "IPX5 Sweatproof"
        }
      }
    ];
  }
};
