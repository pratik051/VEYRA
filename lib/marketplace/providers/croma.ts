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
      },
      {
        source: "croma",
        sourceProductId: "CR-LOGI-MX3S",
        sourceUrl: "https://www.croma.com/p/CR-LOGI-MX3S",
        title: "Logitech MX Master 3S Wireless Performance Mouse (8K DPI, Quiet Clicks)",
        slug: "croma-logitech-mx-master-3s-mouse",
        description: "Flagship precision ergonomic wireless mouse with 8,000 DPI track-on-glass sensor, MagSpeed electromagnetic scrolling, and quiet clicks.",
        images: [
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Logitech",
        category: "Tech & Gadgets",
        subcategory: "PC Accessories",
        priceINR: 8995,
        originalPriceINR: 10995,
        discountPercentage: 18,
        rating: 4.9,
        reviewCount: 4200,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isTrending: true,
        trendingScore: 98,
        badges: ["FLAGSHIP MOUSE", "#1 PRODUCTIVITY"],
        tags: ["logitech", "mx-master", "mouse", "wireless", "productivity"],
        variants: [
          { name: "Color", values: ["Graphite Black", "Pale Grey"] }
        ],
        specs: {
          "Sensor": "8,000 DPI Darkfield High Precision",
          "Connectivity": "Bluetooth Low Energy + Logi Bolt USB Receiver",
          "Battery Life": "Up to 70 days on full charge"
        }
      },
      {
        source: "croma",
        sourceProductId: "CR-PHIL-BT3231",
        sourceUrl: "https://www.croma.com/p/CR-PHIL-BT3231",
        title: "Philips Series 3000 Cordless Beard & Moustache Trimmer with DuraPower",
        slug: "croma-philips-series-3000-beard-trimmer",
        description: "Self-sharpening titanium coated blades with Lift & Trim system, 20 lock-in length settings (0.5 - 10mm), and 60 min cordless run time.",
        images: [
          "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Philips",
        category: "Everyday Essentials",
        subcategory: "Grooming",
        priceINR: 1699,
        originalPriceINR: 2395,
        discountPercentage: 29,
        rating: 4.7,
        reviewCount: 5800,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "29% OFF Grooming",
        trendingScore: 92,
        badges: ["#1 GROOMING", "29% OFF"],
        tags: ["trimmer", "philips", "grooming", "beard-trimmer"],
        specs: {
          "Precision": "0.5mm precision settings up to 10mm",
          "Battery": "60 mins use with 1 hour charge (Fast Charge)",
          "Blades": "Skin-Friendly Titanium Blades"
        }
      },
      {
        source: "croma",
        sourceProductId: "CR-APL-20WADPT",
        sourceUrl: "https://www.croma.com/p/CR-APL-20WADPT",
        title: "Apple 20W USB-C Power Adapter for iPhone & iPad (Original)",
        slug: "croma-apple-original-20w-usbc-adapter",
        description: "Official Apple 20W USB-C power adapter delivers fast, efficient charging at home, in the office, or on the go for iPhone 16/15/14/13/12 series.",
        images: [
          "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Apple",
        category: "Mobile Accessories",
        subcategory: "Fast Chargers",
        priceINR: 1690,
        originalPriceINR: 1900,
        discountPercentage: 11,
        rating: 4.9,
        reviewCount: 9800,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        trendingScore: 97,
        badges: ["100% ORIGINAL", "APPLE CERTIFIED"],
        tags: ["apple", "adapter", "iphone", "fast-charger", "usbc"],
        specs: {
          "Wattage": "20W Power Delivery 3.0",
          "Compatibility": "iPhone 8 through iPhone 16 Pro Max, iPad Pro/Air"
        }
      }
    ];
  }
};
