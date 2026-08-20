import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { connectToDatabase } from "@/lib/db/mongodb";
import { OrderModel } from "@/lib/models/order-model";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  await connectToDatabase();
  const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ orders });
}
