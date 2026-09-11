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
  
  // Admin Manual Verification fields
  if (body.adminVerificationStatus) {
    updates.adminVerificationStatus = body.adminVerificationStatus;
    updates.adminVerifiedAt = new Date();
    
    // Synchronize orderStatus and stockStatus if verified or alternative
    if (body.adminVerificationStatus === "Verified / Orderable") {
      updates.orderStatus = "Verified";
      updates.stockStatus = "In Stock";
      updates.deliveryStatus = "Delivery Available";
    } else if (body.adminVerificationStatus === "Alternative Required") {
      updates.stockStatus = "Alternative Required";
    } else if (body.adminVerificationStatus === "Unavailable") {
      updates.stockStatus = "Unavailable";
    } else if (body.adminVerificationStatus === "Rejected") {
      updates.orderStatus = "Cancelled";
      updates.stockStatus = "Rejected";
    }
  }
  if (body.adminStockStatus !== undefined) updates.adminStockStatus = body.adminStockStatus;
  if (body.adminDeliveryStatus !== undefined) updates.adminDeliveryStatus = body.adminDeliveryStatus;
  if (body.adminVerifiedPriceINR !== undefined) updates.adminVerifiedPriceINR = Number(body.adminVerifiedPriceINR);
  if (body.adminVerifiedVariant !== undefined) updates.adminVerifiedVariant = body.adminVerifiedVariant;
  if (body.adminNote !== undefined) updates.adminNote = body.adminNote;
  if (body.alternativeSourceUrl !== undefined) updates.alternativeSourceUrl = body.alternativeSourceUrl;
  if (body.alternativePriceINR !== undefined) updates.alternativePriceINR = Number(body.alternativePriceINR);
  if (body.alternativeStatus !== undefined) updates.alternativeStatus = body.alternativeStatus;

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
