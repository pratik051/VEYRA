import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { MarketplaceProductModel } from "@/lib/models/marketplace-product-model";
import { requireAdminSession } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/marketplace/products
 * Returns all marketplace products with verification details, source status, and confidence scores.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const url = new URL(req.url);
    const source = url.searchParams.get("source");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const query: any = {};
    if (source && source !== "All") {
      query.source = source;
    }
    if (status && status !== "All") {
      query.verificationStatus = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { sourceProductId: { $regex: search, $options: "i" } }
      ];
    }

    const products = await MarketplaceProductModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err: any) {
    console.error("[GET /api/admin/marketplace/products] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load marketplace products" },
      { status: 500 }
    );
  }
}
