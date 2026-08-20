import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OrderModel } from "@/lib/models/order-model";
import { PaymentModel } from "@/lib/models/payment-model";
import { initiatePayment } from "@/lib/payments";
import { PaymentProvider } from "@/lib/payments/types";
import { generateId } from "@/lib/utils";

type CheckoutPayload = {
  fullName?: string;
  phone?: string;
  email?: string;
  province?: string;
  district?: string;
  city?: string;
  ward?: string;
  fullAddress?: string;
  paymentMethod?: PaymentProvider;
  items?: Array<{ productId: string; quantity: number; unitPrice: number }>;
};

export async function POST(req: Request) {
  const body = (await req.json()) as CheckoutPayload;
  if (!body.fullName || !body.phone || !body.fullAddress || !body.items?.length) {
    return NextResponse.json({ error: "Missing required checkout information." }, { status: 400 });
  }
  const deliveryFee = 250;
  const subtotal = body.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = subtotal + deliveryFee;
  const orderId = generateId("ORD");
  const paymentMethod = body.paymentMethod || "Cash on Delivery";

  await connectToDatabase();
  await OrderModel.create({
    orderId,
    fullName: body.fullName,
    phone: body.phone,
    email: body.email || "",
    province: body.province || "",
    district: body.district || "",
    city: body.city || "",
    ward: body.ward || "",
    fullAddress: body.fullAddress,
    paymentMethod,
    paymentStatus: "Pending",
    orderStatus: "Order Placed",
    items: body.items,
    subtotal,
    deliveryFee,
    total
  });
  const paymentInit = initiatePayment(paymentMethod, {
    orderId,
    amount: total,
    productName: "VEYRA Order",
    customerName: body.fullName,
    customerPhone: body.phone
  });
  await PaymentModel.create({
    orderId,
    provider: paymentMethod,
    amount: total,
    currency: "NPR",
    status: "Pending",
    providerReference: "",
    rawPayload: paymentInit.payload || {}
  });

  return NextResponse.json({
    message: "Order Confirmed!",
    orderId,
    paymentStatus: "Pending",
    orderStatus: "Order Placed",
    payment: paymentInit
  });
}
