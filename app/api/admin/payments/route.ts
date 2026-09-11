import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { connectToDatabase } from "@/lib/db/mongodb";
import { PaymentModel } from "@/lib/models/payment-model";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  await connectToDatabase();
  const payments = await PaymentModel.find({ status: { $in: ["submitted", "verified", "rejected"] } })
    .populate("userId", "fullName email phone")
    .sort({ createdAt: -1 }).lean();
  return NextResponse.json({ payments });
}
