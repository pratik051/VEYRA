import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductModel } from "@/lib/models/product-model";
import { products as staticProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

type ProductView = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  tags: string[];
  colors: string[];
  sizes?: string[];
  description: string;
  specs: Record<string, string>;
  image: string;
  gallery: string[];
};

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

type ProductSort = "newest" | "price_asc" | "price_desc" | "trending";

function parsePositiveInt(raw: string | null, fallback: number, max: number): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function toProductView(item: ProductRecord): ProductView {
  const specsValue = item.specs;
  const specs =
    specsValue instanceof Map
      ? Object.fromEntries(specsValue.entries())
      : (specsValue ?? {});

  return {
    id: String(item._id ?? item.id ?? ""),
    slug: String(item.slug ?? ""),
    name: String(item.name ?? ""),
    category: String(item.category ?? ""),
    brand: String(item.brand ?? "LINKOVA"),
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

function applySort(items: ProductView[], sort: ProductSort): ProductView[] {
  const copy = [...items];
  if (sort === "price_asc") return copy.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") return copy.sort((a, b) => b.price - a.price);
  if (sort === "trending") {
    return copy.sort((a, b) => {
      if (Boolean(a.trending) === Boolean(b.trending)) return b.reviews - a.reviews;
      return Number(Boolean(b.trending)) - Number(Boolean(a.trending));
    });
  }
  return copy.sort((a, b) => Number(Boolean(b.newArrival)) - Number(Boolean(a.newArrival)));
}

function filterStaticProducts(items: ProductView[], q: string, category: string, minPrice?: number, maxPrice?: number) {
  const search = q.trim().toLowerCase();
  const normalizedCategory = category.trim().toLowerCase();
  return items.filter((item) => {
    if (normalizedCategory && normalizedCategory !== "all" && item.category.toLowerCase() !== normalizedCategory) return false;
    if (typeof minPrice === "number" && item.price < minPrice) return false;
    if (typeof maxPrice === "number" && item.price > maxPrice) return false;
    if (!search) return true;
    const combined = [item.name, item.category, item.brand, ...item.tags].join(" ").toLowerCase();
    return combined.includes(search);
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = (searchParams.get("sort") ?? "newest") as ProductSort;
  const page = parsePositiveInt(searchParams.get("page"), 1, 10000);
  const limit = parsePositiveInt(searchParams.get("limit"), 12, 100);
  const minPriceRaw = searchParams.get("minPrice");
  const maxPriceRaw = searchParams.get("maxPrice");
  const minPrice = minPriceRaw !== null ? Number(minPriceRaw) : undefined;
  const maxPrice = maxPriceRaw !== null ? Number(maxPriceRaw) : undefined;

  const isValidSort = sort === "newest" || sort === "price_asc" || sort === "price_desc" || sort === "trending";
  const resolvedSort: ProductSort = isValidSort ? sort : "newest";

  const skip = (page - 1) * limit;

  try {
    await connectToDatabase();

    const filters: Record<string, unknown> = {};
    if (category && category.toLowerCase() !== "all") {
      filters.category = new RegExp(`^${category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }
    if (typeof minPrice === "number" || typeof maxPrice === "number") {
      const priceFilter: Record<string, number> = {};
      if (typeof minPrice === "number" && Number.isFinite(minPrice)) priceFilter.$gte = minPrice;
      if (typeof maxPrice === "number" && Number.isFinite(maxPrice)) priceFilter.$lte = maxPrice;
      filters.price = priceFilter;
    }
    if (q.trim()) {
      const search = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filters.$or = [{ name: search }, { category: search }, { brand: search }, { tags: search }];
    }

    const sortQuery: Record<string, 1 | -1> = {};
    if (resolvedSort === "price_asc") sortQuery.price = 1;
    else if (resolvedSort === "price_desc") sortQuery.price = -1;
    else if (resolvedSort === "trending") {
      sortQuery.trending = -1;
      sortQuery.reviews = -1;
      sortQuery.createdAt = -1;
    } else {
      sortQuery.newArrival = -1;
      sortQuery.createdAt = -1;
    }

    const [total, dbItems] = await Promise.all([
      ProductModel.countDocuments(filters),
      ProductModel.find(filters).sort(sortQuery).skip(skip).limit(limit).lean<ProductRecord[]>()
    ]);

    if (total > 0) {
      return NextResponse.json({
        items: dbItems.map(toProductView),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    }
  } catch (error) {
    console.warn("Database product query failed, using static catalog:", error);
  }

  const staticViewItems: ProductView[] = staticProducts.map((item) => ({
    ...item,
    id: item.id
  }));
  const staticFiltered = filterStaticProducts(staticViewItems, q, category, minPrice, maxPrice);
  const staticSorted = applySort(staticFiltered, resolvedSort);
  const staticPaged = staticSorted.slice(skip, skip + limit);

  return NextResponse.json({
    items: staticPaged,
    pagination: {
      page,
      limit,
      total: staticSorted.length,
      totalPages: Math.ceil(staticSorted.length / limit)
    }
  });
}
