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
        sourceProductId: "B0D96JNKFN",
        sourceUrl: "https://www.amazon.in/Charging-Devices-Simultaneously-Smartphones-Speakers/dp/B0D96JNKFN",
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
        sourceProductId: "B071Z8M4KX",
        sourceUrl: "https://www.amazon.in/dp/B071Z8M4KX",
        title: "boAt Bassheads 100 in-Ear Wired Headphones with Super Extra Bass & Mic",
        slug: "amazon-boat-bassheads-100-wired-earphones",
        description: "The #1 all-time bestselling wired earphones in India with 10mm dynamic drivers, hawk-inspired ergonomic design, and in-line microphone.",
        images: [
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "boAt",
        category: "Tech & Gadgets",
        subcategory: "Earphones",
        priceINR: 399,
        originalPriceINR: 999,
        discountPercentage: 60,
        rating: 4.5,
        reviewCount: 384000,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isFlashSale: true,
        isDeal: true,
        dealBadge: "60% OFF Mega Deal",
        isTrending: true,
        trendingScore: 99,
        badges: ["#1 ALL TIME BEST SELLER", "60% OFF"],
        tags: ["boat", "bassheads", "earphones", "audio", "wired"],
        variants: [
          { name: "Color", values: ["Furious Red", "Black", "White", "Taffy Pink"] }
        ],
        specs: {
          "Drivers": "10mm Dynamic Bass Drivers",
          "Connector": "3.5mm Gold-Plated Audio Jack",
          "Cable": "1.2m Tangle-Free Cable with Inline Mic"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "B01SX0R424",
        sourceUrl: "https://www.amazon.in/dp/B01SX0R424",
        title: "SanDisk Ultra Dual 64GB USB 3.0 OTG Flash Drive for Smartphones & Computers",
        slug: "amazon-sandisk-ultra-dual-64gb-otg-drive",
        description: "Dual micro-USB and high-speed USB 3.0 connectors to easily transfer files between OTG-enabled Android devices and PCs up to 150MB/s.",
        images: [
          "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "SanDisk",
        category: "Tech & Gadgets",
        subcategory: "Storage",
        priceINR: 599,
        originalPriceINR: 1150,
        discountPercentage: 48,
        rating: 4.6,
        reviewCount: 92400,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "48% OFF",
        trendingScore: 94,
        badges: ["#1 BEST SELLER", "DUAL OTG"],
        tags: ["sandisk", "pendrive", "otg", "usb3", "storage"],
        specs: {
          "Capacity": "64 GB",
          "Speed": "Up to 150 MB/s High-Speed USB 3.0",
          "Compatibility": "Dual Micro-USB & USB 3.0 Connectors"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "B0BY8JZ22K",
        sourceUrl: "https://www.amazon.in/dp/B0BY8JZ22K",
        title: "OnePlus Nord CE 3 Lite 5G (8GB RAM, 128GB Storage, 108MP Camera, 67W SUPERVOOC)",
        slug: "amazon-oneplus-nord-ce3-lite-5g-smartphone",
        description: "Powered by Qualcomm Snapdragon 695 5G processor, stunning 108MP primary camera with 3x lossless zoom, and 67W fast charging.",
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "OnePlus",
        category: "Tech & Gadgets",
        subcategory: "Smartphones",
        priceINR: 16999,
        originalPriceINR: 19999,
        discountPercentage: 15,
        rating: 4.5,
        reviewCount: 48200,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "Amazon's Choice",
        trendingScore: 98,
        badges: ["AMAZON'S CHOICE", "108MP CAMERA"],
        tags: ["oneplus", "5g", "smartphone", "android", "fast-charging"],
        variants: [
          { name: "Color", values: ["Pastel Lime", "Chromatic Gray"] },
          { name: "Storage", values: ["8GB+128GB", "8GB+256GB"] }
        ],
        specs: {
          "Processor": "Qualcomm Snapdragon 695 5G",
          "Display": "6.72\" 120Hz FHD+ Adaptive Refresh",
          "Camera": "108MP Triple Camera System with 3x Zoom",
          "Battery": "5000 mAh with 67W SUPERVOOC Fast Charge"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "B09NVPSCQT",
        sourceUrl: "https://www.amazon.in/dp/B09NVPSCQT",
        title: "Noise ColorFit Pulse Grand 1.69\" HD Display Smartwatch with 60 Sports Modes",
        slug: "amazon-noise-colorfit-pulse-grand-smartwatch",
        description: "1.69\" vivid curved glass display, 24/7 heart rate and SpO2 monitor, IP68 water resistance, and 150+ cloud-based watch faces.",
        images: [
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Noise",
        category: "Watches",
        subcategory: "Smartwatches",
        priceINR: 1299,
        originalPriceINR: 3999,
        discountPercentage: 68,
        rating: 4.4,
        reviewCount: 118000,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isFlashSale: true,
        isDeal: true,
        dealBadge: "68% OFF Mega Deal",
        trendingScore: 97,
        badges: ["#1 SMARTWATCH", "68% OFF"],
        tags: ["noise", "smartwatch", "fitness", "pulse-grand", "wearable"],
        variants: [
          { name: "Color", values: ["Jet Black", "Champagne Grey", "Rose Pink", "Electric Blue"] }
        ],
        specs: {
          "Display": "1.69\" LCD Screen (240x280 px)",
          "Battery Life": "Up to 7 Days Battery Life (Fast Charging 15 min = 1 day)",
          "Water Resistance": "IP68 Water Resistant"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "B098NS6PVG",
        sourceUrl: "https://www.amazon.in/dp/B098NS6PVG",
        title: "Portronics Konnect L 1.2M Fast Charging Type-C to Type-C Braided Cable (65W)",
        slug: "amazon-portronics-konnect-typec-cable",
        description: "Heavy duty nylon braided 65W Power Delivery cable with reinforced zinc alloy metal connectors and 480Mbps data transfer.",
        images: [
          "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Portronics",
        category: "Mobile Accessories",
        subcategory: "Cables",
        priceINR: 249,
        originalPriceINR: 699,
        discountPercentage: 64,
        rating: 4.5,
        reviewCount: 32000,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "64% OFF",
        trendingScore: 89,
        badges: ["65W FAST CHARGE", "64% OFF"],
        tags: ["portronics", "type-c", "cable", "fast-charging", "mobile"],
        specs: {
          "Power": "65W Power Delivery Fast Charging",
          "Length": "1.2 Meters Nylon Braided",
          "Data Transfer": "480 Mbps High Speed"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "B08HN62F2C",
        sourceUrl: "https://www.amazon.in/dp/B08HN62F2C",
        title: "Wipro 16A Wi-Fi Smart Plug with Energy Monitoring & Alexa Voice Control",
        slug: "amazon-wipro-16a-smart-plug-energy-monitor",
        description: "Control heavy home appliances like Geysers, ACs and Microwaves from anywhere with the Wipro Next Smart App, Alexa and Google Assistant.",
        images: [
          "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Wipro",
        category: "Tech & Gadgets",
        subcategory: "Smart Home",
        priceINR: 999,
        originalPriceINR: 2290,
        discountPercentage: 56,
        rating: 4.6,
        reviewCount: 45000,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "56% OFF",
        trendingScore: 93,
        badges: ["#1 SMART PLUG", "ENERGY MONITOR"],
        tags: ["wipro", "smart-plug", "alexa", "energy-meter", "smart-home"],
        specs: {
          "Current Rating": "16 Amp (Suitable for AC, Geyser, Water Heater)",
          "Wireless": "Direct 2.4GHz Wi-Fi (No Hub Required)",
          "Monitoring": "Real-time energy consumption statistics"
        }
      },
      {
        source: "amazon-india",
        sourceProductId: "B00N4OBBXK",
        sourceUrl: "https://www.amazon.in/dp/B00N4OBBXK",
        title: "Amazon Basics Extended Gaming Mouse Pad Desk Mat (Anti-Fray Stitched Edges)",
        slug: "amazon-basics-extended-gaming-mouse-pad",
        description: "Extra-large gaming desk pad with high-quality cloth surface for smooth glide and non-slip rubber base to keep your keyboard and mouse in place.",
        images: [
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Amazon Basics",
        category: "Everyday Essentials",
        subcategory: "Desk Accessories",
        priceINR: 499,
        originalPriceINR: 995,
        discountPercentage: 50,
        rating: 4.7,
        reviewCount: 88000,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "50% OFF",
        trendingScore: 92,
        badges: ["AMAZON BASICS", "50% OFF"],
        tags: ["mouse-pad", "desk-mat", "amazonbasics", "gaming", "office"],
        specs: {
          "Dimensions": "900 x 400 x 3 mm (Extended XXL)",
          "Material": "Micro-Weave Cloth + Natural Rubber Base",
          "Edges": "Reinforced Anti-Fray Stitched Border"
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
