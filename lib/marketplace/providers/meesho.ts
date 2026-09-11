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
      },
      {
        source: "meesho",
        sourceProductId: "33491823",
        sourceUrl: "https://www.meesho.com/p/33491823",
        title: "Jaipuri Printed Pure Cotton Anarkali Kurti Set with Dupatta",
        slug: "meesho-jaipuri-cotton-anarkali-kurti-set",
        description: "Handcrafted traditional Jaipuri floral block-printed breathable cotton Anarkali flared kurti with matching pant and chiffon dupatta.",
        images: [
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Jaipur Fab",
        category: "Fashion",
        subcategory: "Ethnic Wear",
        priceINR: 799,
        originalPriceINR: 1999,
        discountPercentage: 60,
        rating: 4.7,
        reviewCount: 4120,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 2,
        isDeal: true,
        dealBadge: "Mega Clearance 60% OFF",
        isTrending: true,
        trendingScore: 92,
        badges: ["#2 BEST SELLER", "60% OFF"],
        tags: ["kurti", "anarkali", "cotton", "ethnic", "meesho-fashion"],
        variants: [
          { name: "Size", values: ["S", "M", "L", "XL", "XXL"] },
          { name: "Color", values: ["Indigo Blue", "Maroon Red", "Sage Green"] }
        ],
        specs: {
          "Fabric": "100% Pure Cambric Cotton",
          "Sleeve Length": "Three-Quarter Sleeves",
          "Pattern": "Handblock Floral Print"
        }
      },
      {
        source: "meesho",
        sourceProductId: "44910281",
        sourceUrl: "https://www.meesho.com/p/44910281",
        title: "Ergonomic Aluminium Foldable Laptop Stand with 7-Level Height Adjustment",
        slug: "meesho-foldable-aluminium-laptop-stand",
        description: "Universal cooling riser stand for 10-15.6 inch laptops, MacBook, and tablets with anti-slip silicone pads and heat ventilation.",
        images: [
          "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "DeskPro",
        category: "Tech & Gadgets",
        subcategory: "Stands & Mounts",
        priceINR: 349,
        originalPriceINR: 899,
        discountPercentage: 61,
        rating: 4.6,
        reviewCount: 1890,
        availability: "in_stock",
        isFlashSale: true,
        isDeal: true,
        dealBadge: "Flash Deal",
        trendingScore: 88,
        badges: ["FLASH SALE", "61% OFF"],
        tags: ["laptop-stand", "desk-accessory", "ergonomic", "wfh"],
        specs: {
          "Material": "Aviation Grade Aluminium Alloy",
          "Weight Capacity": "Up to 15 kg",
          "Folded Size": "24 cm x 4.5 cm"
        }
      },
      {
        source: "meesho",
        sourceProductId: "55819201",
        sourceUrl: "https://www.meesho.com/p/55819201",
        title: "Smart Thermos Stainless Steel Temperature Display Water Bottle 500ml",
        slug: "meesho-smart-temperature-display-bottle",
        description: "Double-walled vacuum insulated flask with smart LED touch temperature lid. Keeps beverages hot for 12h or cold for 24h.",
        images: [
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "HydroSmart",
        category: "Everyday Essentials",
        subcategory: "Flasks & Bottles",
        priceINR: 399,
        originalPriceINR: 999,
        discountPercentage: 60,
        rating: 4.5,
        reviewCount: 3100,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "Trending 60% OFF",
        isTrending: true,
        trendingScore: 89,
        badges: ["TRENDING", "60% OFF"],
        tags: ["flask", "temperature-display", "water-bottle", "gym"],
        variants: [
          { name: "Color", values: ["Matte Black", "Rose Gold", "Navy Blue", "Silver"] }
        ],
        specs: {
          "Capacity": "500 ml",
          "Material": "Food Grade 304 Stainless Steel",
          "Battery Life": "500 days built-in LED lid"
        }
      },
      {
        source: "meesho",
        sourceProductId: "66728192",
        sourceUrl: "https://www.meesho.com/p/66728192",
        title: "Korean Aesthetic Minimalist Canvas Crossbody Shoulder Bag",
        slug: "meesho-korean-canvas-crossbody-bag",
        description: "Chic aesthetic daily college and casual messenger tote bag with multiple pockets, durable zipper, and adjustable strap.",
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "SeoulVibe",
        category: "Fashion",
        subcategory: "Bags",
        priceINR: 429,
        originalPriceINR: 1099,
        discountPercentage: 61,
        rating: 4.6,
        reviewCount: 1540,
        availability: "in_stock",
        isNewArrival: true,
        isDeal: true,
        dealBadge: "New Trend",
        trendingScore: 84,
        badges: ["NEW ARRIVAL", "61% OFF"],
        tags: ["canvas-bag", "korean-style", "tote", "crossbody", "women-bags"],
        variants: [
          { name: "Color", values: ["Off White", "Olive Green", "Charcoal Black"] }
        ],
        specs: {
          "Material": "Heavy-Duty Cotton Canvas",
          "Compartments": "1 Main zipper + 2 Outer pockets + 1 Inner slip"
        }
      },
      {
        source: "meesho",
        sourceProductId: "77819283",
        sourceUrl: "https://www.meesho.com/p/77819283",
        title: "Automatic Wireless Water Dispenser Pump for 20L Water Cans",
        slug: "meesho-automatic-water-can-dispenser-pump",
        description: "USB rechargeable smart drinking water pump dispenser with silicon food-grade hose, one-touch dispensing, and fast USB-C charging.",
        images: [
          "https://images.unsplash.com/photo-1584285418504-0051b3d37704?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "AquaFlow",
        category: "Everyday Essentials",
        subcategory: "Home Appliances",
        priceINR: 299,
        originalPriceINR: 699,
        discountPercentage: 57,
        rating: 4.4,
        reviewCount: 2890,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 3,
        isDeal: true,
        dealBadge: "Daily Steal",
        trendingScore: 86,
        badges: ["DAILY STEAL", "57% OFF"],
        tags: ["water-pump", "kitchen", "home-essentials", "rechargeable"],
        specs: {
          "Battery": "1200mAh USB Rechargeable",
          "Compatibility": "Standard 20L, 15L & 10L Canisters"
        }
      },
      {
        source: "meesho",
        sourceProductId: "88910293",
        sourceUrl: "https://www.meesho.com/p/88910293",
        title: "Ceramic Electric Coffee Mug Warmer Set with Spoon & Gift Box",
        slug: "meesho-ceramic-coffee-mug-warmer-set",
        description: "Smart 55°C constant temperature heating coaster plate with ceramic matching lid mug. Perfect for coffee, tea, and warm milk at desk.",
        images: [
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "WarmCup",
        category: "Everyday Essentials",
        subcategory: "Kitchenware",
        priceINR: 599,
        originalPriceINR: 1499,
        discountPercentage: 60,
        rating: 4.7,
        reviewCount: 1420,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "60% OFF Deal",
        trendingScore: 85,
        badges: ["GIFT CHOICE", "60% OFF"],
        tags: ["coffee-warmer", "ceramic-mug", "desk-accessory", "tea"],
        variants: [
          { name: "Color", values: ["Emerald Green", "Pastel Pink", "Classic White"] }
        ],
        specs: {
          "Heating Temp": "Constant 55°C (131°F)",
          "Auto Shutoff": "Gravity Sensor Power On/Off"
        }
      }
    ];
  }
};
