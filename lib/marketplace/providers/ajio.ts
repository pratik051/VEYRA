import { MarketplaceProduct, MarketplaceProvider } from "../types";

export const AjioProvider: MarketplaceProvider = {
  id: "ajio",
  name: "AJIO",
  displayName: "AJIO",
  enabled: true,

  async getProducts(): Promise<MarketplaceProduct[]> {
    return [
      {
        source: "ajio",
        sourceProductId: "AJIO-PUMA-WIRED",
        sourceUrl: "https://www.ajio.com/search/?text=Puma+Wired+Sneakers",
        title: "Puma Mens Wired Pro Lightweight Cushioned Daily Sneakers",
        slug: "ajio-puma-wired-pro-sneakers",
        description: "Breathable air mesh running and lifestyle trainers with SoftFoam+ comfort sockliner for instant step-in cushioning.",
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Puma",
        category: "Footwear",
        subcategory: "Sneakers",
        priceINR: 1999,
        originalPriceINR: 3999,
        discountPercentage: 50,
        rating: 4.6,
        reviewCount: 1250,
        availability: "in_stock",
        isFlashSale: true,
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "AJIO Mania 50% Deal",
        trendingScore: 89,
        badges: ["AJIO MANIA DEAL", "#1 BEST SELLER"],
        tags: ["puma", "sneakers", "shoes", "footwear", "running"],
        variants: [
          { name: "Size (UK)", values: ["6", "7", "8", "9", "10", "11"] },
          { name: "Color", values: ["Puma Black-White", "High Risk Red", "Peacoat Navy"] }
        ],
        specs: {
          "Insole": "SoftFoam+ Comfort Sockliner",
          "Upper": "Engineered Knit Mesh",
          "Outsole": "Durable Non-Marking Rubber"
        }
      },
      {
        source: "ajio",
        sourceProductId: "AJIO-GAP-ARCH-LOGO",
        sourceUrl: "https://www.ajio.com/search/?text=GAP+Sweatshirt",
        title: "GAP Mens Iconic Arch Logo Relaxed Fit French Terry Sweatshirt",
        slug: "ajio-gap-arch-logo-french-terry-sweatshirt",
        description: "Classic American casual style with the iconic felt embroidered GAP arch logo, ribbed crew neck, cuffs and straight hem.",
        images: [
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "GAP",
        category: "Fashion",
        subcategory: "Sweatshirts",
        priceINR: 1799,
        originalPriceINR: 2999,
        discountPercentage: 40,
        rating: 4.8,
        reviewCount: 2840,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 1,
        isDeal: true,
        dealBadge: "40% OFF Special",
        isTrending: true,
        trendingScore: 94,
        badges: ["ICONIC GAP", "40% OFF"],
        tags: ["gap", "sweatshirt", "hoodie", "winterwear", "casual"],
        variants: [
          { name: "Size", values: ["S", "M", "L", "XL", "XXL"] },
          { name: "Color", values: ["Navy Blue Heather", "Light Grey Marl", "Burgundy"] }
        ],
        specs: {
          "Fabric": "77% Cotton, 23% Polyester French Terry",
          "Fit": "Relaxed Easy Fit"
        }
      },
      {
        source: "ajio",
        sourceProductId: "AJIO-SUPERDRY-POLO",
        sourceUrl: "https://www.ajio.com/search/?text=Superdry+Polo",
        title: "Superdry Vintage Destroyed Polo Shirt with Embroidered Chest Logo",
        slug: "ajio-superdry-vintage-destroyed-polo",
        description: "Signature classic pique cotton polo with contrast collar tipping, side vents and subtle distressed heritage wash.",
        images: [
          "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Superdry",
        category: "Fashion",
        subcategory: "Polo Shirts",
        priceINR: 2599,
        originalPriceINR: 4299,
        discountPercentage: 40,
        rating: 4.7,
        reviewCount: 1690,
        availability: "in_stock",
        isDeal: true,
        dealBadge: "Superdry 40% OFF",
        trendingScore: 91,
        badges: ["PREMIUM POLO", "40% OFF"],
        tags: ["superdry", "polo", "luxury-casual", "menswear"],
        variants: [
          { name: "Size", values: ["S", "M", "L", "XL"] },
          { name: "Color", values: ["Optical White", "Eclipse Navy", "Signal Orange"] }
        ],
        specs: {
          "Material": "100% Organic Cotton Pique",
          "Fit": "Slim Contemporary Fit"
        }
      },
      {
        source: "ajio",
        sourceProductId: "AJIO-NETPLAY-OXFORD",
        sourceUrl: "https://www.ajio.com/search/?text=Netplay+Oxford+Shirt",
        title: "Netplay Slim Fit Pure Oxford Cotton Button-Down Formal Shirt",
        slug: "ajio-netplay-slim-fit-oxford-shirt",
        description: "Versatile corporate and smart-casual long-sleeve oxford shirt with button-down collar and patch pocket.",
        images: [
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80"
        ],
        brand: "Netplay",
        category: "Fashion",
        subcategory: "Formal Shirts",
        priceINR: 799,
        originalPriceINR: 1599,
        discountPercentage: 50,
        rating: 4.5,
        reviewCount: 3100,
        availability: "in_stock",
        isBestSeller: true,
        bestsellerRank: 2,
        isDeal: true,
        dealBadge: "50% OFF Workwear",
        trendingScore: 88,
        badges: ["WORKWEAR", "50% OFF"],
        tags: ["oxford-shirt", "formal", "office-wear", "netplay"],
        variants: [
          { name: "Size", values: ["38", "40", "42", "44"] },
          { name: "Color", values: ["Sky Blue", "Classic White", "Soft Pink"] }
        ],
        specs: {
          "Fabric": "100% Breathable Oxford Cotton",
          "Collar": "Button-Down Collar"
        }
      }
    ];
  }
};
