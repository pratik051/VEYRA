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
        sourceProductId: "MSH-CLEAN-7IN1",
        sourceUrl: "https://www.meesho.com/search?q=7+in+1+Tech+Cleaning+Kit",
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
        sourceProductId: "MSH-LEATHER-WALLET",
        sourceUrl: "https://www.meesho.com/search?q=Men+Leather+Wallet+RFID",
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
        isDeal: true,
        dealBadge: "58% OFF",
        trendingScore: 84,
        badges: ["GENUINE LEATHER", "58% OFF"],
        tags: ["wallet", "leather", "accessories", "rfid", "mens-wallet"],
        variants: [
          { name: "Color", values: ["Vintage Tan", "Deep Coffee", "Classic Black"] }
        ],
        specs: {
          "Material": "100% Top-Grain Leather",
          "Slots": "8 Card Slots + ID Window + 2 Cash Compartments",
          "Security": "RFID Blocking Technology"
        }
      },
      {
        source: "meesho",
        sourceProductId: "MSH-ANARKALI-KURTI",
        sourceUrl: "https://www.meesho.com/search?q=Cotton+Anarkali+Kurti+Set",
        title: "Floral Printed Pure Cotton Anarkali Kurti with Pant & Dupatta Set",
        slug: "meesho-cotton-anarkali-kurti-set",
        description: "Traditional Jaipuri block floral printed pure cotton flared Anarkali kurti set paired with matching ankle pant and chiffon dupatta.",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Jaipuri Libas",
        category: "Fashion",
        subcategory: "Ethnic Wear",
        priceINR: 899,
        originalPriceINR: 2199,
        discountPercentage: 59,
        rating: 4.7,
        reviewCount: 5410,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "59% OFF Maha Deal",
        isTrending: true,
        trendingScore: 94,
        badges: ["#1 ETHNIC WEAR", "59% OFF"],
        tags: ["kurti", "anarkali", "ethnic", "cotton", "suit-set"],
        variants: [
          { name: "Size", values: ["M", "L", "XL", "XXL", "3XL"] },
          { name: "Color", values: ["Royal Indigo", "Maroon Crimson", "Emerald Teal"] }
        ],
        specs: {
          "Fabric": "100% Breathable Cotton (60x60)",
          "Sleeve Length": "Three-Quarter Sleeves",
          "Dupatta Length": "2.2 Meters Chiffon"
        }
      },
      {
        source: "meesho",
        sourceProductId: "MSH-LAPTOP-STAND",
        sourceUrl: "https://www.meesho.com/search?q=Foldable+Aluminum+Laptop+Stand",
        title: "Ergonomic Foldable Aluminum Laptop Riser with 6-Level Height Adjustment",
        slug: "meesho-foldable-aluminum-laptop-stand",
        description: "Ultra-portable sturdy aluminum alloy laptop riser for desk, improving posture and ventilation for laptops up to 17 inches.",
        images: [
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "ErgoLift",
        category: "Tech & Gadgets",
        subcategory: "Laptop Accessories",
        priceINR: 349,
        originalPriceINR: 899,
        discountPercentage: 61,
        rating: 4.6,
        reviewCount: 3820,
        availability: "in_stock",
        isFlashSale: true,
        isDeal: true,
        dealBadge: "61% OFF Flash Sale",
        trendingScore: 89,
        badges: ["ERGO DESIGN", "61% OFF"],
        tags: ["laptop-stand", "aluminum", "ergonomic", "desk-setup", "accessories"],
        specs: {
          "Material": "Anodized Aluminum Alloy + Non-Slip Silicone",
          "Compatibility": "10\" to 17.3\" Laptops & Tablets",
          "Weight Capacity": "Up to 10 kg"
        }
      },
      {
        source: "meesho",
        sourceProductId: "MSH-SMART-THERMOS",
        sourceUrl: "https://www.meesho.com/search?q=Smart+LED+Temperature+Thermos",
        title: "Smart LED Temperature Display Vacuum Insulated Stainless Steel Bottle (500ml)",
        slug: "meesho-smart-led-temperature-thermos",
        description: "Double wall 304 food-grade stainless steel bottle with touch LED digital temperature display screen on lid. Keeps drinks hot/cold for 24h.",
        images: [
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "HydroSmart",
        category: "Everyday Essentials",
        subcategory: "Drinkware",
        priceINR: 299,
        originalPriceINR: 799,
        discountPercentage: 62,
        rating: 4.5,
        reviewCount: 4290,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 2,
        isDeal: true,
        dealBadge: "62% OFF",
        trendingScore: 91,
        badges: ["LED TOUCH DISPLAY", "62% OFF"],
        tags: ["thermos", "water-bottle", "smart-bottle", "stainless-steel", "travel"],
        variants: [
          { name: "Color", values: ["Matte Black", "Rose Gold", "Navy Blue", "Pearl White"] }
        ],
        specs: {
          "Capacity": "500 ml",
          "Insulation": "24h Cold / 12h Hot Vacuum Seal",
          "Lid Feature": "Waterproof LED Touch Screen (No charging required)"
        }
      },
      {
        source: "meesho",
        sourceProductId: "MSH-CANVAS-TOTE",
        sourceUrl: "https://www.meesho.com/search?q=Canvas+Shoulder+Tote+Bag",
        title: "Heavy-Duty Aesthetic Canvas Shoulder Tote Bag with Zipper & Inner Pockets",
        slug: "meesho-aesthetic-canvas-shoulder-tote-bag",
        description: "Spacious aesthetic cotton canvas tote bag with robust inner zipper pocket and sturdy reinforced shoulder straps.",
        images: [
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "BohoCarry",
        category: "Bags",
        subcategory: "Tote Bags",
        priceINR: 299,
        originalPriceINR: 799,
        discountPercentage: 62,
        rating: 4.7,
        reviewCount: 2980,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "Maha Super Deal",
        trendingScore: 88,
        badges: ["ECO FRIENDLY", "62% OFF"],
        tags: ["tote-bag", "canvas", "college-bag", "aesthetic", "cotton"],
        variants: [
          { name: "Print", values: ["Minimalist Leaves", "Vintage Bookstore", "Floral Sun"] }
        ],
        specs: {
          "Material": "12oz 100% Eco Cotton Canvas",
          "Dimensions": "15\" x 16\" x 4\"",
          "Closure": "Top Zipper + Internal Key Pocket"
        }
      },
      {
        source: "meesho",
        sourceProductId: "MSH-WATER-PUMP",
        sourceUrl: "https://www.meesho.com/search?q=Automatic+Water+Bottle+Dispenser",
        title: "Wireless Automatic Rechargeable Electric Water Bottle Pump Dispenser",
        slug: "meesho-automatic-rechargeable-water-dispenser",
        description: "One-touch electric water pump for standard 20L jars. USB rechargeable 1200mAh battery dispenses up to 6 large bottles on a single charge.",
        images: [
          "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "AquaPure",
        category: "Everyday Essentials",
        subcategory: "Home Appliances",
        priceINR: 249,
        originalPriceINR: 699,
        discountPercentage: 64,
        rating: 4.4,
        reviewCount: 6810,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 3,
        isDeal: true,
        dealBadge: "64% OFF",
        trendingScore: 86,
        badges: ["USB RECHARGEABLE", "64% OFF"],
        tags: ["water-pump", "kitchen-gadgets", "home-appliances", "rechargeable"],
        specs: {
          "Battery": "1200 mAh USB Rechargeable",
          "Tube": "Food Grade Silicone Hose (BPA Free)",
          "Fit": "Universal 2 to 5 Gallon Water Jars"
        }
      },
      {
        source: "meesho",
        sourceProductId: "MSH-MUG-WARMER",
        sourceUrl: "https://www.meesho.com/search?q=Smart+Coffee+Mug+Warmer",
        title: "Smart 3-Temperature USB Desktop Coffee & Tea Mug Warmer Plate (55°C)",
        slug: "meesho-smart-coffee-mug-warmer-plate",
        description: "Keep your coffee, tea, or milk constantly warm at your desk. Features auto shut-off, 3 heat settings (45°C/55°C/75°C), and waterproof glass panel.",
        images: [
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "WarmCup",
        category: "Everyday Essentials",
        subcategory: "Kitchen Gadgets",
        priceINR: 399,
        originalPriceINR: 999,
        discountPercentage: 60,
        rating: 4.6,
        reviewCount: 1980,
        availability: "in_stock",
        isNewArrival: true,
        isDeal: true,
        dealBadge: "60% OFF",
        trendingScore: 89,
        badges: ["DESK ESSENTIAL", "60% OFF"],
        tags: ["mug-warmer", "coffee", "desk-setup", "gadgets", "office"],
        variants: [
          { name: "Color", values: ["Matte Pink", "Nordic Green", "Pure White"] }
        ],
        specs: {
          "Temperature Levels": "45°C, 55°C, 75°C Adjustable",
          "Safety": "8-Hour Auto Power Off",
          "Power": "20W USB Powered"
        }
      }
    ];
  }
};
