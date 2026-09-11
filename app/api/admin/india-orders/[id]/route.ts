import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { IndiaOrderModel } from "@/lib/models/india-order-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
  const user = token ? await getSessionUserByToken(token) : null;
  return user && user.role === "admin";
}

/** GET /api/admin/india-orders/[id] — Fetch single order for admin details panel */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
  }

  const id = params.id;

  try {
    await connectToDatabase();
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isMongoId
      ? { $or: [{ _id: id }, { orderId: id }] }
      : { orderId: id };

    const order = await IndiaOrderModel.findOne(query).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch {
    const memOrder = global.__linkova_mem_india_orders?.get(id);
    if (memOrder) {
      return NextResponse.json({ success: true, order: memOrder });
    }
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
}

/** PATCH /api/admin/india-orders/[id] — Update order/payment status */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
  }

  const id = params.id;
  const body = await req.json().catch(() => ({}));

  const updates: Record<string, any> = {};
  if (body.orderStatus) updates.orderStatus = body.orderStatus;
  if (body.paymentStatus) updates.paymentStatus = body.paymentStatus;
  if (body.paymentTransactionId !== undefined) updates.paymentTransactionId = body.paymentTransactionId;
  updates.updatedAt = new Date();

  try {
    await connectToDatabase();
    const result = await IndiaOrderModel.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }, { orderId: id }] },
      { $set: updates },
      { new: true }
    ).lean();

    return NextResponse.json({ success: true, order: result });
  } catch {
    if (global.__linkova_mem_india_orders) {
      const existing = global.__linkova_mem_india_orders.get(id);
      if (existing) {
        Object.assign(existing, updates);
        return NextResponse.json({ success: true, order: existing });
      }
    }
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
}
