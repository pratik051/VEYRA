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
        sourceProductId: "CLI-TITAN-NEO",
        sourceUrl: "https://www.tatacliq.com/search/?searchCategory=all&text=Titan+Neo+Splash+Watch",
        title: "Titan Neo Splash Quartz Analog Blue Dial Stainless Steel Watch",
        slug: "tatacliq-titan-neo-splash-analog-watch",
        description: "Sophisticated analog blue dial timepiece with mineral glass crystal, date display and solid stainless steel linked bracelet.",
        images: [
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Titan",
        category: "Watches",
        subcategory: "Analog Watches",
        priceINR: 4995,
        originalPriceINR: 6995,
        discountPercentage: 28,
        rating: 4.8,
        reviewCount: 1450,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "Tata CLiQ Certified",
        trendingScore: 92,
        badges: ["TATA CERTIFIED", "28% OFF"],
        tags: ["titan", "watch", "analog", "stainless-steel", "mens-watch"],
        specs: {
          "Case Diameter": "42 mm",
          "Water Resistance": "50 Meters",
          "Glass": "Scratch-Resistant Mineral Crystal"
        }
      },
      {
        source: "tatacliq",
        sourceProductId: "CLI-CASIO-EDIFICE",
        sourceUrl: "https://www.tatacliq.com/search/?searchCategory=all&text=Casio+Edifice+Solar+Watch",
        title: "Casio Edifice Solar-Powered Slim Sapphire Crystal Chronograph Watch",
        slug: "tatacliq-casio-edifice-solar-chronograph",
        description: "Motorsport inspired ultra-slim chronograph featuring Tough Solar charging technology and anti-reflective coated sapphire crystal glass.",
        images: [
          "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Casio",
        category: "Watches",
        subcategory: "Solar Chronograph",
        priceINR: 11995,
        originalPriceINR: 14995,
        discountPercentage: 20,
        rating: 4.9,
        reviewCount: 980,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "20% OFF",
        trendingScore: 95,
        badges: ["TOUGH SOLAR", "SAPPHIRE GLASS"],
        tags: ["casio", "edifice", "solar", "sapphire", "chronograph"],
        specs: {
          "Power": "Tough Solar (High-Efficiency Solar Cell)",
          "Glass": "Sapphire Crystal with Non-Reflective Coating",
          "Water Resistance": "100 Meters / 10 Bar"
        }
      },
      {
        source: "tatacliq",
        sourceProductId: "CLI-TOMMY-DECKER",
        sourceUrl: "https://www.tatacliq.com/search/?searchCategory=all&text=Tommy+Hilfiger+Watch",
        title: "Tommy Hilfiger Decker Men Multifunction Blue Silicone Sport Watch",
        slug: "tatacliq-tommy-hilfiger-decker-watch",
        description: "Sporty American styling with iconic Tommy Hilfiger sub-eyes, brushed ion-plated case and flexible blue branded silicone strap.",
        images: [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Tommy Hilfiger",
        category: "Watches",
        subcategory: "Sport Watches",
        priceINR: 8750,
        originalPriceINR: 12500,
        discountPercentage: 30,
        rating: 4.7,
        reviewCount: 620,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "30% OFF Festive",
        trendingScore: 89,
        badges: ["DESIGNER LUXURY", "30% OFF"],
        tags: ["tommy-hilfiger", "watch", "sport", "silicone", "luxury"],
        specs: {
          "Case Size": "46 mm",
          "Movement": "Multifunction Day & Date",
          "Strap": "Durable Embossed Silicone"
        }
      },
      {
        source: "tatacliq",
        sourceProductId: "CLI-FASTRACK-FS1",
        sourceUrl: "https://www.tatacliq.com/search/?searchCategory=all&text=Fastrack+Smartwatch",
        title: "Fastrack FS1 Pro 1.96\" Super AMOLED BT Calling Smartwatch",
        slug: "tatacliq-fastrack-fs1-pro-amoled-smartwatch",
        description: "Largest-in-class 1.96 inch Super AMOLED arched display with NitroFast charging, SingleSync BT calling and 110+ sports modes.",
        images: [
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Fastrack",
        category: "Watches",
        subcategory: "Smartwatches",
        priceINR: 2795,
        originalPriceINR: 7995,
        discountPercentage: 65,
        rating: 4.5,
        reviewCount: 3100,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isFlashSale: true,
        isDeal: true,
        dealBadge: "65% Mega Flash Sale",
        trendingScore: 93,
        badges: ["SUPER AMOLED", "65% OFF"],
        tags: ["fastrack", "smartwatch", "amoled", "bluetooth-calling"],
        variants: [
          { name: "Color", values: ["Teal Blue", "Classic Black", "Carbon Grey"] }
        ],
        specs: {
          "Display": "1.96\" Super AMOLED (410x502 px)",
          "Battery": "Up to 7 Days Battery Life",
          "Water Resistance": "IP68 Water & Dust Resistant"
        }
      }
    ];
  }
};
