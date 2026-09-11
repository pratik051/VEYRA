import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductModel } from "@/lib/models/product-model";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  await connectToDatabase();
  const products = await ProductModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await req.json()) as {
    name?: string;
    category?: string;
    brand?: string;
    price?: number;
    originalPrice?: number;
    stock?: number;
    image?: string;
    description?: string;
  };
  if (!body.name || !body.category || !body.price || !body.originalPrice || !body.image) {
    return NextResponse.json({ error: "name, category, price, originalPrice and image are required." }, { status: 400 });
  }
  await connectToDatabase();
  const created = await ProductModel.create({
    slug: slugify(body.name),
    name: body.name,
    category: body.category,
    brand: body.brand || "LINKOVA",
    price: body.price,
    originalPrice: body.originalPrice,
    stock: body.stock ?? 0,
    image: body.image,
    gallery: [body.image],
    description: body.description || "",
    colors: [],
    tags: []
  });
  return NextResponse.json({ product: created }, { status: 201 });
}
