import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { MarketplaceProductModel } from "@/lib/models/marketplace-product-model";
import { calculateOrderPrice } from "@/lib/pricing/india-order";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const doc: any = await MarketplaceProductModel.findOne({ slug: params.slug, isActive: true }).lean();

    if (!doc) {
      return NextResponse.json({ success: false, error: "Marketplace product not found" }, { status: 404 });
    }

    const { finalAmount } = calculateOrderPrice(doc.priceINR);

    const product = {
      id: doc._id.toString(),
      source: doc.source,
      sourceProductId: doc.sourceProductId,
      sourceUrl: doc.sourceUrl,
      title: doc.title,
      name: doc.title,
      slug: doc.slug,
      description: doc.description,
      images: doc.images,
      image: doc.images[0] || "",
      gallery: doc.images,
      brand: doc.brand,
      category: doc.category,
      subcategory: doc.subcategory,
      priceINR: doc.priceINR,
      originalPriceINR: doc.originalPriceINR,
      price: finalAmount, // Final NPR for store compatibility
      originalPrice: doc.originalPriceINR ? calculateOrderPrice(doc.originalPriceINR).finalAmount : finalAmount,
      finalAmountNPR: finalAmount,
      discountPercentage: doc.discountPercentage,
      rating: doc.rating,
      reviews: doc.reviewCount,
      reviewCount: doc.reviewCount,
      stock: doc.availability === "in_stock" ? 50 : 0,
      availability: doc.availability,
      isFlashSale: doc.isFlashSale,
      isBestSeller: doc.isBestSeller,
      isNewArrival: doc.isNewArrival,
      isTrending: doc.isTrending,
      badges: doc.badges,
      badge: doc.badges?.[0] || "",
      tags: doc.tags,
      variants: doc.variants,
      colors: doc.variants?.find((v: any) => v.name.toLowerCase().includes("color"))?.values || [],
      sizes: doc.variants?.find((v: any) => v.name.toLowerCase().includes("size"))?.values || [],
      specs: doc.specs || {},
      lastSyncedAt: doc.lastSyncedAt
    };

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error("[GET /api/marketplace/products/[slug]] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load product details" },
      { status: 500 }
    );
  }
}
