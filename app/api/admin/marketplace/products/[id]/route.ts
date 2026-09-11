import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { MarketplaceProductModel } from "@/lib/models/marketplace-product-model";
import { verifyProductRecord } from "@/lib/marketplace/verification";
import { requireAdminSession } from "@/lib/auth/require-admin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const allowedUpdates = [
      "isActive",
      "published",
      "featured",
      "isTrending",
      "isBestSeller",
      "isFlashSale",
      "category",
      "subcategory",
      "badges",
      "sourceUrl",
      "originalSourceUrl"
    ];

    const updateFields: any = {};
    for (const key of allowedUpdates) {
      if (key in body) {
        updateFields[key] = body[key];
      }
    }

    // If publishing, ensure it has passed backend verification first
    if (updateFields.published === true || updateFields.isActive === true) {
      const existing = await MarketplaceProductModel.findById(params.id).lean();
      if (existing) {
        const check = await verifyProductRecord({ ...existing, ...updateFields } as any);
        if (!check.verified) {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot publish unverified product: ${check.error || "Backend verification failed"}`
            },
            { status: 400 }
          );
        }
        updateFields.verificationStatus = "verified";
        updateFields.verificationMethod = check.verificationMethod;
        updateFields.matchConfidence = check.matchConfidence;
        updateFields.verifiedSourceUrl = check.verifiedSourceUrl;
        updateFields.canonicalSourceUrl = check.canonicalSourceUrl;
        updateFields.imageVerified = check.imageVerified;
        updateFields.priceVerified = check.priceVerified;
        updateFields.verificationCheckedAt = new Date();
        updateFields.verificationError = "";
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

/**
 * POST /api/admin/marketplace/products/[id]
 * On-demand AI Re-verification for a specific product
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const product = await MarketplaceProductModel.findById(params.id).lean();
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const result = await verifyProductRecord(product as any);

    const productDoc = product as any;
    const updateDoc = result.verified
      ? {
          isActive: true,
          published: true,
          verificationStatus: "verified",
          verificationMethod: result.verificationMethod,
          matchConfidence: result.matchConfidence,
          imageVerified: result.imageVerified,
          priceVerified: result.priceVerified,
          verifiedSourceUrl: result.verifiedSourceUrl,
          canonicalSourceUrl: result.canonicalSourceUrl,
          sourceUrl: result.verifiedSourceUrl || productDoc.sourceUrl,
          imageValidationStatus: result.imageValidationStatus,
          priceValidationStatus: result.priceValidationStatus,
          verificationCheckedAt: new Date(),
          verificationError: ""
        }
      : {
          isActive: false,
          published: false,
          verificationStatus: "failed",
          verificationMethod: result.verificationMethod,
          matchConfidence: result.matchConfidence,
          imageVerified: result.imageVerified,
          priceVerified: result.priceVerified,
          verificationError: result.error || "Verification failed",
          imageValidationStatus: result.imageValidationStatus,
          priceValidationStatus: result.priceValidationStatus,
          verificationCheckedAt: new Date()
        };

    const updated = await MarketplaceProductModel.findByIdAndUpdate(
      params.id,
      { $set: updateDoc },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: result.verified ? "Product successfully verified" : "Product verification failed",
      verification: result,
      product: updated
    });
  } catch (err: any) {
    console.error("[POST /api/admin/marketplace/products/[id]] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reverify product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const deleted = await MarketplaceProductModel.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted from catalog" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

