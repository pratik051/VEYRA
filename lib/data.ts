import { Category, Coupon, Product, Review } from "@/lib/types";

export const categories: Category[] = [
  { id: "fashion", name: "Fashion", description: "Modern apparel, t-shirts, hoodies, jackets & daily wear.", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b", itemCount: 42 },
  { id: "footwear", name: "Footwear", description: "Sneakers, shoes & all-day comfort footwear styles.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", itemCount: 28 },
  { id: "watches", name: "Watches", description: "Smartwatches, chronographs & classic timepieces.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", itemCount: 19 },
  { id: "bags", name: "Bags", description: "Travel backpacks, crossbodies, totes & work carry.", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa", itemCount: 24 },
  { id: "accessories", name: "Accessories", description: "Leather wallets, belts, jewelry, caps & sunglasses.", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518", itemCount: 35 },
  { id: "beauty-lifestyle", name: "Beauty & Lifestyle", description: "Personal grooming, skincare accessories & wellness.", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9", itemCount: 16 },
  { id: "mobile-accessories", name: "Mobile Accessories", description: "Fast chargers, cables, magnetic cases & power banks.", image: "https://images.unsplash.com/photo-1601593346740-925612772716", itemCount: 45 },
  { id: "tech-gadgets", name: "Tech & Gadgets", description: "Wireless earbuds, speakers, mini keyboards & compact tech.", image: "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd", itemCount: 38 },
  { id: "everyday-essentials", name: "Everyday Essentials", description: "Compact daily-use tools, travel gear & home organizers.", image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a", itemCount: 22 }
];

export const products: Product[] = [
  // Tech & Gadgets
  {
    id: "P1001",
    slug: "premium-wireless-earbuds",
    name: "Premium ANC Wireless Earbuds",
    category: "Tech & Gadgets",
    brand: "VY Audio",
    price: 2499,
    originalPrice: 3200,
    rating: 4.8,
    reviews: 143,
    stock: 38,
    badge: "TRENDING",
    featured: true,
    trending: true,
    tags: ["earbuds", "wireless", "bluetooth", "gaming", "anc", "audio"],
    colors: ["Matte Black", "Pearl White", "Midnight Navy"],
    description: "Active Noise Cancellation, deep dynamic bass, 4-mic crystal clear call technology and up to 32 hours total playback with sleek compact charging case.",
    specs: {
      "Active Noise Cancellation": "Up to 35dB Hybrid ANC",
      "Bluetooth Version": "Bluetooth 5.3 Low Latency",
      "Battery Life": "8h earbuds + 24h case (32h total)",
      "Charging": "USB-C Fast Charging + Qi Wireless",
      "Water Resistance": "IPX5 Sweat & Splash Proof",
      "Warranty": "6 Months VEYRA Verified Warranty"
    },
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46",
    gallery: [
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b"
    ]
  },
  {
    id: "P1008",
    slug: "portable-bluetooth-speaker-mini",
    name: "SonicPulse Mini Bluetooth Speaker",
    category: "Tech & Gadgets",
    brand: "SonicPulse",
    price: 2199,
    originalPrice: 2800,
    rating: 4.6,
    reviews: 84,
    stock: 15,
    badge: "BEST SELLER",
    featured: true,
    trending: true,
    tags: ["speaker", "bluetooth", "portable", "audio", "travel"],
    colors: ["Obsidian Black", "Ocean Blue", "Forest Green"],
    description: "Pocket-size powerhouse with 360-degree acoustic bass radiators, durable IPX7 waterproof casing and 16 hours of continuous playtime.",
    specs: {
      "Output Power": "12W RMS 360° Sound",
      "Battery Life": "Up to 16 Hours Playback",
      "Waterproof Rating": "IPX7 Submersible",
      "Connectivity": "Bluetooth 5.3 + Aux-In",
      "Weight": "280g Ultra-portable"
    },
    image: "https://images.unsplash.com/photo-1589003077984-894e133dabab",
    gallery: [
      "https://images.unsplash.com/photo-1589003077984-894e133dabab",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d"
    ]
  },
  {
    id: "P1009",
    slug: "wireless-mechanical-rgb-keyboard",
    name: "KeyCraft 65% Wireless Mechanical Keyboard",
    category: "Tech & Gadgets",
    brand: "KeyCraft",
    price: 4999,
    originalPrice: 6500,
    rating: 4.9,
    reviews: 57,
    stock: 12,
    badge: "NEW",
    newArrival: true,
    featured: true,
    tags: ["keyboard", "mechanical", "gaming", "wireless", "rgb", "computer"],
    colors: ["Space Gray", "Retro Cream"],
    description: "Compact 68-key mechanical keyboard with hot-swappable tactile switches, pre-lubed stabilizers, per-key RGB backlighting and tri-mode connectivity (2.4G/BT/Type-C).",
    specs: {
      "Layout": "65% Compact (68 Keys)",
      "Switches": "Hot-swappable Custom Red/Brown",
      "Connectivity": "2.4GHz Dongle + BT 5.0 + USB-C",
      "Battery": "3000mAh Rechargable (Up to 200h)",
      "Keycaps": "Double-shot PBT Cherry Profile"
    },
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    gallery: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef"
    ]
  },
  {
    id: "P1010",
    slug: "ergonomic-wireless-mouse-silent",
    name: "AeroGlide Silent Wireless Mouse",
    category: "Tech & Gadgets",
    brand: "VoltEdge",
    price: 1499,
    originalPrice: 1999,
    rating: 4.5,
    reviews: 42,
    stock: 25,
    tags: ["mouse", "wireless", "ergonomic", "office", "silent"],
    colors: ["Matte Black", "Off White", "Slate Gray"],
    description: "Ultra-quiet 90% silent clicking with contoured ergonomic grip, adjustable 4000 DPI sensor and dual-device Bluetooth switching.",
    specs: {
      "Sensor": "High Precision Optical up to 4000 DPI",
      "Click Sound": "90% Noise Reduction Silent Switches",
      "Battery": "Single AA Battery up to 18 Months",
      "Compatibility": "Windows, macOS, iPadOS, Android"
    },
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
    gallery: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46"
    ]
  },

  // Footwear
  {
    id: "P1002",
    slug: "urban-sneaker-pro",
    name: "AeroStride Urban Sneaker Pro",
    category: "Footwear",
    brand: "AeroStride",
    price: 3899,
    originalPrice: 5200,
    rating: 4.7,
    reviews: 98,
    stock: 20,
    badge: "BEST SELLER",
    featured: true,
    trending: true,
    tags: ["sneakers", "shoes", "urban", "casual", "streetwear", "footwear"],
    colors: ["Triple Black", "Charcoal Gray", "Cloud White"],
    sizes: ["39", "40", "41", "42", "43", "44"],
    description: "Engineered breathable knit upper paired with shock-absorbing cloud foam midsole for all-day urban movement and effortless street aesthetics.",
    specs: {
      "Upper Material": "Breathable Engineered Knit + Microfiber",
      "Midsole": "High-rebound CloudFoam Cushioning",
      "Outsole": "Durable Anti-slip Vulcanized Rubber",
      "Fit": "True to standard European sizing",
      "Care": "Spot clean with damp cloth"
    },
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06",
    gallery: [
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06",
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a"
    ]
  },
  {
    id: "P1011",
    slug: "minimal-low-top-leather-sneakers",
    name: "Monochrome Low-Top Leather Sneakers",
    category: "Footwear",
    brand: "VY Footwear",
    price: 4299,
    originalPrice: 5800,
    rating: 4.6,
    reviews: 35,
    stock: 14,
    badge: "NEW",
    newArrival: true,
    tags: ["sneakers", "leather", "minimal", "casual", "shoes"],
    colors: ["Chalk White", "All Black"],
    sizes: ["40", "41", "42", "43"],
    description: "Sleek low-profile silhouette crafted with smooth vegan leather, padded ankle collars and minimalist stitch detailing for sharp everyday styling.",
    specs: {
      "Material": "Premium Vegan Leather Upper",
      "Sole": "Stitched Cupsole Rubber",
      "Insole": "Removable Memory Foam Footbed"
    },
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
    gallery: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77"]
  },

  // Watches
  {
    id: "P1003",
    slug: "classic-metal-watch",
    name: "Horizon Minimalist Chrono Watch",
    category: "Watches",
    brand: "VY Time",
    price: 2999,
    originalPrice: 4200,
    rating: 4.5,
    reviews: 54,
    stock: 16,
    newArrival: true,
    badge: "NEW",
    featured: true,
    tags: ["watch", "analog", "metal", "chronograph", "lifestyle"],
    colors: ["Brushed Silver", "Midnight Black", "Rose Gold Accent"],
    description: "Sophisticated analog timepiece with sapphire-coated mineral glass, Japanese quartz movement, sub-dials and interchangeable stainless steel mesh strap.",
    specs: {
      "Case Diameter": "41mm Ultra-slim (8.5mm thickness)",
      "Movement": "Precision Japanese Quartz",
      "Water Resistance": "5 ATM / 50M Water Resistant",
      "Glass": "Hardened Anti-scratch Mineral Crystal",
      "Strap": "Quick-release Stainless Steel Mesh"
    },
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
    gallery: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314",
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9"
    ]
  },
  {
    id: "P1012",
    slug: "smart-fitness-tracker-watch-amoled",
    name: "PulseFit AMOLED Smartwatch",
    category: "Watches",
    brand: "PulseFit",
    price: 3599,
    originalPrice: 4800,
    rating: 4.7,
    reviews: 73,
    stock: 22,
    badge: "TRENDING",
    trending: true,
    tags: ["smartwatch", "fitness", "amoled", "heart rate", "watch"],
    colors: ["Matte Black", "Titanium Gray"],
    description: "1.43-inch Always-On HD AMOLED display, Bluetooth calling, 100+ sports modes, 24/7 SpO2 & heart rate monitoring with up to 10 days battery life.",
    specs: {
      "Display": "1.43\" AMOLED 466x466 (Always-On)",
      "Battery Life": "Up to 10 Days Typical Use",
      "Health Tracking": "Heart Rate, SpO2, Sleep, Stress",
      "Calling": "Bluetooth HD Voice Calling with Mic/Speaker",
      "Water Rating": "IP68 Dust & Water Proof"
    },
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1",
    gallery: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
    ]
  },

  // Mobile Accessories
  {
    id: "P1004",
    slug: "fast-charge-adapter-65w",
    name: "VoltEdge 65W GaN Fast Charger",
    category: "Mobile Accessories",
    brand: "VoltEdge",
    price: 1799,
    originalPrice: 2300,
    rating: 4.6,
    reviews: 77,
    stock: 45,
    featured: true,
    badge: "SALE",
    tags: ["charger", "usb-c", "fast charge", "gan", "laptop", "mobile"],
    colors: ["Matte White", "Space Black"],
    description: "Next-gen Gallium Nitride (GaN) fast charger with 2x USB-C and 1x USB-A ports. Powers MacBooks, iPhones, Samsung flagships and earbuds simultaneously.",
    specs: {
      "Total Output": "65W Max Power Delivery 3.0",
      "Ports": "2 x USB-C (PD 3.0 / PPS) + 1 x USB-A (QC 4.0)",
      "Technology": "GaN III CoolPower Semiconductor",
      "Safety": "Over-heat, Over-voltage & Surge Protection"
    },
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0",
    gallery: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0"]
  },
  {
    id: "P1013",
    slug: "magsafe-magnetic-powerbank-10000mah",
    name: "MagHold 10,000mAh Magnetic Power Bank",
    category: "Mobile Accessories",
    brand: "VoltEdge",
    price: 2699,
    originalPrice: 3499,
    rating: 4.8,
    reviews: 61,
    stock: 30,
    badge: "BEST SELLER",
    trending: true,
    tags: ["powerbank", "magsafe", "wireless", "battery", "iphone", "mobile"],
    colors: ["Graphite Black", "Silver Gray"],
    description: "Strong N52 neodymium magnetic lock for wireless charging on the go. Features integrated fold-out kickstand and 20W PD bidirectional fast charging.",
    specs: {
      "Capacity": "10,000mAh Li-Polymer (38.5Wh)",
      "Wireless Output": "15W Fast Magnetic Wireless",
      "Wired Output": "20W Type-C Power Delivery",
      "Kickstand": "Aerospace Aluminum Folding Stand"
    },
    image: "https://images.unsplash.com/photo-1609592424368-2436d4df6c8c",
    gallery: [
      "https://images.unsplash.com/photo-1609592424368-2436d4df6c8c",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505"
    ]
  },
  {
    id: "P1014",
    slug: "braided-usb-c-cable-240w",
    name: "Heavy-Duty Kevlar Braided USB-C Cable (2M)",
    category: "Mobile Accessories",
    brand: "VoltEdge",
    price: 799,
    originalPrice: 1100,
    rating: 4.7,
    reviews: 119,
    stock: 60,
    tags: ["cable", "usb-c", "fast charge", "braided", "durable"],
    colors: ["Black / Gold", "Silver Gray"],
    description: "Ultra-durable Kevlar reinforced braided cable supporting up to 240W ultra-fast charging and 480Mbps data sync with smart E-marker chip.",
    specs: {
      "Length": "2.0 Meters (6.6 ft)",
      "Power Rating": "240W (48V/5A) PD 3.1 Certified",
      "Durability": "30,000+ Bend Tested Strain Relief"
    },
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
    gallery: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c"]
  },

  // Bags
  {
    id: "P1005",
    slug: "minimal-travel-backpack",
    name: "CarryLab Weatherproof Travel Backpack (28L)",
    category: "Bags",
    brand: "CarryLab",
    price: 2799,
    originalPrice: 3500,
    rating: 4.8,
    reviews: 112,
    stock: 25,
    trending: true,
    badge: "TRENDING",
    featured: true,
    tags: ["backpack", "travel", "bag", "laptop", "minimal", "waterproof"],
    colors: ["Stealth Black", "Olive Drab", "Slate Gray"],
    description: "Weather-resistant 900D Oxford nylon exterior, dedicated 16-inch padded laptop compartment, luggage strap pass-through and concealed anti-theft passport pocket.",
    specs: {
      "Capacity": "28 Liters (Cabin Approved Size)",
      "Laptop Sleeve": "Fleece-lined fits up to 16\" MacBook Pro",
      "Material": "900D Water-repellent Ballistic Nylon",
      "Zippers": "YKK Weatherproof Sealed Zippers",
      "Weight": "850g Lightweight structure"
    },
    image: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7",
    gallery: [
      "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa"
    ]
  },
  {
    id: "P1015",
    slug: "minimalist-tech-sling-bag",
    name: "AeroSling Compact EDC Tech Bag",
    category: "Bags",
    brand: "CarryLab",
    price: 1899,
    originalPrice: 2499,
    rating: 4.7,
    reviews: 49,
    stock: 18,
    badge: "NEW",
    newArrival: true,
    tags: ["sling", "crossbody", "tech bag", "edc", "bags"],
    colors: ["Matte Black", "Dark Camo"],
    description: "Ergonomic crossbody sling bag designed for phone, keys, passport, mini tablet, wallet and charging cables with magnetic Fidlock buckle.",
    specs: {
      "Capacity": "4.5 Liters EDC",
      "Buckle": "Magnetic Quick-release Buckle",
      "Pockets": "7 Organizational Compartments"
    },
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    gallery: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62"]
  },

  // Fashion
  {
    id: "P1006",
    slug: "oversized-premium-tee",
    name: "Heavyweight 260GSM Oversized Tee",
    category: "Fashion",
    brand: "VY Apparel",
    price: 1399,
    originalPrice: 1800,
    rating: 4.6,
    reviews: 66,
    stock: 60,
    newArrival: true,
    badge: "SALE",
    featured: true,
    tags: ["t-shirt", "fashion", "oversized", "streetwear", "cotton"],
    colors: ["Pitch Black", "Vintage Off-White", "Sage Green", "Mocha Brown"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Premium 260 GSM combed cotton with dense pre-shrunk weave, dropped shoulders and relaxed streetwear boxy drape that holds shape wash after wash.",
    specs: {
      "Fabric Weight": "260 GSM Heavyweight Cotton",
      "Fit Type": "Boxy Oversized Dropped Shoulder",
      "Collar": "Thick 1.25\" Ribbed Neckline",
      "Care": "Machine wash cold, air dry inside out"
    },
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    gallery: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a"
    ]
  },
  {
    id: "P1016",
    slug: "relaxed-fleece-hoodie-streetwear",
    name: "CozyCloud Heavy Fleece Hoodie",
    category: "Fashion",
    brand: "VY Apparel",
    price: 2499,
    originalPrice: 3200,
    rating: 4.8,
    reviews: 82,
    stock: 35,
    badge: "BEST SELLER",
    featured: true,
    tags: ["hoodie", "fleece", "fashion", "winter", "streetwear"],
    colors: ["Onyx Black", "Heather Gray", "Washed Olive"],
    sizes: ["M", "L", "XL"],
    description: "Ultra-plush 380 GSM fleece lined hoodie with double-layered structured hood, kangaroo pocket and seamless metal-tipped drawstrings.",
    specs: {
      "Fabric": "380 GSM Brushed Fleece (80% Cotton / 20% Poly)",
      "Hood": "Double-layered Structured Warm Hood",
      "Fit": "Relaxed Regular to Slightly Loose"
    },
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2",
    gallery: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2"]
  },
  {
    id: "P1017",
    slug: "urban-cargo-pants-stretch",
    name: "AeroFlex Tactical Cargo Pants",
    category: "Fashion",
    brand: "VY Apparel",
    price: 2299,
    originalPrice: 2999,
    rating: 4.5,
    reviews: 44,
    stock: 28,
    tags: ["pants", "cargo", "fashion", "tactical", "streetwear"],
    colors: ["Black", "Khaki", "Army Green"],
    sizes: ["30", "32", "34", "36"],
    description: "4-way stretch ripstop fabric with 6 deep functional utility pockets, adjustable elastic waist and tapered ankle cuffed bottoms.",
    specs: {
      "Material": "Cotton-Elastane Stretch Ripstop",
      "Pockets": "6 Pockets with Snap Flaps",
      "Waist": "Belt Loops + Integrated Drawstring"
    },
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80",
    gallery: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80"]
  },

  // Accessories
  {
    id: "P1007",
    slug: "polarized-sunglasses-eclipse",
    name: "Eclipse Polarized Hex Sunglasses",
    category: "Accessories",
    brand: "Lensory",
    price: 1599,
    originalPrice: 2300,
    rating: 4.5,
    reviews: 53,
    stock: 22,
    badge: "TRENDING",
    trending: true,
    tags: ["sunglasses", "uv400", "polarized", "accessories", "eyewear"],
    colors: ["Gloss Black / Dark Lens", "Tortoise / Green Lens"],
    description: "Precision TAC polarized lenses with 100% UV400 protection, lightweight metal alloy frame and comfortable silicone nose pads.",
    specs: {
      "Lens": "TAC Polarized UV400 Category 3",
      "Frame": "Corrosion-resistant Nickel-free Alloy",
      "Included": "Protective Hard Case + Microfiber Cleaning Cloth"
    },
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
    gallery: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083"]
  },
  {
    id: "P1018",
    slug: "slim-rfid-leather-wallet",
    name: "Slim Bifold RFID Shield Leather Wallet",
    category: "Accessories",
    brand: "VY Leather",
    price: 1299,
    originalPrice: 1799,
    rating: 4.7,
    reviews: 79,
    stock: 30,
    badge: "BEST SELLER",
    featured: true,
    tags: ["wallet", "leather", "rfid", "accessories", "gift"],
    colors: ["Cognac Brown", "Jet Black"],
    description: "Handcrafted genuine top-grain leather with built-in RFID blocking mesh. Holds up to 8 cards, currency bills and quick-draw thumb card slot.",
    specs: {
      "Material": "100% Genuine Top Grain Leather",
      "Security": "RFID Blocking Protection (13.56 MHz)",
      "Capacity": "8 Card Slots + Full Currency Note Pocket"
    },
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93",
    gallery: ["https://images.unsplash.com/photo-1627123424574-724758594e93"]
  },

  // Everyday Essentials
  {
    id: "P1019",
    slug: "insulated-stainless-steel-bottle-750ml",
    name: "HydroLock Vacuum Insulated Bottle (750ml)",
    category: "Everyday Essentials",
    brand: "HydroLock",
    price: 1499,
    originalPrice: 1999,
    rating: 4.8,
    reviews: 91,
    stock: 40,
    badge: "BEST SELLER",
    tags: ["bottle", "insulated", "travel", "essentials", "water bottle"],
    colors: ["Matte Charcoal", "Sand Beige", "Navy Blue"],
    description: "Double-wall vacuum insulated 18/8 food-grade stainless steel bottle. Keeps drinks icy cold for 24 hours or piping hot for 12 hours without condensation.",
    specs: {
      "Capacity": "750ml (25 oz)",
      "Insulation": "Cold 24h / Hot 12h",
      "Material": "BPA-Free 18/8 Pro Grade Stainless Steel",
      "Lid": "Leak-proof Straw Lid + Handle"
    },
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
    gallery: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8"]
  },
  {
    id: "P1020",
    slug: "precision-multi-tool-keychain",
    name: "TitanGrip 14-in-1 Compact Multi-Tool",
    category: "Everyday Essentials",
    brand: "TitanGrip",
    price: 1199,
    originalPrice: 1599,
    rating: 4.6,
    reviews: 38,
    stock: 25,
    badge: "NEW",
    newArrival: true,
    tags: ["multitool", "edc", "essentials", "travel", "compact"],
    colors: ["Gunmetal Gray", "Black"],
    description: "Pocket stainless steel multi-tool featuring pliers, wire cutters, pocket blade, screwdrivers, bottle opener and can opener with nylon belt holster.",
    specs: {
      "Tools": "14 Locking Tools in 1 Frame",
      "Steel": "420 Stainless Steel Hardened",
      "Folded Length": "7.2 cm Ultra-compact"
    },
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed",
    gallery: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed"]
  },

  // Beauty & Lifestyle
  {
    id: "P1021",
    slug: "rechargeable-cordless-grooming-trimmer",
    name: "ApexBlade Pro Cordless Grooming Trimmer",
    category: "Beauty & Lifestyle",
    brand: "ApexGroom",
    price: 1999,
    originalPrice: 2699,
    rating: 4.7,
    reviews: 64,
    stock: 20,
    badge: "TRENDING",
    tags: ["trimmer", "grooming", "shaver", "lifestyle", "personal care"],
    colors: ["Brushed Bronze", "Matte Black"],
    description: "Self-sharpening titanium T-blade with high-torque motor, LED digital battery display and 120 minutes continuous runtime from a single USB-C charge.",
    specs: {
      "Blade": "Zero-gapped Titanium Carbon T-Blade",
      "Motor": "7000 RPM Powerful Quiet Motor",
      "Battery": "1200mAh Lithium (120 min runtime)",
      "Guards": "Includes 1mm, 2mm, 3mm, 4mm Guard Combs"
    },
    image: "https://images.unsplash.com/photo-1621607512214-68297480165e",
    gallery: ["https://images.unsplash.com/photo-1621607512214-68297480165e"]
  }
];

export const sampleReviews: Review[] = [
  {
    id: "REV-101",
    productId: "P1001",
    author: "Siddhartha S. (Kathmandu)",
    rating: 5,
    date: "2 days ago",
    title: "Incredible ANC and bass response!",
    content: "Ordered these earbuds via VEYRA. Arrived in Kathmandu in perfect condition. The noise cancellation easily matches earphones twice the price.",
    verified: true
  },
  {
    id: "REV-102",
    productId: "P1002",
    author: "Aarav M. (Pokhara)",
    rating: 5,
    date: "1 week ago",
    title: "Super comfortable for walking all day",
    content: "Very lightweight sneakers and genuine build quality. Sizing fits true to European standard. Fast delivery service by VEYRA.",
    verified: true
  },
  {
    id: "REV-103",
    productId: "P1004",
    author: "Pooja B. (Lalitpur)",
    rating: 5,
    date: "2 weeks ago",
    title: "Powers my laptop and phone at the same time",
    content: "Compact GaN charger is a lifesaver. No overheating issues and charges my MacBook Pro at full speed.",
    verified: true
  }
];

export const coupons: Coupon[] = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    amount: 10,
    minOrder: 1500,
    description: "10% off on your order (Minimum order Rs. 1,500)"
  },
  {
    code: "VEYRA500",
    discountType: "fixed",
    amount: 500,
    minOrder: 3500,
    description: "Flat Rs. 500 discount on orders above Rs. 3,500"
  },
  {
    code: "FESTIVE15",
    discountType: "percentage",
    amount: 15,
    minOrder: 5000,
    description: "15% festive discount on orders above Rs. 5,000"
  }
];

export const supportedPlatforms = [
  { id: "amazon-india", name: "Amazon India", badge: "Most Popular", desc: "Electronics, Lifestyle & Daily Tech" },
  { id: "flipkart", name: "Flipkart", badge: "Trending", desc: "Fashion, Footwear & Smart Gadgets" },
  { id: "myntra", name: "Myntra", badge: "Fashion Pick", desc: "Apparel, Premium Brands & Footwear" },
  { id: "ajio", name: "AJIO", badge: "Curated Style", desc: "Streetwear, International Labels & Bags" },
  { id: "meesho", name: "Meesho", badge: "Budget Finds", desc: "Accessories, Wearables & Everyday Home" },
  { id: "nykaa", name: "Nykaa", badge: "Beauty & Care", desc: "Skincare, Beauty & Wellness Products" },
  { id: "bigbasket", name: "BigBasket", badge: "Grocery & Daily", desc: "Food, Beverages & Household Essentials" }
];

export const orderTimeline = [
  "Order Placed",
  "Payment Confirmed",
  "Product Processing",
  "Product Sourced",
  "In Transit",
  "Arrived in Nepal",
  "Out for Delivery",
  "Delivered"
];

export const nepalProvinces = [
  "Koshi Province (Province 1)",
  "Madhesh Province (Province 2)",
  "Bagmati Province (Province 3)",
  "Gandaki Province (Province 4)",
  "Lumbini Province (Province 5)",
  "Karnali Province (Province 6)",
  "Sudurpashchim Province (Province 7)"
];
