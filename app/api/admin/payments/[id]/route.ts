import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OrderModel } from "@/lib/models/order-model";
import { PaymentModel } from "@/lib/models/payment-model";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await req.json()) as { status?: "verified" | "rejected" };
  if (body.status !== "verified" && body.status !== "rejected") return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
  await connectToDatabase();
  const paymentResult = await PaymentModel.findOneAndUpdate(
    { _id: params.id },
    { status: body.status, ...(body.status === "verified" ? { verifiedAt: new Date() } : {}) },
    { new: true }
  ).lean();
  const payment = Array.isArray(paymentResult) ? paymentResult[0] : paymentResult;
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  await OrderModel.updateOne(
    { orderId: payment.orderId },
    { paymentStatus: body.status, orderStatus: body.status === "verified" ? "Payment Confirmed" : "Payment Rejected" }
  );
  return NextResponse.json({ payment });
}
