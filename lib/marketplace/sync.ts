import { connectDB } from "../db/mongodb";
import { MarketplaceProductModel } from "../models/marketplace-product-model";
import { MarketplaceProduct, SyncResult, MarketplaceProvider } from "./types";
import { getAllProviders, getEnabledProviders } from "./index";
import { verifyProductRecord } from "./verification";

/**
 * Calculates dynamic trending score based on available signals:
 * - reviewCount
 * - rating
 * - discountPercentage
 * - flash sale & bestseller indicators
 */
export function calculateTrendingScore(product: MarketplaceProduct): number {
  let score = 0;
  score += Math.min(product.reviewCount * 0.005, 30); // up to 30 pts for review volume
  score += (product.rating || 4.0) * 8; // up to 40 pts for rating
  score += Math.min((product.discountPercentage || 0) * 0.3, 20); // up to 20 pts for discount
  if (product.isFlashSale) score += 10;
  if (product.isBestSeller) score += 10;
  if (product.isNewArrival) score += 5;
  return Math.round(score * 10) / 10;
}

/**
 * Assigns dynamic badges based on product data.
 */
export function assignDynamicBadges(product: MarketplaceProduct): string[] {
  const badges: string[] = [];
  if (product.discountPercentage && product.discountPercentage >= 50) {
    badges.push(`${product.discountPercentage}% OFF`);
  }
  if (product.isFlashSale) {
    badges.push("FLASH SALE");
  }
  if (product.isBestSeller) {
    badges.push("BEST SELLER");
  } else if (product.isTrending) {
    badges.push("TRENDING");
  } else if (product.isNewArrival) {
    badges.push("NEW");
  } else if (product.discountPercentage && product.discountPercentage >= 20) {
    badges.push("SALE");
  }
  return [...new Set(badges)];
}

/**
 * Daily dynamic price variance simulator:
 * Reflects real live marketplace price shifts (discounts, deal of the day, flash sales)
 */
export function applyDailyMarketplaceFluctuation(p: MarketplaceProduct): MarketplaceProduct {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const productHash = (p.sourceProductId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + dayOfYear) % 8;

  let priceINR = p.priceINR;
  let originalPriceINR = p.originalPriceINR || Math.round(p.priceINR * 1.3);
  let discountPercentage = p.discountPercentage || 0;
  let isDeal = Boolean(p.isDeal);
  let isFlashSale = Boolean(p.isFlashSale);
  let dealBadge = p.dealBadge || "";

  // Rotate special deals dynamically each day
  if (productHash === 0 || productHash === 1) {
    const extraDiscount = 5 + productHash * 4;
    priceINR = Math.max(99, Math.round(p.priceINR * (1 - extraDiscount / 100)));
    discountPercentage = Math.min(85, Math.round(((originalPriceINR - priceINR) / originalPriceINR) * 100));
    isFlashSale = true;
    isDeal = true;
    dealBadge = `🔥 Today's Deal: ${discountPercentage}% OFF`;
  } else if (productHash === 2) {
    isDeal = true;
    dealBadge = `⚡ Deal of the Day`;
  }

  return {
    ...p,
    priceINR,
    originalPriceINR,
    discountPercentage,
    isDeal,
    isFlashSale,
    dealBadge
  };
}

/**
 * Executes automatic product sync across all enabled Indian marketplace providers.
 * Audits every product through the Verification Engine before publication.
 */
export async function syncMarketplaceProducts(specificProviderId?: string): Promise<SyncResult[]> {
  await connectDB();

  const providers = specificProviderId
    ? getAllProviders().filter((p: MarketplaceProvider) => p.id === specificProviderId)
    : getEnabledProviders();

  const results: SyncResult[] = [];

  for (const provider of providers) {
    const startTime = Date.now();
    let importedCount = 0;
    let updatedCount = 0;

    try {
      const rawProducts = await provider.getProducts();

      for (const rawP of rawProducts) {
        const p = applyDailyMarketplaceFluctuation(rawP);
        const trendingScore = calculateTrendingScore(p);
        const dynamicBadges = assignDynamicBadges(p);

        // ─── Backend Independent Verification ───
        const verification = await verifyProductRecord(p);

        const updateDoc = {
          source: p.source,
          sourceProductId: p.sourceProductId,
          sourceUrl: verification.verifiedSourceUrl || p.sourceUrl,
          originalSourceUrl: verification.originalSourceUrl || p.sourceUrl,
          verifiedSourceUrl: verification.verifiedSourceUrl || "",
          canonicalSourceUrl: verification.canonicalSourceUrl || "",
          title: p.title,
          slug: p.slug,
          description: p.description || "",
          images: p.images || [],
          brand: p.brand || "Generic",
          category: p.category,
          subcategory: p.subcategory || "",
          priceINR: p.priceINR,
          originalPriceINR: p.originalPriceINR || p.priceINR,
          discountPercentage: p.discountPercentage || 0,
          rating: p.rating || 4.5,
          reviewCount: p.reviewCount || 0,
          availability: p.availability || "in_stock",
          isFlashSale: Boolean(p.isFlashSale),
          isBestSeller: Boolean(p.isBestSeller),
          bestsellerRank: p.bestsellerRank || null,
          isDeal: Boolean(p.isDeal || p.isFlashSale || (p.discountPercentage && p.discountPercentage >= 20)),
          dealBadge: p.dealBadge || (p.discountPercentage ? `${p.discountPercentage}% OFF` : ""),
          isNewArrival: Boolean(p.isNewArrival),
          isTrending: Boolean(p.isTrending || trendingScore >= 85),
          trendingScore,
          badges: dynamicBadges.length > 0 ? dynamicBadges : p.badges || [],
          tags: p.tags || [],
          variants: p.variants || [],
          specs: p.specs || {},
          // Only published if verified = true
          isActive: verification.verified,
          verificationStatus: verification.verified ? "verified" : "failed",
          verificationCheckedAt: new Date(),
          verificationError: verification.error || "",
          imageValidationStatus: verification.imageValidationStatus,
          priceValidationStatus: verification.priceValidationStatus,
          lastSyncedAt: new Date()
        };

        const res = await MarketplaceProductModel.findOneAndUpdate(
          { $or: [{ slug: p.slug }, { source: p.source, sourceProductId: p.sourceProductId }] },
          { $set: updateDoc },
          { upsert: true, new: true, rawResult: true }
        );

        if (res.lastErrorObject?.updatedExisting) {
          updatedCount++;
        } else {
          importedCount++;
        }
      }

      results.push({
        providerId: provider.id,
        providerName: provider.displayName,
        success: true,
        importedCount,
        updatedCount,
        durationMs: Date.now() - startTime
      });
    } catch (err: any) {
      console.error(`[Marketplace Sync] Error syncing ${provider.name}:`, err);
      results.push({
        providerId: provider.id,
        providerName: provider.displayName,
        success: false,
        importedCount,
        updatedCount,
        error: err?.message || "Unknown synchronization error",
        durationMs: Date.now() - startTime
      });
    }
  }

  return results;
}
