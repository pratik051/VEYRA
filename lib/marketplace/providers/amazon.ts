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
        sourceProductId: "B08N5XSG8Z",
        sourceUrl: "https://www.amazon.in/dp/B08N5XSG8Z",
        title: "Echo Dot (4th Gen) Smart speaker with Alexa - Deep Bass Sound",
        slug: "amazon-echo-dot-4th-gen-alexa",
        description: "Voice control your music and smart home. Stream songs from Amazon Music, Spotify, Apple Music, and JioSaavn.",
        images: [
          "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Amazon",
        category: "Tech & Gadgets",
        subcategory: "Smart Speakers",
        priceINR: 3499,
        originalPriceINR: 4499,
        discountPercentage: 22,
        rating: 4.6,
        reviewCount: 3840,
        availability: "in_stock",
        isFlashSale: true,
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "Today's Deal",
        isTrending: true,
        trendingScore: 94,
        badges: ["TODAY'S DEAL", "#1 BEST SELLER"],
        tags: ["alexa", "speaker", "smart-home", "bluetooth", "gadget"],
        variants: [
          { name: "Color", values: ["Black", "White", "Blue"] }
        ],
        specs: {
          "Audio": "1.6\" front-firing speaker",
          "Connectivity": "Dual-band Wi-Fi & Bluetooth",
          "Voice Assistant": "Alexa Built-in",
          "Power": "15W Power adapter included"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "B0BDK62V19",
        sourceUrl: "https://www.amazon.in/dp/B0BDK62V19",
        title: "Kindle Paperwhite 16GB (6.8\" Glare-Free Display, Warm Light)",
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
        reviewCount: 1950,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 2,
        isTrending: true,
        trendingScore: 92,
        badges: ["#2 BEST SELLER"],
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
        sourceProductId: "B09G96TFF7",
        sourceUrl: "https://www.amazon.in/dp/B09G96TFF7",
        title: "Fire TV Stick 4K with Alexa Voice Remote (includes TV controls)",
        slug: "amazon-fire-tv-stick-4k",
        description: "Cinematic 4K streaming with Dolby Vision, HDR10+, and immersive Dolby Atmos audio.",
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
        reviewCount: 4210,
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
          "Wi-Fi": "Wi-Fi 6 Support"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "B09V4G9T1Q",
        sourceUrl: "https://www.amazon.in/dp/B09V4G9T1Q",
        title: "Daily Multi-Pocket Ergonomic Water-Resistant Laptop Backpack",
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
