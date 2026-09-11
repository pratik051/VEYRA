import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { CartModel } from "@/lib/models/cart-model";

export const dynamic = "force-dynamic";

type CartItemRecord = {
  _id: unknown;
  productId: string;
  quantity: number;
  unitPrice: number;
};

function toCartPayload(items: CartItemRecord[]) {
  const normalized = items.map((item) => ({
    itemId: String(item._id),
    productId: String(item.productId),
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice)
  }));
  const subtotal = normalized.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  return { items: normalized, subtotal };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await connectToDatabase();
  const cart = await CartModel.findOne({ userId: user._id }).lean<{ items?: CartItemRecord[] } | null>();
  return NextResponse.json(toCartPayload(cart?.items ?? []));
}
