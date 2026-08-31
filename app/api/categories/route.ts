import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductModel } from "@/lib/models/product-model";
import { categories as staticCategories } from "@/lib/data";

export async function GET() {
  await connectToDatabase();
  const dbCategories = await ProductModel.distinct("category");
  const normalized = dbCategories
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0)
    .sort((a, b) => a.localeCompare(b));

  if (normalized.length > 0) {
    return NextResponse.json({ categories: normalized });
  }

  return NextResponse.json({ categories: staticCategories.map((item) => item.name) });
}
