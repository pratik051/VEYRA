import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { connectToDatabase } from "@/lib/db/mongodb";
import { PaymentModel } from "@/lib/models/payment-model";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  await connectToDatabase();
  const paymentResult = await PaymentModel.findOne({ _id: params.id }).lean();
  const payment = Array.isArray(paymentResult) ? paymentResult[0] : paymentResult;
  if (!payment?.screenshot) return NextResponse.json({ error: "Screenshot not found." }, { status: 404 });
  try {
    const file = await readFile(path.join(process.cwd(), "private", "payment-screenshots", payment.screenshot));
    const type = payment.screenshot.endsWith(".png") ? "image/png" : payment.screenshot.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return new NextResponse(file, { headers: { "Content-Type": type, "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Screenshot not found." }, { status: 404 });
  }
}
