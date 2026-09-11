import { NextRequest, NextResponse } from "next/server";
import { getMarketplaceProducts } from "@/lib/marketplace";
import { syncMarketplaceProducts } from "@/lib/marketplace/sync";
import { MarketplaceProductModel } from "@/lib/models/marketplace-product-model";
import { connectDB } from "@/lib/db/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section") as any;
    const category = searchParams.get("category") || undefined;
    const source = searchParams.get("source") || undefined;
    const search = searchParams.get("search") || undefined;
    const sortBy = searchParams.get("sortBy") || undefined;
    const limit = Number(searchParams.get("limit")) || 20;
    const skip = Number(searchParams.get("skip")) || 0;

    await connectDB();
    const count = await MarketplaceProductModel.countDocuments();
    // Auto-seed/sync on first fetch if database is empty
    if (count === 0) {
      await syncMarketplaceProducts();
    }

    const { products, total } = await getMarketplaceProducts({
      section,
      category,
      source,
      search,
      sortBy,
      limit,
      skip
    });

    return NextResponse.json({
      success: true,
      total,
      products
    });
  } catch (err: any) {
    console.error("[GET /api/marketplace/products] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load marketplace products" },
      { status: 500 }
    );
  }
}
