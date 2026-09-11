import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { initiatePayment } from "@/lib/payments";
import { PaymentProvider } from "@/lib/payments/types";

export async function POST(req: Request) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await req.json()) as {
    provider?: PaymentProvider;
    orderId?: string;
    amount?: number;
    productName?: string;
    customerName?: string;
    customerPhone?: string;
  };
  if (!body.provider || !body.orderId || !body.amount || !body.customerName || !body.customerPhone) {
    return NextResponse.json({ error: "provider, orderId, amount, customerName and customerPhone are required." }, { status: 400 });
  }
  const payment = initiatePayment(body.provider, {
    orderId: body.orderId,
    amount: body.amount,
    productName: body.productName || "LINKOVA Order",
    customerName: body.customerName,
    customerPhone: body.customerPhone
  });
  return NextResponse.json({ payment });
}
