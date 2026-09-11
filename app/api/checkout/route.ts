import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OrderModel } from "@/lib/models/order-model";
import { PaymentModel } from "@/lib/models/payment-model";
import { ProductModel } from "@/lib/models/product-model";
import { initiatePayment } from "@/lib/payments";
import { PaymentProvider } from "@/lib/payments/types";
import { generateId } from "@/lib/utils";
import { products as catalogProducts } from "@/lib/data";

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
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in before checkout." }, { status: 401 });
  const body = (await req.json()) as CheckoutPayload;
  if (!body.fullName || !body.phone || !body.fullAddress || !body.items?.length || !body.paymentMethod) {
    return NextResponse.json({ error: "Missing required checkout information." }, { status: 400 });
  }
  const allowedMethods = new Set(["Khalti", "eSewa", "MyPay", "Bank Transfer", "Cash on Delivery"]);
  if (!allowedMethods.has(body.paymentMethod)) return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
  const deliveryFee = 200;
  await connectToDatabase();
  const dbProducts = await ProductModel.find({ id: { $in: body.items.map((item) => item.productId) } }).lean();
  const priceById = new Map([
    ...catalogProducts.map((product) => [product.id, product.price] as const),
    ...dbProducts.map((product) => [product.id, product.price] as const)
  ]);
  const trustedItems = body.items.map((item) => {
    const price = priceById.get(item.productId);
    return price && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99
      ? { productId: item.productId, quantity: item.quantity, unitPrice: price }
      : null;
  });
  if (trustedItems.some((item) => item === null)) return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
  const validItems = trustedItems.filter((item): item is { productId: string; quantity: number; unitPrice: number } => item !== null);
  const subtotal = validItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const actualDeliveryFee = subtotal >= 3000 ? 0 : deliveryFee;
  const total = subtotal + actualDeliveryFee;
  const orderId = generateId("ORD");
  const paymentMethod = body.paymentMethod || "Cash on Delivery";

  await OrderModel.create({
    userId: user._id,
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
    items: validItems,
    subtotal,
    deliveryFee: actualDeliveryFee,
    total
  });
  const paymentInit = initiatePayment(paymentMethod, {
    orderId,
    amount: total,
    productName: "LINKOVA Order",
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
