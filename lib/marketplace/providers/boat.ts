import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const BoatProvider: MarketplaceProvider = {
  id: "boat",
  name: "boAt",
  displayName: "boAt Lifestyle",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "boat",
        sourceProductId: "BOAT-AIR-141",
        sourceUrl: "https://www.boat-lifestyle.com/products/airdopes-141",
        title: "boAt Airdopes 141 ANC with 32dB Active Noise Cancellation & 42H Playtime",
        slug: "boat-airdopes-141-anc-earbuds",
        description: "True wireless earbuds with 32dB active noise cancellation, beast mode 50ms low latency for gaming, ENx quad mic tech, and ASAP charge.",
        images: [
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "boAt",
        category: "Tech & Gadgets",
        subcategory: "Wireless Earbuds",
        priceINR: 1499,
        originalPriceINR: 4490,
        discountPercentage: 67,
        rating: 4.6,
        reviewCount: 6840,
        availability: "in_stock",
        isFlashSale: true,
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "67% OFF Super Deal",
        isTrending: true,
        trendingScore: 97,
        badges: ["67% OFF SUPER DEAL", "#1 BEST SELLER"],
        tags: ["boat", "earbuds", "anc", "bluetooth", "gaming", "audio"],
        variants: [
          { name: "Color", values: ["Bold Black", "Cider Pink", "Gunmetal Gray"] }
        ],
        specs: {
          "Noise Cancellation": "Up to 32 dB Active Noise Cancellation",
          "Playtime": "Up to 42 Hours Total Playback",
          "Low Latency": "50ms Beast™ Mode",
          "Fast Charging": "10 Mins Charge = 150 Mins Playtime"
        }
      },
      {
        source: "boat",
        sourceProductId: "BOAT-WAV-FLEX",
        sourceUrl: "https://www.boat-lifestyle.com/products/wave-flex-connect",
        title: "boAt Wave Flex Connect 1.83\" HD Display Bluetooth Calling Smartwatch",
        slug: "boat-wave-flex-connect-smartwatch",
        description: "Large 1.83\" high-definition display, clear Bluetooth hands-free calling with dial pad, 20+ active sports modes, and heart rate/SpO2 health tracker.",
        images: [
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "boAt",
        category: "Watches",
        subcategory: "Smartwatches",
        priceINR: 1499,
        originalPriceINR: 7990,
        discountPercentage: 81,
        rating: 4.4,
        reviewCount: 4210,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "81% OFF Mega Flash",
        trendingScore: 94,
        badges: ["81% OFF MEGA FLASH", "#1 SMARTWATCH"],
        tags: ["smartwatch", "boat", "calling-watch", "fitness-tracker", "wearable"],
        variants: [
          { name: "Color", values: ["Active Black", "Deep Blue", "Cherry Blossom"] }
        ],
        specs: {
          "Screen Size": "1.83\" 2.5D Curved HD Display (550 Nits)",
          "Calling": "BT Calling with Inbuilt Speaker & Microphone",
          "Water Resistance": "IP68 Dust and Water Resistant"
        }
      },
      {
        source: "boat",
        sourceProductId: "BOAT-STN-650",
        sourceUrl: "https://www.boat-lifestyle.com/products/stone-650",
        title: "boAt Stone 650 10W Wireless Bluetooth Speaker with Subwoofer Bass",
        slug: "boat-stone-650-wireless-speaker",
        description: "Rugged diamond-grille outdoor portable wireless speaker with 10W stereo audio, deep bass radiators, and IPX5 water resistance.",
        images: [
          "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "boAt",
        category: "Tech & Gadgets",
        subcategory: "Bluetooth Speakers",
        priceINR: 1799,
        originalPriceINR: 4990,
        discountPercentage: 64,
        rating: 4.7,
        reviewCount: 5120,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "64% OFF Speaker Deal",
        trendingScore: 93,
        badges: ["HEAVY BASS", "64% OFF"],
        tags: ["speaker", "boat", "bluetooth", "waterproof", "audio"],
        variants: [
          { name: "Color", values: ["Charcoal Black", "Navy Blue", "Rogue Red"] }
        ],
        specs: {
          "Sound Output": "10W RMS Dynamic Sound",
          "Battery": "Up to 7 Hours Continuous Playback",
          "Protection": "IPX5 Splash & Water Resistant"
        }
      },
      {
        source: "boat",
        sourceProductId: "BOAT-RCK-255PRO",
        sourceUrl: "https://www.boat-lifestyle.com/products/rockerz-255-pro-plus",
        title: "boAt Rockerz 255 Pro+ Wireless Bluetooth Neckband with 60H Battery",
        slug: "boat-rockerz-255-pro-plus-neckband",
        description: "Signature 10mm drivers, ASAP Charge (10 mins = 10 hours), IPX7 water/sweat resistance, and dual pairing Bluetooth 5.2.",
        images: [
          "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "boAt",
        category: "Tech & Gadgets",
        subcategory: "Wireless Neckband",
        priceINR: 1299,
        originalPriceINR: 3990,
        discountPercentage: 67,
        rating: 4.6,
        reviewCount: 9200,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        trendingScore: 96,
        badges: ["60H BATTERY", "67% OFF"],
        tags: ["neckband", "boat", "bluetooth-earphones", "sports"],
        variants: [
          { name: "Color", values: ["Active Black", "Navy Blue", "Teal Green"] }
        ],
        specs: {
          "Battery Life": "Up to 60 Hours Total Playback",
          "Water Resistance": "IPX7 Sweat & Water Proof",
          "Fast Charging": "ASAP Charge 10 min = 10 hours"
        }
      }
    ];
  }
};
