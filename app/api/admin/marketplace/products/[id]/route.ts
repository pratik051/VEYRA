import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { MarketplaceProductModel } from "@/lib/models/marketplace-product-model";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();

    const allowedUpdates = [
      "isActive",
      "featured",
      "isTrending",
      "isBestSeller",
      "isFlashSale",
      "category",
      "subcategory",
      "badges"
    ];

    const updateFields: any = {};
    for (const key of allowedUpdates) {
      if (key in body) {
        updateFields[key] = body[key];
      }
    }

    const updated = await MarketplaceProductModel.findByIdAndUpdate(
      params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Marketplace product updated successfully",
      product: updated
    });
  } catch (err: any) {
    console.error("[PATCH /api/admin/marketplace/products/[id]] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update product" },
      { status: 500 }
    );
  }
}
