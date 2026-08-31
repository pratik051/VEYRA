import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { CartModel } from "@/lib/models/cart-model";

type UpdateCartItemPayload = {
  quantity?: number;
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

export async function PATCH(req: Request, { params }: { params: { itemId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await req.json()) as UpdateCartItemPayload;
  const quantity = Number(body.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "quantity must be a positive number." }, { status: 400 });
  }

  await connectToDatabase();
  const updateResult = await CartModel.updateOne(
    { userId: user._id, "items._id": params.itemId },
    { $set: { "items.$.quantity": quantity } }
  );
  if (updateResult.matchedCount === 0) {
    return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
  }

  const updated = await CartModel.findOne({ userId: user._id }).lean<{ items?: CartItemRecord[] } | null>();
  return NextResponse.json(toCartPayload(updated?.items ?? []));
}

export async function DELETE(_: Request, { params }: { params: { itemId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await connectToDatabase();
  const updateResult = await CartModel.updateOne(
    { userId: user._id },
    { $pull: { items: { _id: params.itemId } } }
  );
  if (updateResult.matchedCount === 0) {
    return NextResponse.json({ error: "Cart not found." }, { status: 404 });
  }
  if (updateResult.modifiedCount === 0) {
    return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
  }

  const updated = await CartModel.findOne({ userId: user._id }).lean<{ items?: CartItemRecord[] } | null>();
  return NextResponse.json(toCartPayload(updated?.items ?? []));
}
