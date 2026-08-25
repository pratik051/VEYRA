"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/ui/product-card";
import { formatNpr, searchProducts } from "@/lib/utils";
import Link from "next/link";

const sortOptions = [
  "Featured",
  "Newest",
  "Price Low to High",
  "Price High to Low",
  "Popular",
  "Highest Rated"
] as const;

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("category") || "All";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCat);
  const [brand, setBrand] = useState("All");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("Featured");
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState<"all" | "in" | "out">("all");
  const [badgeFilter, setBadgeFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState(7000);

  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category))], []);
  const brands = useMemo(() => ["All", ...new Set(products.map((p) => p.brand))], []);
  const badges = ["All", "TRENDING", "BEST SELLER", "NEW", "SALE"];

  const filtered = useMemo(() => {
    let result = searchProducts(products, query);
    if (category !== "All") result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    if (brand !== "All") result = result.filter((p) => p.brand === brand);
    if (badgeFilter !== "All") result = result.filter((p) => p.badge === badgeFilter);
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
  }, [query, category, brand, badgeFilter, maxPrice, minRating, availability, sortBy]);

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setBrand("All");
    setBadgeFilter("All");
    setMinRating(0);
    setAvailability("all");
    setMaxPrice(7000);
    setSortBy("Featured");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900">Shop VEYRA</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Browse authentic wearables, accessories, tech gadgets &amp; essentials available in Nepal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/request-product"
            className="rounded-xl border border-veyra-gold bg-veyra-gold/10 px-4 py-2 text-xs font-bold text-veyra-gold-dark hover:bg-veyra-gold/20 transition"
          >
            🇮🇳 Request from Amazon/Flipkart →
          </Link>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
              category.toLowerCase() === cat.toLowerCase()
                ? "bg-black text-white shadow-sm"
                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-black"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Filter Bar */}
      <div className="mt-4 grid gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-end">
        {/* Search */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            Search
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, tag, category..."
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 focus:border-black focus:outline-none"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            Brand
          </label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 focus:border-black focus:outline-none"
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b === "All" ? "All Brands" : b}
              </option>
            ))}
          </select>
        </div>

        {/* Badge / Collection */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            Badge
          </label>
          <select
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 focus:border-black focus:outline-none"
          >
            {badges.map((b) => (
              <option key={b} value={b}>
                {b === "All" ? "All Badges" : b}
              </option>
            ))}
          </select>
        </div>

        {/* Min Rating */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            Rating
          </label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 focus:border-black focus:outline-none"
          >
            <option value={0}>Any Rating</option>
            <option value={4.0}>⭐ 4.0 &amp; above</option>
            <option value={4.5}>⭐ 4.5 &amp; above</option>
            <option value={4.8}>⭐ 4.8 &amp; above</option>
          </select>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            Stock
          </label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as "all" | "in" | "out")}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 focus:border-black focus:outline-none"
          >
            <option value="all">All Items</option>
            <option value="in">In Stock Only</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        {/* Max Price Range Slider */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            <span>Max Price</span>
            <span className="text-neutral-900 font-bold">{formatNpr(maxPrice)}</span>
          </div>
          <input
            type="range"
            min={500}
            max={7000}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-black cursor-pointer"
          />
        </div>

        {/* Sort By */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as (typeof sortOptions)[number])}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-900 focus:border-black focus:outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <div className="sm:col-span-2">
          <button
            onClick={resetFilters}
            className="w-full rounded-xl border border-neutral-300 bg-white py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="mt-6 flex items-center justify-between text-xs text-neutral-500">
        <p>
          Showing <strong className="text-neutral-900">{filtered.length}</strong> of{" "}
          <strong className="text-neutral-900">{products.length}</strong> products
        </p>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 p-12 text-center bg-neutral-50/50">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-neutral-900">No products match your current filters</h3>
          <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search keywords, price range, or category filters.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={resetFilters}
              className="rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition"
            >
              Reset All Filters
            </button>
            <Link
              href="/request-product"
              className="rounded-xl border border-black px-5 py-2.5 text-xs font-semibold text-black hover:bg-neutral-100 transition"
            >
              Request Custom Item
            </Link>
          </div>
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

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Loading VEYRA Catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
