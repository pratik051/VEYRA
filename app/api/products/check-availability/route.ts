import { NextRequest, NextResponse } from "next/server";
import { checkProductAvailabilityAndDelivery } from "@/lib/marketplace/availability";
import { cookies } from "next/headers";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/products/check-availability
 * Sourcing verification endpoint:
 * Verifies marketplace URL, stock status, variant availability,
 * and delivery eligibility to the private internal destination.
 *
 * NOTE: Private destination details are NEVER returned to normal users.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const rawUrl = String(body.url || "").trim();
    const variant = body.variant;
    const quantity = Math.max(1, Number(body.quantity) || 1);

    if (!rawUrl) {
      return NextResponse.json(
        {
          verified: false,
          orderable: false,
          canOrder: false,
          inStock: false,
          deliveryAvailable: false,
          stockStatus: "UNKNOWN",
          deliveryStatus: "UNKNOWN",
          reason: "INVALID_URL",
          message: "Please enter a valid marketplace product link."
        },
        { status: 400 }
      );
    }

    const result = await checkProductAvailabilityAndDelivery({
      url: rawUrl,
      variant,
      quantity
    });

    // Check if requester is admin
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;
    const isAdmin = sessionUser?.role === "admin";

    // Non-blocking customer flow: all valid marketplace URLs can be submitted for admin verification
    const customerResponse = {
      ...result,
      canOrder: true,
      orderable: true,
      stockStatusText: "⏳ Awaiting Admin Verification",
      deliveryStatusText: "⏳ Awaiting Admin Verification",
      message: "Product captured. Admin will manually verify before processing."
    };

    // Strip internal debug audit if not an admin
    if (!isAdmin && customerResponse._internalAudit) {
      delete customerResponse._internalAudit;
    }

    return NextResponse.json(isAdmin ? result : customerResponse, { status: 200 });
  } catch (err: any) {
    console.error("[API /api/products/check-availability] Error:", err);
    return NextResponse.json(
      {
        verified: false,
        orderable: false,
        canOrder: false,
        inStock: false,
        deliveryAvailable: false,
        stockStatus: "UNKNOWN",
        deliveryStatus: "UNKNOWN",
        reason: "UNVERIFIED",
        message: "We couldn't confirm availability right now. You can request this product for manual review."
      },
      { status: 500 }
    );
  }
}
