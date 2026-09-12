import { NextResponse } from "next/server";
import { calculateOrderBreakdown } from "@/lib/utils/order-calculator";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const subtotal = Number(body.subtotal) || 0;
    const deliveryFee = Number(body.deliveryFee) || 0;
    const referralCode = String(body.referralCode || "").trim();
    const paymentMethod = body.paymentMethod || "COD";

    const calculation = calculateOrderBreakdown({
      subtotal,
      deliveryFee,
      referralCode,
      paymentMethod
    });

    return NextResponse.json({
      success: true,
      ...calculation
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Calculation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
