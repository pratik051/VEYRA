import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { checkProductAvailabilityAndDelivery } from "@/lib/marketplace/availability";
import { getSourceIdFromUrl } from "@/lib/sourcing-platforms";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/product-requests
 * Returns all product sourcing requests submitted by the authenticated customer.
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    await connectToDatabase();
    const userId = String(sessionUser._id);

    const requests = await ProductRequestModel.find({
      $or: [{ userId }, { phone: sessionUser.phone || "---" }, { email: sessionUser.email || "---" }]
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, requests }, { status: 200 });
  } catch (err: any) {
    console.error("[GET /api/user/product-requests] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch product requests" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/product-requests
 * Allows a customer to submit a request for an unavailable product or custom link.
 * Automatically runs server verification to snapshot why direct ordering was unavailable.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const productUrl = String(body.productUrl || "").trim();
    const productName = String(body.productName || "Requested Indian Product").trim();
    const requestedVariant = String(body.requestedVariant || body.variant || "").trim();
    const requestedSize = String(body.requestedSize || body.size || "").trim();
    const requestedColor = String(body.requestedColor || body.color || "").trim();
    const requestedQuantity = Math.max(1, Number(body.requestedQuantity || body.quantity) || 1);
    const currentKnownPrice = Number(body.currentKnownPrice || body.inrPrice || 0);
    const deliveryLocation = String(body.deliveryLocation || body.deliveryAddress || "").trim();
    const additionalNotes = String(body.additionalNotes || body.notes || "").trim();

    if (!productUrl || (!productUrl.startsWith("http://") && !productUrl.startsWith("https://"))) {
      return NextResponse.json({ success: false, error: "Please provide a valid Indian marketplace product link URL." }, { status: 400 });
    }

    await connectToDatabase();

    const userId = String(sessionUser._id);
    const userName = sessionUser.fullName || sessionUser.email || "Customer";
    const phone = sessionUser.phone || body.phone || "";
    const email = sessionUser.email || body.email || "";

    // Server-side verification snapshot
    const checkResult = await checkProductAvailabilityAndDelivery({
      url: productUrl,
      variant: { size: requestedSize, color: requestedColor, name: requestedVariant },
      quantity: requestedQuantity
    });

    const detectedPlatform = getSourceIdFromUrl(productUrl) || "indian-marketplace";
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const requestId = `REQ-${randomDigits}`;

    const newRequest = await ProductRequestModel.create({
      requestId,
      userId,
      userName,
      phone,
      email,
      deliveryLocation,
      originalMarketplace: detectedPlatform,
      originalProductUrl: productUrl,
      sourceProductId: checkResult.product?.sourceProductId || "",
      productName: checkResult.product?.name || productName,
      productImage: checkResult.product?.image || body.productImage || "",
      productCategory: checkResult.product?.category || "Everyday Essentials",
      requestedVariant,
      requestedSize,
      requestedColor,
      requestedQuantity,
      currentKnownPrice: checkResult.product?.priceINR || currentKnownPrice,
      reason: body.reason || (checkResult.orderable ? "Customer manual quote request" : checkResult.message),
      verificationSnapshot: {
        urlVerified: checkResult.verified,
        stockStatus: checkResult.stockStatusText,
        deliveryAvailable: checkResult.deliveryAvailable,
        priceAvailable: Boolean(checkResult.product?.priceINR),
        failureReason: checkResult.message,
        checkedAt: checkResult.checkedAt
      },
      status: "Pending",
      additionalNotes
    });

    return NextResponse.json(
      {
        success: true,
        message: `Product request ${requestId} submitted successfully. Our sourcing team will review availability and provide an alternative link if needed.`,
        request: newRequest
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/user/product-requests] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create product request" },
      { status: 500 }
    );
  }
}
