import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const NykaaProvider: MarketplaceProvider = {
  id: "nykaa",
  name: "Nykaa",
  displayName: "Nykaa",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "nykaa",
        sourceProductId: "NYK-MINIMALIST-10NIA",
        sourceUrl: "https://www.nykaa.com/search/result/?q=Minimalist+10%25+Niacinamide+Serum",
        title: "Minimalist 10% Niacinamide + Zinc 1% Blemish & Oil Control Face Serum",
        slug: "nykaa-minimalist-10-niacinamide-serum",
        description: "Aloe vera based lightweight daily facial serum to reduce sebum activity, fade hyperpigmentation, and strengthen skin barrier.",
        images: [
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Minimalist",
        category: "Beauty & Lifestyle",
        subcategory: "Skincare Serums",
        priceINR: 599,
        originalPriceINR: 649,
        discountPercentage: 8,
        rating: 4.8,
        reviewCount: 4120,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isTrending: true,
        trendingScore: 93,
        badges: ["#1 BEST SELLER", "VIRAL"],
        tags: ["skincare", "serum", "niacinamide", "minimalist", "beauty"],
        specs: {
          "Key Actives": "10% Pure Niacinamide (Vitamin B3) + 1% Zinc PCA",
          "Skin Type": "All Skin Types (Acne-Prone / Oily)",
          "Volume": "30 ml Glass Dropper Bottle"
        }
      },
      {
        source: "nykaa",
        sourceProductId: "NYK-MAYB-SUPERSTAY",
        sourceUrl: "https://www.nykaa.com/search/result/?q=Maybelline+Superstay+Matte+Ink",
        title: "Maybelline New York Superstay Matte Ink Liquid Lipstick",
        slug: "nykaa-maybelline-superstay-matte-ink",
        description: "Flawless matte liquid lipstick that lasts up to 16 hours. Highly-pigmented color formula with precision arrow applicator.",
        images: [
          "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Maybelline New York",
        category: "Beauty & Lifestyle",
        subcategory: "Cosmetics",
        priceINR: 524,
        originalPriceINR: 699,
        discountPercentage: 25,
        rating: 4.7,
        reviewCount: 5200,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "Nykaa Hot Pink Deal",
        trendingScore: 91,
        badges: ["HOT DEAL", "25% OFF"],
        tags: ["lipstick", "matte", "maybelline", "makeup", "beauty"],
        variants: [
          { name: "Shade", values: ["Seductress", "Pioneer", "Lover", "Ruler", "Amazonian"] }
        ],
        specs: {
          "Finish": "Super Matte No-Transfer",
          "Longevity": "16 Hours Long Wear",
          "Quantity": "5 ml"
        }
      },
      {
        source: "nykaa",
        sourceProductId: "NYK-DOTKEY-SUNSCREEN",
        sourceUrl: "https://www.nykaa.com/search/result/?q=Dot+and+Key+Sunscreen+SPF+50",
        title: "Dot & Key Vitamin C + E Super Bright Sunscreen Aqua Gel SPF 50+ PA+++",
        slug: "nykaa-dot-and-key-vitamin-c-sunscreen-spf50",
        description: "Zero white-cast, ultra-light water sunscreen infused with Vitamin C and Sicilian Blood Orange to protect against UV and blue light.",
        images: [
          "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Dot & Key",
        category: "Beauty & Lifestyle",
        subcategory: "Sunscreens",
        priceINR: 395,
        originalPriceINR: 495,
        discountPercentage: 20,
        rating: 4.8,
        reviewCount: 3890,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 2,
        isDeal: true,
        dealBadge: "20% OFF",
        isTrending: true,
        trendingScore: 95,
        badges: ["#2 BEST SELLER", "NO WHITE CAST"],
        tags: ["sunscreen", "dot-key", "spf50", "skincare", "glow"],
        specs: {
          "SPF": "SPF 50+ PA++++ Broad Spectrum",
          "Texture": "Water-Light Aqua Gel",
          "Net Weight": "50g"
        }
      },
      {
        source: "nykaa",
        sourceProductId: "NYK-LOREAL-EXTRA-OIL",
        sourceUrl: "https://www.nykaa.com/search/result/?q=Loreal+Extraordinary+Oil+Serum",
        title: "L'Oreal Paris Extraordinary Oil Hair Serum with 6 Rare Floral Extracts",
        slug: "nykaa-loreal-extraordinary-oil-hair-serum",
        description: "Weightless multi-use hair serum that provides 4x more shine, controls frizz for 24h, and protects against heat damage.",
        images: [
          "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "L'Oreal Paris",
        category: "Beauty & Lifestyle",
        subcategory: "Haircare",
        priceINR: 449,
        originalPriceINR: 599,
        discountPercentage: 25,
        rating: 4.7,
        reviewCount: 6140,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "25% OFF",
        trendingScore: 88,
        badges: ["SALON ESSENTIAL", "25% OFF"],
        tags: ["hair-serum", "loreal", "frizz-control", "haircare"],
        specs: {
          "Hair Type": "Dry, Frizzy, All Hair Types",
          "Ingredients": "Lotus, Tiare, Rose, Flax, Chamomile, Sunflower Flower Extracts",
          "Volume": "100 ml"
        }
      },
      {
        source: "nykaa",
        sourceProductId: "NYK-LANEIGE-LIPMASK",
        sourceUrl: "https://www.nykaa.com/search/result/?q=Laneige+Lip+Sleeping+Mask+Berry",
        title: "Laneige Lip Sleeping Mask EX in Berry (Antioxidant Complex)",
        slug: "nykaa-laneige-lip-sleeping-mask-berry",
        description: "Cult-favorite overnight lip mask with Berry Fruit Complex and Vitamin C that melts away dead skin cells for plump, supple lips.",
        images: [
          "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Laneige",
        category: "Beauty & Lifestyle",
        subcategory: "Lip Care",
        priceINR: 600,
        originalPriceINR: 600,
        discountPercentage: 0,
        rating: 4.9,
        reviewCount: 8900,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isTrending: true,
        trendingScore: 96,
        badges: ["CULT FAVORITE", "TOP RATED 4.9★"],
        tags: ["lip-mask", "laneige", "k-beauty", "lipcare"],
        specs: {
          "Flavor": "Sweet Berry",
          "Origin": "South Korea",
          "Size": "8g Travel / 20g Full Size"
        }
      },
      {
        source: "nykaa",
        sourceProductId: "NYK-CETAPHIL-GENTLE",
        sourceUrl: "https://www.nykaa.com/search/result/?q=Cetaphil+Gentle+Skin+Cleanser",
        title: "Cetaphil Gentle Skin Cleanser for Dry to Normal Sensitive Skin",
        slug: "nykaa-cetaphil-gentle-skin-cleanser",
        description: "Dermatologist recommended soap-free, non-foaming hydrating facial cleanser with Niacinamide, Panthenol, and Glycerin.",
        images: [
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Cetaphil",
        category: "Beauty & Lifestyle",
        subcategory: "Face Wash",
        priceINR: 370,
        originalPriceINR: 410,
        discountPercentage: 10,
        rating: 4.8,
        reviewCount: 9400,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        trendingScore: 92,
        badges: ["DERMAT RECOMMENDED", "DAILY ESSENTIAL"],
        tags: ["cleanser", "cetaphil", "sensitive-skin", "skincare"],
        specs: {
          "Volume": "125 ml",
          "Formula": "Hypoallergenic, Fragrance-Free, Paraben-Free"
        }
      }
    ];
  }
};
