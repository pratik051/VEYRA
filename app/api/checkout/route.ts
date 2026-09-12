import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OrderModel } from "@/lib/models/order-model";
import { PaymentModel } from "@/lib/models/payment-model";
import { ProductModel } from "@/lib/models/product-model";
import { AddressModel } from "@/lib/models/address-model";
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
  landmark?: string;
  postalCode?: string;
  country?: string;
  saveAsDefault?: boolean;
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
  
  // Use authoritative backend calculation for breakdown, referral, and 50% COD advance
  const referralCode = String(body.referralCode || "").trim();
  const paymentMethodChoice = body.paymentMethod || "Cash on Delivery";

  const calc = calculateOrderBreakdown({
    subtotal,
    deliveryFee: actualDeliveryFee,
    referralCode,
    paymentMethod: paymentMethodChoice
  });

  const orderId = generateId("ORD");
  const isCod = paymentMethodChoice === "COD" || paymentMethodChoice === "Cash on Delivery";
  const paymentMethod = isCod ? "COD" : paymentMethodChoice;

  // Construct complete immutable shipping address snapshot
  const shippingAddress = {
    fullName: body.fullName.trim(),
    phone: body.phone.trim(),
    email: (body.email || user.email || "").trim(),
    province: (body.province || "Bagmati").trim(),
    district: (body.district || "").trim(),
    city: (body.city || "").trim(),
    ward: (body.ward || "").trim(),
    fullAddress: body.fullAddress.trim(),
    addressLine1: body.fullAddress.trim(),
    addressLine2: "",
    landmark: (body.landmark || "").trim(),
    postalCode: (body.postalCode || "").trim(),
    country: (body.country || "Nepal").trim()
  };

  // If user requested to save this address as default, save it
  if (body.saveAsDefault) {
    try {
      await AddressModel.updateMany({ userId: user._id }, { $set: { isDefault: false } });
      await AddressModel.create({
        userId: user._id,
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        email: shippingAddress.email,
        province: shippingAddress.province,
        district: shippingAddress.district,
        city: shippingAddress.city,
        ward: shippingAddress.ward,
        fullAddress: shippingAddress.fullAddress,
        addressLine1: shippingAddress.fullAddress,
        landmark: shippingAddress.landmark,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        label: "Home",
        isDefault: true
      });
    } catch (saveErr) {
      console.warn("Failed to auto-save default address during checkout:", saveErr);
    }
  }

  await OrderModel.create({
    userId: user._id,
    orderId,
    fullName: shippingAddress.fullName,
    phone: shippingAddress.phone,
    email: shippingAddress.email,
    province: shippingAddress.province,
    district: shippingAddress.district,
    city: shippingAddress.city,
    ward: shippingAddress.ward,
    fullAddress: shippingAddress.fullAddress,
    landmark: shippingAddress.landmark,
    shippingAddress, // Immutable address snapshot preserved forever
    paymentMethod,
    paymentStatus: "Pending",
    onlinePaymentStatus: "Pending",
    codPaymentStatus: isCod ? "Pending" : "Not Applicable",
    orderStatus: "Order Placed",
    items: validItems,
    subtotal: calc.subtotal,
    deliveryFee: calc.deliveryFee,
    discount: calc.discount,
    referralCode: calc.referralApplied ? referralCode.toUpperCase() : "",
    total: calc.finalAmount,
    onlineAdvanceAmount: calc.onlineAmount,
    codRemainingAmount: calc.codAmount
  });

  const paymentInit = initiatePayment(paymentMethodChoice, {
    orderId,
    amount: calc.onlineAmount,
    productName: "LINKOVA Order",
    customerName: body.fullName,
    customerPhone: body.phone
  });

  await PaymentModel.create({
    orderId,
    provider: paymentMethodChoice,
    paymentMethod: paymentMethodChoice,
    amount: calc.onlineAmount,
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
