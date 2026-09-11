/**
 * Normalized Indian Marketplace Product Data Types
 */

export interface MarketplaceProductVariant {
  name: string;
  values: string[];
}

export interface MarketplaceProduct {
  source: string; // e.g., 'amazon-india', 'flipkart', 'myntra', 'meesho', 'nykaa', 'ajio', 'tatacliq', 'croma', 'boat', 'noise'
  sourceProductId: string;
  sourceUrl: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  brand: string;
  category: string; // Fashion, Footwear, Watches, Bags, Accessories, Beauty & Lifestyle, Mobile Accessories, Tech & Gadgets, Everyday Essentials
  subcategory?: string;
  priceINR: number;
  originalPriceINR?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  availability: "in_stock" | "out_of_stock" | "pre_order" | "limited";
  isFlashSale?: boolean;
  isBestSeller?: boolean;
  bestsellerRank?: number;
  isDeal?: boolean;
  dealBadge?: string;
  isNewArrival?: boolean;
  isTrending?: boolean;
  trendingScore?: number;
  badges?: string[];
  tags: string[];
  variants?: MarketplaceProductVariant[];
  specs?: Record<string, string>;
  lastSyncedAt?: Date;
  isActive?: boolean;
  featured?: boolean;
}

export interface MarketplaceProviderConfig {
  id: string;
  name: string;
  displayName: string;
  domains: string[];
  enabled: boolean;
  categories: string[];
}

export interface MarketplaceProvider {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  getProducts(): Promise<MarketplaceProduct[]>;
  searchProducts?(query: string): Promise<MarketplaceProduct[]>;
  getProductByUrl?(url: string): Promise<MarketplaceProduct | null>;
}

export interface SyncResult {
  providerId: string;
  providerName: string;
  success: boolean;
  importedCount: number;
  updatedCount: number;
  error?: string;
  durationMs: number;
}
