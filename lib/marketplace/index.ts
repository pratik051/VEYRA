import { MarketplaceProvider, MarketplaceProduct } from "./types";
import { AmazonIndiaProvider } from "./providers/amazon";
import { FlipkartProvider } from "./providers/flipkart";
import { MyntraProvider } from "./providers/myntra";
import { MeeshoProvider } from "./providers/meesho";
import { NykaaProvider } from "./providers/nykaa";
import { AjioProvider } from "./providers/ajio";
import { TataCliqProvider } from "./providers/tatacliq";
import { CromaProvider } from "./providers/croma";
import { BoatProvider } from "./providers/boat";
import { NoiseProvider } from "./providers/noise";
import { connectDB } from "../db/mongodb";
import { MarketplaceProductModel } from "../models/marketplace-product-model";
import { calculateOrderPrice } from "../pricing/india-order";

// Global In-Memory Provider Config Store (Can be toggled by Admin)
const providerStatusMap: Record<string, boolean> = {
  "amazon-india": true,
  "flipkart": true,
  "myntra": true,
  "meesho": true,
  "nykaa": true,
  "ajio": true,
  "tatacliq": true,
  "croma": true,
  "boat": true,
  "noise": true
};

export const ALL_PROVIDERS: MarketplaceProvider[] = [
  AmazonIndiaProvider,
  FlipkartProvider,
  MyntraProvider,
  MeeshoProvider,
  NykaaProvider,
  AjioProvider,
  TataCliqProvider,
  CromaProvider,
  BoatProvider,
  NoiseProvider
];

export function getAllProviders(): MarketplaceProvider[] {
  return ALL_PROVIDERS.map((p) => ({
    ...p,
    enabled: providerStatusMap[p.id] ?? true
  }));
}

export function getEnabledProviders(): MarketplaceProvider[] {
  return getAllProviders().filter((p) => p.enabled);
}

export function setProviderEnabled(providerId: string, enabled: boolean): boolean {
  if (providerId in providerStatusMap) {
    providerStatusMap[providerId] = enabled;
    return true;
  }
  return false;
}

export interface CustomerMarketplaceProduct extends MarketplaceProduct {
  name: string;
  image: string;
  gallery: string[];
  finalAmountNPR: number;
}

/**
 * Loads products from MongoDB with server-calculated customer NPR prices.
 * Formula components (1.65, 20%, 200) are never exposed.
 */
export async function getMarketplaceProducts(options?: {
  section?: "flash_sales" | "best_sellers" | "top_deals" | "essentials" | "new_arrivals" | "trending";
  category?: string;
  source?: string;
  search?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
}): Promise<{ products: CustomerMarketplaceProduct[]; total: number }> {
  await connectDB();

  const query: any = { isActive: true };

  if (options?.category && options.category !== "All") {
    query.category = new RegExp(`^${options.category}$`, "i");
  }

  if (options?.source && options.source !== "All") {
    // Also support source aliases (e.g. 'amazon' -> 'amazon-india')
    if (options.source === "amazon") {
      query.source = { $in: ["amazon", "amazon-india"] };
    } else {
      query.source = options.source;
    }
  }

  if (options?.search) {
    query.$or = [
      { title: { $regex: options.search, $options: "i" } },
      { brand: { $regex: options.search, $options: "i" } },
      { category: { $regex: options.search, $options: "i" } },
      { tags: { $in: [new RegExp(options.search, "i")] } }
    ];
  }

  let sortCriteria: any = { createdAt: -1 };

  if (options?.section) {
    switch (options.section) {
      case "flash_sales":
        query.isFlashSale = true;
        sortCriteria = { discountPercentage: -1 };
        break;
      case "top_deals":
        query.$or = [{ isDeal: true }, { isFlashSale: true }, { discountPercentage: { $gte: 20 } }];
        sortCriteria = { discountPercentage: -1, rating: -1 };
        break;
      case "best_sellers":
        query.isBestSeller = true;
        sortCriteria = { bestsellerRank: 1, rating: -1, reviewCount: -1 };
        break;
      case "new_arrivals":
        query.isNewArrival = true;
        sortCriteria = { createdAt: -1 };
        break;
      case "trending":
        query.isTrending = true;
        sortCriteria = { trendingScore: -1 };
        break;
      case "essentials":
        sortCriteria = { rating: -1 };
        break;
    }
  }

  if (options?.sortBy) {
    switch (options.sortBy) {
      case "price_asc":
        sortCriteria = { priceINR: 1 };
        break;
      case "price_desc":
        sortCriteria = { priceINR: -1 };
        break;
      case "discount":
        sortCriteria = { discountPercentage: -1 };
        break;
      case "rating":
        sortCriteria = { rating: -1 };
        break;
      case "newest":
        sortCriteria = { createdAt: -1 };
        break;
    }
  }

  const limit = options?.limit || 20;
  const skip = options?.skip || 0;

  const [docs, total] = await Promise.all([
    MarketplaceProductModel.find(query).sort(sortCriteria).skip(skip).limit(limit).lean(),
    MarketplaceProductModel.countDocuments(query)
  ]);

  // Map products to customer-facing format with server-side calculated NPR price
  const products: CustomerMarketplaceProduct[] = docs.map((doc: any) => {
    const { finalAmount } = calculateOrderPrice(doc.priceINR);
    return {
      source: doc.source,
      sourceProductId: doc.sourceProductId,
      sourceUrl: doc.sourceUrl,
      title: doc.title,
      name: doc.title,
      slug: doc.slug,
      description: doc.description,
      images: doc.images || [],
      image: doc.images?.[0] || "",
      gallery: doc.images || [],
      brand: doc.brand,
      category: doc.category,
      subcategory: doc.subcategory,
      priceINR: doc.priceINR,
      originalPriceINR: doc.originalPriceINR,
      discountPercentage: doc.discountPercentage,
      rating: doc.rating,
      reviewCount: doc.reviewCount,
      availability: doc.availability,
      isFlashSale: doc.isFlashSale,
      isBestSeller: doc.isBestSeller,
      bestsellerRank: doc.bestsellerRank,
      isDeal: doc.isDeal,
      dealBadge: doc.dealBadge,
      isNewArrival: doc.isNewArrival,
      isTrending: doc.isTrending,
      trendingScore: doc.trendingScore,
      badges: doc.badges,
      tags: doc.tags,
      variants: doc.variants,
      specs: doc.specs,
      lastSyncedAt: doc.lastSyncedAt,
      finalAmountNPR: finalAmount
    };
  });

  return { products, total };
}

