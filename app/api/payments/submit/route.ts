import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OrderModel } from "@/lib/models/order-model";
import { PaymentModel } from "@/lib/models/payment-model";

const allowedMethods = new Set(["Khalti", "eSewa", "MyPay"]);
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const form = await req.formData();
  const orderId = String(form.get("orderId") || "").trim();
  const paymentMethod = String(form.get("paymentMethod") || "").trim();
  const transactionCode = String(form.get("transactionCode") || "").trim();
  const screenshot = form.get("screenshot");
  if (!orderId || !allowedMethods.has(paymentMethod) || !transactionCode || !(screenshot instanceof File)) {
    return NextResponse.json({ error: "Payment method, transaction code, and screenshot are required." }, { status: 400 });
  }
  if (!allowedTypes.has(screenshot.type) || screenshot.size === 0 || screenshot.size > maxFileSize) {
    return NextResponse.json({ error: "Screenshot must be a PNG, JPG, or WEBP image up to 5MB." }, { status: 400 });
  }

  await connectToDatabase();
  const orderResult = await OrderModel.findOne({ orderId }).lean();
  const order = Array.isArray(orderResult) ? orderResult[0] : orderResult;
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.paymentMethod !== paymentMethod || Number(order.total) <= 0) {
    return NextResponse.json({ error: "Payment details do not match this order." }, { status: 400 });
  }
  const existing = await PaymentModel.findOne({ transactionCode }).lean();
  if (existing) return NextResponse.json({ error: "This transaction code has already been used." }, { status: 409 });

  const extension = screenshot.type === "image/png" ? "png" : screenshot.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "private", "payment-screenshots");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await screenshot.arrayBuffer()));

  try {
    await PaymentModel.create({
      userId: user._id,
      orderId,
      provider: paymentMethod,
      paymentMethod,
      amount: order.total,
      currency: "NPR",
      transactionCode,
      screenshot: filename,
      status: "submitted",
      submittedAt: new Date()
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "This transaction code has already been used." }, { status: 409 });
    }
    throw error;
  }
  await OrderModel.updateOne({ orderId }, { paymentStatus: "submitted" });
  return NextResponse.json({ message: "Payment submitted successfully. Your payment is waiting for verification." });
}
