import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { CartModel } from "@/lib/models/cart-model";

type AddCartItemPayload = {
  productId?: string;
  quantity?: number;
  unitPrice?: number;
};

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

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await req.json()) as AddCartItemPayload;
  const productId = body.productId?.trim() ?? "";
  const quantity = Number(body.quantity);
  const unitPrice = Number(body.unitPrice);

  if (!productId || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
    return NextResponse.json({ error: "productId, positive quantity and unitPrice are required." }, { status: 400 });
  }

  await connectToDatabase();
  const cart = await CartModel.findOne({ userId: user._id }).lean<{ _id: unknown; items?: CartItemRecord[] } | null>();

  if (!cart) {
    await CartModel.create({
      userId: user._id,
      items: [{ productId, quantity, unitPrice }]
    });
  } else {
    const existing = (cart.items ?? []).find((item) => String(item.productId) === productId);
    if (existing) {
      await CartModel.updateOne(
        { _id: cart._id, "items._id": existing._id },
        { $inc: { "items.$.quantity": quantity }, $set: { "items.$.unitPrice": unitPrice } }
      );
    } else {
      await CartModel.updateOne({ _id: cart._id }, { $push: { items: { productId, quantity, unitPrice } } });
    }
  }

  const updated = await CartModel.findOne({ userId: user._id }).lean<{ items?: CartItemRecord[] } | null>();
  return NextResponse.json(toCartPayload(updated?.items ?? []), { status: 201 });
}
