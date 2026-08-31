import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductModel } from "@/lib/models/product-model";
import { products as staticProducts } from "@/lib/data";

type ProductRecord = {
  _id?: unknown;
  id?: string;
  slug?: string;
  name?: string;
  category?: string;
  brand?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  stock?: number;
  badge?: string;
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  description?: string;
  specs?: Record<string, string> | Map<string, string>;
  image?: string;
  gallery?: string[];
};

function toProductView(item: ProductRecord) {
  const specsValue = item.specs;
  const specs = specsValue instanceof Map ? Object.fromEntries(specsValue.entries()) : (specsValue ?? {});
  return {
    id: String(item._id ?? item.id ?? ""),
    slug: String(item.slug ?? ""),
    name: String(item.name ?? ""),
    category: String(item.category ?? ""),
    brand: String(item.brand ?? "VEYRA"),
    price: Number(item.price ?? 0),
    originalPrice: Number(item.originalPrice ?? 0),
    rating: Number(item.rating ?? 0),
    reviews: Number(item.reviews ?? 0),
    stock: Number(item.stock ?? 0),
    badge: item.badge,
    featured: Boolean(item.featured),
    trending: Boolean(item.trending),
    newArrival: Boolean(item.newArrival),
    tags: Array.isArray(item.tags) ? item.tags : [],
    colors: Array.isArray(item.colors) ? item.colors : [],
    sizes: Array.isArray(item.sizes) ? item.sizes : [],
    description: String(item.description ?? ""),
    specs,
    image: String(item.image ?? ""),
    gallery: Array.isArray(item.gallery) ? item.gallery : []
  };
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  await connectToDatabase();
  const product = await ProductModel.findOne({ slug: params.slug }).lean<ProductRecord | null>();
  if (product) {
    return NextResponse.json({ product: toProductView(product) });
  }

  const staticProduct = staticProducts.find((item) => item.slug === params.slug);
  if (!staticProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({
    product: {
      ...staticProduct,
      id: staticProduct.id
    }
  });
}
