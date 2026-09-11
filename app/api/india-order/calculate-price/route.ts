import { NextResponse } from "next/server";
import { getCustomerFacingPrice } from "@/lib/pricing/india-order";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPrice = Number(body.indianPriceINR);

    if (isNaN(rawPrice) || rawPrice <= 0) {
      return NextResponse.json(
        { error: "Please enter a valid positive Indian product price (INR ₹)." },
        { status: 400 }
      );
    }

    const priceResult = getCustomerFacingPrice(rawPrice);
    return NextResponse.json(priceResult);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Price calculation failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
