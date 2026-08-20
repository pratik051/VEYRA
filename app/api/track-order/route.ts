import { NextResponse } from "next/server";
import { orderTimeline } from "@/lib/data";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OrderModel } from "@/lib/models/order-model";

export async function POST(req: Request) {
  const body = (await req.json()) as { orderId?: string; contact?: string };
  if (!body.orderId || !body.contact) {
    return NextResponse.json({ error: "orderId and contact are required." }, { status: 400 });
  }

  await connectToDatabase();
  const order = await OrderModel.findOne<{ orderStatus?: string }>({ orderId: body.orderId }).lean();
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  const currentStep = typeof order.orderStatus === "string" ? order.orderStatus : "Order Placed";

  return NextResponse.json({
    orderId: body.orderId,
    currentStep,
    timeline: orderTimeline
  });
}
