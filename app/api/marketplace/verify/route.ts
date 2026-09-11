import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { MarketplaceProductModel } from "@/lib/models/marketplace-product-model";
import { verifyProductRecord } from "@/lib/marketplace/verification";

export const dynamic = "force-dynamic";

/**
 * GET/POST /api/marketplace/verify
 * Periodic and on-demand re-verification engine:
 * Audits products in the database against live URL, AI candidate matching, image, and price rules.
 * Unpublishes (isActive = false, published = false, verificationStatus = "failed") any broken product
 * while preserving historic order snapshots.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const productId = url.searchParams.get("productId") || url.searchParams.get("id");

    const query: any = {};
    if (productId) {
      query.$or = [{ _id: productId }, { sourceProductId: productId }, { slug: productId }];
    }

    const products = await MarketplaceProductModel.find(query).lean();
    let verifiedCount = 0;
    let failedCount = 0;
    const auditLog: Array<{
      productId: string;
      title: string;
      source: string;
      status: "verified" | "failed";
      method?: string;
      confidence?: number;
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
              published: true,
              verificationStatus: "verified",
              verificationMethod: result.verificationMethod,
              matchConfidence: result.matchConfidence,
              imageVerified: result.imageVerified,
              priceVerified: result.priceVerified,
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
          method: result.verificationMethod,
          confidence: result.matchConfidence,
          verifiedUrl: result.verifiedSourceUrl
        });
      } else {
        failedCount++;
        await MarketplaceProductModel.updateOne(
          { _id: p._id },
          {
            $set: {
              isActive: false, // Automatically unpublish from customer storefront
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
            }
          }
        );
        auditLog.push({
          productId: p.sourceProductId,
          title: p.title,
          source: p.source,
          status: "failed",
          method: result.verificationMethod,
          confidence: result.matchConfidence,
          error: result.error
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verification completed at ${new Date().toISOString()}`,
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

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const productId = body.productId || body.id;
    if (productId) {
      const url = new URL(req.url);
      url.searchParams.set("productId", productId);
      const reqWithParams = new NextRequest(url, { method: "GET" });
      return GET(reqWithParams);
    }

    return GET(req);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

