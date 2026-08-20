"use client";

import { useMemo, useState } from "react";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/ui/product-card";
import { searchProducts } from "@/lib/utils";

const sortOptions = ["Featured", "Newest", "Price Low to High", "Price High to Low", "Popular", "Highest Rated"] as const;

export default function ShopPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("Featured");
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState<"all" | "in" | "out">("all");
  const [maxPrice, setMaxPrice] = useState(10000);

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const brands = ["All", ...new Set(products.map((p) => p.brand))];
  const [brand, setBrand] = useState("All");

  const filtered = useMemo(() => {
    let result = searchProducts(products, query);
    if (category !== "All") result = result.filter((p) => p.category === category);
    if (brand !== "All") result = result.filter((p) => p.brand === brand);
    result = result.filter((p) => p.price <= maxPrice && p.rating >= minRating);
    if (availability === "in") result = result.filter((p) => p.stock > 0);
    if (availability === "out") result = result.filter((p) => p.stock <= 0);
    switch (sortBy) {
      case "Newest":
        result = [...result].sort((a, b) => Number(Boolean(b.newArrival)) - Number(Boolean(a.newArrival)));
        break;
      case "Price Low to High":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "Price High to Low":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "Popular":
        result = [...result].sort((a, b) => b.reviews - a.reviews);
        break;
      case "Highest Rated":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        result = [...result].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    }
    return result;
  }, [query, category, brand, maxPrice, minRating, availability, sortBy]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Shop VEYRA</h1>
      <p className="mt-2 text-sm text-neutral-600">Search by product name, category, brand, keywords and tags.</p>
      <div className="mt-6 grid gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 lg:grid-cols-6">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="rounded-lg border border-neutral-300 px-3 py-2 text-sm lg:col-span-2" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
          {brands.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
          {[0, 3, 4, 4.5].map((r) => <option key={r} value={r}>Rating {r === 0 ? "Any" : `${r}+`}</option>)}
        </select>
        <select value={availability} onChange={(e) => setAvailability(e.target.value as "all" | "in" | "out")} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
          <option value="all">Availability: All</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <label className="text-xs text-neutral-600 lg:col-span-2">
          Max Price: Rs. {maxPrice.toLocaleString("en-NP")}
          <input type="range" min={500} max={10000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="mt-2 w-full" />
        </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as (typeof sortOptions)[number])} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm lg:col-span-2">
          {sortOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed p-10 text-center">
          <p className="font-medium">No products matched your filters.</p>
          <p className="mt-2 text-sm text-neutral-600">Try adjusting search, category, rating or price range.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
