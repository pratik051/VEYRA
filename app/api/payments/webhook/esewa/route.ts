import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { PaymentModel } from "@/lib/models/payment-model";
import { OrderModel } from "@/lib/models/order-model";

export async function POST(req: Request) {
  const body = (await req.json()) as { orderId?: string; status?: string; referenceId?: string; payload?: unknown };
  if (!body.orderId || !body.status) {
    return NextResponse.json({ error: "orderId and status are required." }, { status: 400 });
  }
  await connectToDatabase();
  await PaymentModel.updateOne(
    { orderId: body.orderId, provider: "eSewa" },
    { status: body.status, providerReference: body.referenceId || "", rawPayload: body.payload || {} }
  );
  await OrderModel.updateOne(
    { orderId: body.orderId },
    { paymentStatus: body.status === "COMPLETE" ? "Confirmed" : "Pending", orderStatus: body.status === "COMPLETE" ? "Payment Confirmed" : "Order Placed" }
  );
  return NextResponse.json({ ok: true });
}
