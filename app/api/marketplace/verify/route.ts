import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { MarketplaceProductModel } from "@/lib/models/marketplace-product-model";
import { verifyProductRecord } from "@/lib/marketplace/verification";

export const dynamic = "force-dynamic";

/**
 * GET/POST /api/marketplace/verify
 * Periodic and on-demand re-verification engine:
 * Audits all existing products in the database against live URL, image, and price rules.
 * Unpublishes (isActive = false, verificationStatus = "failed") any broken product
 * while preserving historic order snapshots.
 */
export async function GET() {
  try {
    await connectDB();

    const products = await MarketplaceProductModel.find({}).lean();
    let verifiedCount = 0;
    let failedCount = 0;
    const auditLog: Array<{
      productId: string;
      title: string;
      source: string;
      status: "verified" | "failed";
      verifiedUrl?: string;
      error?: string;
    }> = [];

    for (const p of products) {
      const result = await verifyProductRecord(p as any);

      if (result.verified) {
        verifiedCount++;
        await MarketplaceProductModel.updateOne(
          { _id: p._id },
          {
            $set: {
              isActive: true,
              verificationStatus: "verified",
              verifiedSourceUrl: result.verifiedSourceUrl,
              canonicalSourceUrl: result.canonicalSourceUrl,
              sourceUrl: result.verifiedSourceUrl || p.sourceUrl,
              imageValidationStatus: result.imageValidationStatus,
              priceValidationStatus: result.priceValidationStatus,
              verificationCheckedAt: new Date(),
              verificationError: ""
            }
          }
        );
        auditLog.push({
          productId: p.sourceProductId,
          title: p.title,
          source: p.source,
          status: "verified",
          verifiedUrl: result.verifiedSourceUrl
        });
      } else {
        failedCount++;
        await MarketplaceProductModel.updateOne(
          { _id: p._id },
          {
            $set: {
              isActive: false, // Automatically unpublish from customer storefront
              verificationStatus: "failed",
              verificationError: result.error || "Verification failed",
              imageValidationStatus: result.imageValidationStatus,
              priceValidationStatus: result.priceValidationStatus,
              verificationCheckedAt: new Date()
            }
          }
        );
        auditLog.push({
          productId: p.sourceProductId,
          title: p.title,
          source: p.source,
          status: "failed",
          error: result.error
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Audit completed at ${new Date().toISOString()}`,
      summary: {
        totalAudited: products.length,
        verifiedAndPublished: verifiedCount,
        failedAndUnpublished: failedCount
      },
      auditLog
    });
  } catch (err: any) {
    console.error("[API /api/marketplace/verify] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to audit marketplace products" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
