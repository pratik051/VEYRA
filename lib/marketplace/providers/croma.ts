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
        sourceProductId: "CRO-PB-20000",
        sourceUrl: "https://www.croma.com/searchB?q=Croma+Power+Bank+20000mAh",
        title: "Croma 20000mAh 22.5W Fast Charging Power Bank with Type-C Power Delivery",
        slug: "croma-20000mah-22w-fast-power-bank",
        description: "High-capacity external battery pack with 22.5W fast charge support for iPhones, Androids and tablets with LED battery indicator.",
        images: [
          "https://images.unsplash.com/photo-1609592424300-e2cb7cf5b7a7?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Croma",
        category: "Mobile Accessories",
        subcategory: "Power Banks",
        priceINR: 1499,
        originalPriceINR: 2500,
        discountPercentage: 40,
        rating: 4.5,
        reviewCount: 1840,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "Croma Tata Assured",
        trendingScore: 88,
        badges: ["TATA ASSURED", "40% OFF"],
        tags: ["croma", "power-bank", "fast-charging", "type-c", "mobile"],
        specs: {
          "Capacity": "20,000 mAh Li-Polymer",
          "Output": "22.5W Fast Charge (QC 3.0 + Type-C PD)",
          "Warranty": "18 Months Croma Direct Warranty"
        }
      },
      {
        source: "croma",
        sourceProductId: "CRO-LOGI-MX3S",
        sourceUrl: "https://www.croma.com/searchB?q=Logitech+MX+Master+3S",
        title: "Logitech MX Master 3S Performance Wireless Ergonomic Mouse (Quiet Clicks, 8K DPI)",
        slug: "croma-logitech-mx-master-3s-mouse",
        description: "The flagship productivity mouse with 8,000 DPI track-on-glass sensor, Quiet Click switches and MagSpeed electromagnetic scroll wheel.",
        images: [
          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Logitech",
        category: "Tech & Gadgets",
        subcategory: "Computer Accessories",
        priceINR: 8995,
        originalPriceINR: 10995,
        discountPercentage: 18,
        rating: 4.9,
        reviewCount: 4210,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        trendingScore: 97,
        badges: ["FLAGSHIP TECH", "TOP RATED 4.9★"],
        tags: ["logitech", "mouse", "productivity", "wireless", "mx-master"],
        variants: [
          { name: "Color", values: ["Graphite Black", "Pale Grey"] }
        ],
        specs: {
          "Sensor": "8000 DPI Darkfield Tracking",
          "Scroll Wheel": "MagSpeed Electromagnetic Scrolling (1000 lines/sec)",
          "Battery": "Up to 70 Days on full charge (USB-C)"
        }
      },
      {
        source: "croma",
        sourceProductId: "CRO-PHILIPS-T3000",
        sourceUrl: "https://www.croma.com/searchB?q=Philips+Series+3000+Trimmer",
        title: "Philips Series 3000 Cordless Beard & Stubble Trimmer with Lift & Trim System",
        slug: "croma-philips-series-3000-beard-trimmer",
        description: "Self-sharpening stainless steel blades with Lift & Trim comb for an even trim. 60 minutes cordless use on USB charging.",
        images: [
          "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Philips",
        category: "Everyday Essentials",
        subcategory: "Grooming",
        priceINR: 1499,
        originalPriceINR: 1995,
        discountPercentage: 25,
        rating: 4.7,
        reviewCount: 7800,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "25% OFF",
        trendingScore: 91,
        badges: ["#1 GROOMING", "25% OFF"],
        tags: ["philips", "trimmer", "grooming", "beard", "mens-care"],
        specs: {
          "Precision": "20 Lock-in length settings (0.5mm to 10mm)",
          "Run Time": "60 Minutes Cordless Use",
          "Blades": "Self-Sharpening Skin-Friendly Steel Blades"
        }
      },
      {
        source: "croma",
        sourceProductId: "CRO-APPLE-20W",
        sourceUrl: "https://www.croma.com/searchB?q=Apple+20W+USB-C+Power+Adapter",
        title: "Apple 20W USB-C Original Power Adapter for iPhone, iPad & AirPods",
        slug: "croma-apple-20w-usbc-power-adapter",
        description: "Official Apple 20W USB-C Power Adapter for fast, efficient charging at home, in the office, or on the go.",
        images: [
          "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Apple",
        category: "Mobile Accessories",
        subcategory: "Fast Chargers",
        priceINR: 1699,
        originalPriceINR: 1900,
        discountPercentage: 11,
        rating: 4.8,
        reviewCount: 9200,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        trendingScore: 95,
        badges: ["100% ORIGINAL APPLE", "TATA ASSURED"],
        tags: ["apple", "charger", "iphone", "type-c", "fast-charging"],
        specs: {
          "Wattage": "20W Power Delivery",
          "Compatibility": "iPhone 16/15/14/13/12 series, iPad Pro, AirPods",
          "Port": "USB Type-C"
        }
      }
    ];
  }
};
