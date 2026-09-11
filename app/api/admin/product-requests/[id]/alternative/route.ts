import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { checkProductAvailabilityAndDelivery } from "@/lib/marketplace/availability";
import { calculateOrderPrice } from "@/lib/pricing/india-order";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/product-requests/[id]/alternative
 * Admin submits an alternative marketplace product link.
 *
 * CRITICAL RULE:
 * The backend MUST independently verify the alternative product before it can be saved as orderable.
 * An unverified or out-of-stock alternative will NEVER be marked orderable or offered to the customer.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser || sessionUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Access denied. Admin access required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const alternativeUrl = String(body.productUrl || body.alternativeUrl || "").trim();
    const adminNote = String(body.adminNote || body.note || "").trim();
    const variantSize = String(body.size || "").trim();
    const variantColor = String(body.color || "").trim();

    if (!alternativeUrl || (!alternativeUrl.startsWith("http://") && !alternativeUrl.startsWith("https://"))) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid Indian marketplace URL starting with https://" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const queryId = params.id;

    const request = await ProductRequestModel.findOne({
      $or: [{ requestId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : undefined }]
    });

    if (!request) {
      return NextResponse.json({ success: false, error: "Product request not found." }, { status: 404 });
    }

    // ── 1. INDEPENDENT BACKEND VERIFICATION OF THE ALTERNATIVE PRODUCT ──
    const verification = await checkProductAvailabilityAndDelivery({
      url: alternativeUrl,
      variant: { size: variantSize, color: variantColor },
      quantity: request.requestedQuantity || 1
    });

    if (!verification.orderable) {
      return NextResponse.json(
        {
          success: false,
          error: `Alternative product rejected by verification engine: ${verification.message}`,
          verificationResult: {
            verified: verification.verified,
            stockStatus: verification.stockStatusText,
            deliveryStatus: verification.deliveryStatusText,
            reason: verification.reason,
            internalAudit: verification._internalAudit
          }
        },
        { status: 400 }
      );
    }

    // ── 2. CALCULATE LANDED NPR PRICING ──
    const priceINR = Number(body.priceINR) || Number(verification.product?.priceINR) || 0;
    const quantity = Math.max(1, request.requestedQuantity || 1);
    const pricing = calculateOrderPrice(priceINR * quantity);

    // ── 3. SAVE VERIFIED ALTERNATIVE ──
    request.alternativeProduct = {
      marketplace: verification.product?.source || "indian-marketplace",
      productUrl: alternativeUrl,
      verifiedProductUrl: verification.verifiedUrl || alternativeUrl,
      sourceProductId: verification.product?.sourceProductId || "",
      productName: verification.product?.name || body.productName || "Verified Alternative Product",
      productImage: verification.product?.image || body.productImage || "",
      variant: body.variant || "",
      size: variantSize,
      color: variantColor,
      priceINR,
      finalAmountNPR: pricing.finalAmount,
      verified: true,
      orderable: true,
      stockStatus: verification.stockStatusText,
      deliveryAvailable: verification.deliveryAvailable,
      adminNote,
      verifiedAt: new Date()
    };

    request.status = "Alternative Found";
    request.customerAction = "none";
    request.updatedAt = new Date();
    await request.save();

    return NextResponse.json({
      success: true,
      message: "Alternative product independently verified and offered to the customer.",
      alternativeProduct: request.alternativeProduct,
      request
    });
  } catch (err: any) {
    console.error("[POST /api/admin/product-requests/[id]/alternative] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to submit alternative product" },
      { status: 500 }
    );
  }
}
