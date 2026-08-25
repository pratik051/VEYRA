import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OrderModel } from "@/lib/models/order-model";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await req.json()) as {
    orderStatus?: string;
    paymentStatus?: string;
    trackingNumber?: string;
    internalNotes?: string;
  };
  await connectToDatabase();
  const updated = await OrderModel.findByIdAndUpdate(
    params.id,
    {
      ...(body.orderStatus ? { orderStatus: body.orderStatus } : {}),
      ...(body.paymentStatus ? { paymentStatus: body.paymentStatus } : {}),
      ...(body.trackingNumber ? { trackingNumber: body.trackingNumber } : {}),
      ...(body.internalNotes ? { internalNotes: body.internalNotes } : {})
    },
    { new: true }
  ).lean();
  if (!updated) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ order: updated });
}
