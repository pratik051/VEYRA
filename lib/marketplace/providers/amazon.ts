import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const AmazonIndiaProvider: MarketplaceProvider = {
  id: "amazon-india",
  name: "Amazon India",
  displayName: "Amazon India",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "amazon-india",
        sourceProductId: "AMZ-ECHO-DOT-5",
        sourceUrl: "https://www.amazon.in/s?k=Echo+Dot+5th+Gen+Smart+speaker+with+Alexa",
        title: "Echo Dot (5th Gen) Smart Speaker with Bigger Sound, Motion Detection & Alexa",
        slug: "amazon-echo-dot-5th-gen-alexa",
        description: "Best sounding Echo Dot yet: Enjoy an improved audio experience compared to any previous Echo Dot with Alexa for clearer vocals, deeper bass, and vibrant sound in any room.",
        images: [
          "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Amazon",
        category: "Tech & Gadgets",
        subcategory: "Smart Speakers",
        priceINR: 4499,
        originalPriceINR: 5499,
        discountPercentage: 18,
        rating: 4.6,
        reviewCount: 5840,
        availability: "in_stock",
        isFlashSale: true,
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "Today's Deal",
        isTrending: true,
        trendingScore: 96,
        badges: ["TODAY'S DEAL", "#1 BEST SELLER"],
        tags: ["alexa", "speaker", "smart-home", "bluetooth", "gadget", "amazon"],
        variants: [
          { name: "Color", values: ["Black", "Glacier White", "Deep Sea Blue"] }
        ],
        specs: {
          "Audio": "1.73\" front-firing speaker",
          "Connectivity": "Dual-band Wi-Fi & Bluetooth",
          "Voice Assistant": "Alexa Built-in",
          "Sensors": "Motion detection + Temperature sensor"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "AMZ-KINDLE-PW-16",
        sourceUrl: "https://www.amazon.in/s?k=Kindle+Paperwhite+16GB",
        title: "Kindle Paperwhite 16GB (6.8\" Glare-Free Display, Adjustable Warm Light, IPX8)",
        slug: "amazon-kindle-paperwhite-16gb",
        description: "Now with a 6.8\" display and thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster page turns.",
        images: [
          "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Amazon",
        category: "Tech & Gadgets",
        subcategory: "E-Readers",
        priceINR: 13999,
        originalPriceINR: 14999,
        discountPercentage: 7,
        rating: 4.8,
        reviewCount: 3950,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 2,
        isTrending: true,
        trendingScore: 92,
        badges: ["#2 BEST SELLER", "WARM LIGHT"],
        tags: ["kindle", "books", "reading", "ereader", "amazon"],
        variants: [
          { name: "Storage", values: ["16GB", "32GB Signature Edition"] }
        ],
        specs: {
          "Display": "6.8\" Paperwhite display with 300 ppi",
          "Waterproofing": "IPX8 waterproof",
          "Battery Life": "Up to 10 weeks on single charge",
          "Weight": "205 grams"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "AMZ-FIRETV-4K",
        sourceUrl: "https://www.amazon.in/s?k=Fire+TV+Stick+4K+with+Alexa+Voice+Remote",
        title: "Fire TV Stick 4K with Alexa Voice Remote (Dolby Vision, HDR10+, Dolby Atmos)",
        slug: "amazon-fire-tv-stick-4k",
        description: "Cinematic 4K streaming with Dolby Vision, HDR10+, and immersive Dolby Atmos audio. Access 12,000+ apps and channels.",
        images: [
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Amazon",
        category: "Tech & Gadgets",
        subcategory: "Streaming Devices",
        priceINR: 3999,
        originalPriceINR: 5999,
        discountPercentage: 33,
        rating: 4.7,
        reviewCount: 6210,
        availability: "in_stock",
        isFlashSale: true,
        isBestSeller: true,
        bestsellerRank: 3,
        isDeal: true,
        dealBadge: "Lightning Deal",
        trendingScore: 95,
        badges: ["LIGHTNING DEAL", "33% OFF"],
        tags: ["firetv", "streaming", "4k", "alexa", "entertainment"],
        specs: {
          "Resolution": "4K Ultra HD up to 60fps",
          "Audio": "Dolby Atmos Audio",
          "Wi-Fi": "Wi-Fi 6 Support",
          "Remote": "Alexa Voice Remote with TV Power & Volume"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "AMZ-OP-NORD-CE4",
        sourceUrl: "https://www.amazon.in/s?k=OnePlus+Nord+CE4+5G",
        title: "OnePlus Nord CE4 5G (8GB RAM, 128GB Storage, 100W SUPERVOOC, 5500mAh)",
        slug: "amazon-oneplus-nord-ce4-5g-smartphone",
        description: "Qualcomm Snapdragon 7 Gen 3 powerhouse with 120Hz Fluid AMOLED display, Sony LYT-600 OIS camera, and 100W ultra-fast charging.",
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "OnePlus",
        category: "Tech & Gadgets",
        subcategory: "Smartphones",
        priceINR: 24999,
        originalPriceINR: 26999,
        discountPercentage: 7,
        rating: 4.5,
        reviewCount: 8420,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "Amazon's Choice",
        trendingScore: 98,
        badges: ["AMAZON'S CHOICE", "100W FAST CHARGE"],
        tags: ["oneplus", "5g", "smartphone", "android", "fast-charging"],
        variants: [
          { name: "Color", values: ["Celadon Marble", "Dark Chrome"] },
          { name: "Storage", values: ["8GB+128GB", "8GB+256GB"] }
        ],
        specs: {
          "Processor": "Qualcomm Snapdragon 7 Gen 3",
          "Display": "6.7\" 120Hz AMOLED FHD+",
          "Camera": "50MP Sony LYT-600 with OIS",
          "Battery": "5500 mAh with 100W SUPERVOOC"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "AMZ-SONY-XM4",
        sourceUrl: "https://www.amazon.in/s?k=Sony+WH-1000XM4+Wireless+Noise+Cancelling+Headphones",
        title: "Sony WH-1000XM4 Industry Leading Wireless Active Noise Cancelling Headphones",
        slug: "amazon-sony-wh-1000xm4-anc-headphones",
        description: "Dual Noise Sensor technology with HD Noise Cancelling Processor QN1, Speak-to-chat, Multipoint Bluetooth connection and 30h battery.",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Sony",
        category: "Tech & Gadgets",
        subcategory: "Headphones",
        priceINR: 19990,
        originalPriceINR: 29990,
        discountPercentage: 33,
        rating: 4.8,
        reviewCount: 12400,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "Deal of the Month",
        isTrending: true,
        trendingScore: 97,
        badges: ["TOP RATED 4.8★", "33% OFF"],
        tags: ["sony", "headphones", "anc", "wireless", "audiophile"],
        variants: [
          { name: "Color", values: ["Black", "Silver", "Midnight Blue"] }
        ],
        specs: {
          "ANC": "Industry-leading Dual Sensor Noise Cancellation",
          "Battery": "Up to 30 Hours (10 min charge = 5 hours playback)",
          "Microphone": "Built-in Mic for clear calls with Alexa/Google Assistant"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "AMZ-BASICS-PB-20K",
        sourceUrl: "https://www.amazon.in/s?k=Amazon+Basics+20000mAh+22.5W+Fast+Charging+Power+Bank",
        title: "Amazon Basics 20000mAh 22.5W Fast Charging Power Bank (Triple Output, Type-C PD)",
        slug: "amazon-basics-20000mah-22w-power-bank",
        description: "Heavy-duty 20,000mAh external battery pack with Power Delivery 22.5W fast output, multi-protection circuitry, and metallic casing.",
        images: [
          "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Amazon Basics",
        category: "Mobile Accessories",
        subcategory: "Power Banks",
        priceINR: 1699,
        originalPriceINR: 3299,
        discountPercentage: 48,
        rating: 4.4,
        reviewCount: 4320,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "48% OFF",
        trendingScore: 88,
        badges: ["AMAZON BASICS", "48% OFF"],
        tags: ["powerbank", "amazonbasics", "type-c", "fast-charging", "battery"],
        specs: {
          "Capacity": "20,000 mAh Li-Polymer",
          "Max Output": "22.5W Fast Charging (PD + QC 3.0)",
          "Ports": "2x USB-A Output, 1x USB-C In/Out, 1x Micro-USB In"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "AMZ-SANDISK-128",
        sourceUrl: "https://www.amazon.in/s?k=SanDisk+Ultra+128GB+microSDXC+UHS-I+Memory+Card",
        title: "SanDisk Ultra 128GB microSDXC UHS-I Memory Card (140MB/s Read, Class 10, A1)",
        slug: "amazon-sandisk-ultra-128gb-microsd-card",
        description: "Ideal for Android smartphones, action cameras, tablets, and Nintendo Switch with fast 140MB/s transfer speed and A1 app performance.",
        images: [
          "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "SanDisk",
        category: "Tech & Gadgets",
        subcategory: "Storage",
        priceINR: 899,
        originalPriceINR: 1800,
        discountPercentage: 50,
        rating: 4.6,
        reviewCount: 22100,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "50% OFF",
        trendingScore: 92,
        badges: ["#1 BEST SELLER", "50% OFF"],
        tags: ["sandisk", "microsd", "storage", "memory-card", "accessories"],
        specs: {
          "Capacity": "128 GB",
          "Speed": "Up to 140 MB/s",
          "Class": "Class 10, U1, A1 rated"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "AMZ-BASICS-BP-DAILY",
        sourceUrl: "https://www.amazon.in/s?k=Amazon+Basics+Daily+Laptop+Backpack",
        title: "Amazon Basics Daily Multi-Pocket Ergonomic Water-Resistant Laptop Backpack",
        slug: "amazon-ergonomic-daily-laptop-backpack",
        description: "Durable lightweight travel and office backpack with dedicated 15.6 inch padded laptop compartment and anti-theft back pocket.",
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Amazon Basics",
        category: "Bags",
        subcategory: "Backpacks",
        priceINR: 1299,
        originalPriceINR: 2499,
        discountPercentage: 48,
        rating: 4.5,
        reviewCount: 890,
        availability: "in_stock",
        isNewArrival: true,
        isFlashSale: true,
        isDeal: true,
        dealBadge: "Deal of the Day",
        trendingScore: 84,
        badges: ["DEAL OF THE DAY", "48% OFF"],
        tags: ["backpack", "laptop-bag", "office", "travel", "water-resistant"],
        variants: [
          { name: "Color", values: ["Obsidian Black", "Slate Gray", "Navy Blue"] }
        ],
        specs: {
          "Capacity": "28 Liters",
          "Material": "Water-Repellent Polyester",
          "Laptop Fit": "Up to 15.6 inches"
        }
      }
    ];
  },

  async searchProducts(query: string): Promise<MarketplaceProduct[]> {
    const all = await this.getProducts();
    const q = query.toLowerCase();
    return all.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
};
