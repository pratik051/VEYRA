import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { IndiaOrderModel } from "@/lib/models/india-order-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { checkProductAvailabilityAndDelivery } from "@/lib/marketplace/availability";
import { calculateOrderPrice } from "@/lib/pricing/india-order";

export const dynamic = "force-dynamic";

/**
 * POST /api/user/product-requests/[id]/accept
 * Customer accepts an admin-provided alternative product.
 * Backend reverifies the alternative product, calculates landed price, and creates the order.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;

    if (!sessionUser) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    await connectToDatabase();

    const queryId = params.id;
    const userId = String(sessionUser._id);
    const isAdmin = sessionUser.role === "admin";

    const request = await ProductRequestModel.findOne({
      $or: [{ requestId: queryId }, { _id: queryId.match(/^[0-9a-fA-F]{24}$/) ? queryId : undefined }]
    });

    if (!request) {
      return NextResponse.json({ success: false, error: "Product request not found." }, { status: 404 });
    }

    if (!isAdmin && request.userId !== userId) {
      return NextResponse.json({ success: false, error: "Access denied." }, { status: 403 });
    }

    if (!request.alternativeProduct || !request.alternativeProduct.productUrl) {
      return NextResponse.json(
        { success: false, error: "No alternative product has been assigned to this request yet." },
        { status: 400 }
      );
    }

    const alt = request.alternativeProduct;

    // ── 1. REVERIFY THE ALTERNATIVE PRODUCT ON BACKEND ──
    const recheck = await checkProductAvailabilityAndDelivery({
      url: alt.verifiedProductUrl || alt.productUrl,
      quantity: request.requestedQuantity || 1
    });

    if (!recheck.orderable) {
      return NextResponse.json(
        {
          success: false,
          error: "The alternative product is currently out of stock or unavailable. Our team will locate another option for you.",
          stockStatus: recheck.stockStatusText,
          deliveryStatus: recheck.deliveryStatusText
        },
        { status: 400 }
      );
    }

    // ── 2. CALCULATE LANDED NPR PRICING ──
    const inrPrice = Number(alt.priceINR) || Number(recheck.product?.priceINR) || 0;
    const quantity = Math.max(1, request.requestedQuantity || 1);
    const pricing = calculateOrderPrice(inrPrice * quantity);

    // ── 3. CREATE ORDER PRESERVING BOTH ORIGINAL & ALTERNATIVE URLS ──
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `LNK-ALT-${randomSuffix}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${randomSuffix}`;
    const invoiceUrl = `/api/india-order/invoice/${orderId}`;
    const paymentMethod = body.paymentMethod === "FULL_PAYMENT" ? "FULL_PAYMENT" : "COD";

    const customerName = body.customerName || request.userName || sessionUser.fullName || "Valued Customer";
    const phone = body.phone || request.phone || sessionUser.phone || "";
    const email = body.email || request.email || sessionUser.email || "";
    const deliveryAddress = body.deliveryAddress || request.deliveryLocation || "Kathmandu, Nepal";

    const orderPayload = {
      orderId,
      invoiceNumber,
      userId,
      customerId: userId,
      customerName,
      phone,
      email,
      deliveryAddress,
      city: body.city || "Kathmandu",
      district: body.district || "",
      province: body.province || "Bagmati",
      postalCode: body.postalCode || "",
      deliveryInstructions: body.deliveryInstructions || request.additionalNotes || "",
      shippingAddress: {
        fullName: customerName,
        phone,
        email,
        deliveryAddress,
        city: body.city || "Kathmandu",
        district: body.district || "",
        province: body.province || "Bagmati",
        country: "Nepal",
        deliveryInstructions: body.deliveryInstructions || ""
      },
      // Preserve both original requested URL and verified alternative URL
      marketplace: alt.marketplace || recheck.product?.source || request.originalMarketplace || "indian-marketplace",
      sourceProductId: alt.sourceProductId || recheck.product?.sourceProductId || "",
      productUrl: alt.verifiedProductUrl || alt.productUrl,
      originalSourceUrl: request.originalProductUrl,
      verifiedSourceUrl: alt.verifiedProductUrl || alt.productUrl,
      canonicalSourceUrl: recheck.canonicalUrl || alt.productUrl,
      productName: alt.productName || recheck.product?.name || request.productName,
      productImage: alt.productImage || recheck.product?.image || request.productImage || "",
      productVariant: alt.variant || request.requestedVariant || "",
      size: alt.size || request.requestedSize || "",
      color: alt.color || request.requestedColor || "",
      quantity,
      indianPriceINR: inrPrice * quantity,
      conversionAmountNPR: pricing.conversionAmount,
      serviceChargeNPR: pricing.serviceCharge,
      deliveryChargeNPR: pricing.deliveryCharge,
      finalAmountNPR: pricing.finalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "FULL_PAYMENT" ? ("PAID" as const) : ("Pending" as const),
      orderStatus: "Confirmed" as const,
      invoiceUrl,
      stockStatus: recheck.stockStatusText,
      deliveryStatus: recheck.deliveryStatusText,
      postalCodeChecked: "Internal Depot",
      canOrder: true,
      availabilityCheckedAt: new Date()
    };

    await IndiaOrderModel.create(orderPayload);

    // ── 4. UPDATE PRODUCT REQUEST STATUS ──
    request.status = "Converted to Order";
    request.customerAction = "accepted";
    request.convertedOrderId = orderId;
    request.updatedAt = new Date();
    await request.save();

    return NextResponse.json({
      success: true,
      message: `Alternative product accepted! Order ${orderId} has been confirmed.`,
      orderId,
      invoiceUrl,
      finalAmountNPR: pricing.finalAmount
    });
  } catch (err: any) {
    console.error("[POST /api/user/product-requests/[id]/accept] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to accept alternative product" },
      { status: 500 }
    );
  }
}
