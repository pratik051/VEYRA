import { NextRequest, NextResponse } from "next/server";
import { checkProductAvailabilityAndDelivery } from "@/lib/marketplace/availability";

export const dynamic = "force-dynamic";

/**
 * POST /api/products/check-availability
 * Sourcing verification endpoint:
 * Verifies marketplace URL, stock status, variant availability,
 * and delivery eligibility to transit postal code 854331.
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
    const postalCode = String(body.postalCode || "854331").trim();
    const variant = body.variant;
    const quantity = Math.max(1, Number(body.quantity) || 1);

    if (!rawUrl) {
      return NextResponse.json(
        {
          verified: false,
          inStock: false,
          deliveryAvailable: false,
          postalCode,
          canOrder: false,
          reason: "INVALID_URL",
          message: "Please enter a valid marketplace product link."
        },
        { status: 400 }
      );
    }

    const result = await checkProductAvailabilityAndDelivery({
      url: rawUrl,
      postalCode,
      variant,
      quantity
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[API /api/products/check-availability] Error:", err);
    return NextResponse.json(
      {
        verified: false,
        inStock: false,
        deliveryAvailable: false,
        postalCode: "854331",
        canOrder: false,
        reason: "UNVERIFIED",
        message: err?.message || "Failed to complete product availability check."
      },
      { status: 500 }
    );
  }
}
