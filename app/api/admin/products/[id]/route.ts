import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductModel } from "@/lib/models/product-model";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await req.json()) as Record<string, unknown>;
  await connectToDatabase();
  const updated = await ProductModel.findByIdAndUpdate(params.id, body, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ product: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  await connectToDatabase();
  const deleted = await ProductModel.findByIdAndDelete(params.id).lean();
  if (!deleted) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
