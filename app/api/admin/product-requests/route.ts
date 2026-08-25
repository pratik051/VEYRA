import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  await connectToDatabase();
  const requests = await ProductRequestModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ requests });
}
