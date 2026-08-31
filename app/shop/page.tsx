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

  const inputClass = "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-medium text-veyra-text-dark placeholder-veyra-muted/60 focus:border-veyra-gold/60 focus:outline-none focus:ring-1 focus:ring-veyra-gold/30 transition-all duration-200";
  const selectClass = "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-medium text-veyra-text-dark focus:border-veyra-gold/60 focus:outline-none focus:ring-1 focus:ring-veyra-gold/30 transition-all duration-200 appearance-none cursor-pointer";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-black/[0.06] pb-8">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-veyra-gold mb-2">
            <span className="h-px w-5 bg-veyra-gold" />
            Catalog
          </span>
          <h1 className="font-display text-4xl font-black text-veyra-text-dark">Shop VEYRA</h1>
          <p className="mt-1.5 text-sm text-veyra-muted">
            Browse authentic wearables, accessories, tech gadgets &amp; essentials available in Nepal.
          </p>
        </div>
        <Link
          href="/request-product"
          className="self-start inline-flex items-center gap-2 rounded-xl border border-veyra-gold/30 bg-veyra-gold/10 px-5 py-2.5 text-xs font-bold text-veyra-gold hover:bg-veyra-gold/20 hover:border-veyra-gold/50 transition-all duration-200"
        >
          🇮🇳 Request from Amazon/Flipkart →
        </Link>
      </div>

      {/* Category Pills */}
      <div className="mt-7 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold tracking-wide transition-all duration-200 ${
              category.toLowerCase() === cat.toLowerCase()
                ? "bg-veyra-gold text-black shadow-gold"
                : "border border-black/5 bg-black/[0.02] text-veyra-muted hover:border-veyra-gold/30 hover:text-veyra-gold-dark"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="mt-5 grid gap-3 rounded-2xl border border-black/[0.06] bg-white p-5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-end">
        {/* Search */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-veyra-muted mb-1.5">
            Search
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, tag, category..."
            className={inputClass}
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-veyra-muted mb-1.5">
            Brand
          </label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectClass}>
            {brands.map((b) => (
              <option key={b} value={b} className="bg-white text-veyra-text-dark">
                {b === "All" ? "All Brands" : b}
              </option>
            ))}
          </select>
        </div>

        {/* Badge */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-veyra-muted mb-1.5">
            Badge
          </label>
          <select value={badgeFilter} onChange={(e) => setBadgeFilter(e.target.value)} className={selectClass}>
            {badges.map((b) => (
              <option key={b} value={b} className="bg-white text-veyra-text-dark">
                {b === "All" ? "All Badges" : b}
              </option>
            ))}
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-veyra-muted mb-1.5">
            Rating
          </label>
          <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className={selectClass}>
            <option value={0} className="bg-white text-veyra-text-dark">Any Rating</option>
            <option value={4.0} className="bg-white text-veyra-text-dark">⭐ 4.0 &amp; above</option>
            <option value={4.5} className="bg-white text-veyra-text-dark">⭐ 4.5 &amp; above</option>
            <option value={4.8} className="bg-white text-veyra-text-dark">⭐ 4.8 &amp; above</option>
          </select>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-veyra-muted mb-1.5">
            Stock
          </label>
          <select value={availability} onChange={(e) => setAvailability(e.target.value as "all" | "in" | "out")} className={selectClass}>
            <option value="all" className="bg-white text-veyra-text-dark">All Items</option>
            <option value="in" className="bg-white text-veyra-text-dark">In Stock Only</option>
            <option value="out" className="bg-white text-veyra-text-dark">Out of Stock</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
            <span className="text-veyra-muted">Max Price</span>
            <span className="text-veyra-gold font-black">{formatNpr(maxPrice)}</span>
          </div>
          <input
            type="range"
            min={500}
            max={7000}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full cursor-pointer accent-veyra-gold"
            style={{ accentColor: "#C9A84C" }}
          />
        </div>

        {/* Sort */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-veyra-muted mb-1.5">
            Sort By
          </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as (typeof sortOptions)[number])} className={selectClass}>
            {sortOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-white text-veyra-text-dark">
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <div className="sm:col-span-2">
          <button
            onClick={resetFilters}
            className="w-full rounded-xl border border-black/10 bg-black/[0.02] py-2.5 text-xs font-bold text-veyra-muted hover:border-veyra-gold/30 hover:text-veyra-gold-dark transition-all duration-200"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-7 flex items-center justify-between">
        <p className="text-xs text-veyra-muted">
          Showing <strong className="text-veyra-gold-dark font-black">{filtered.length}</strong> of{" "}
          <strong className="text-veyra-muted">{products.length}</strong> products
        </p>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-black/[0.08] p-14 text-center bg-white/50">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="font-display text-lg font-bold text-veyra-text-dark">No products match your filters</h3>
          <p className="mt-2 text-xs text-veyra-muted max-w-sm mx-auto">
            Try adjusting your search keywords, price range, or category filters.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={resetFilters}
              className="rounded-xl bg-veyra-gold px-6 py-2.5 text-xs font-bold text-black hover:bg-veyra-gold-light shadow-gold transition-all duration-200"
            >
              Reset All Filters
            </button>
            <Link
              href="/request-product"
              className="rounded-xl border border-black/10 px-6 py-2.5 text-xs font-semibold text-veyra-muted hover:border-veyra-gold/30 hover:text-veyra-gold-dark transition-all duration-200"
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
    <Suspense fallback={
      <div className="flex items-center justify-center p-20 text-sm text-veyra-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-veyra-gold animate-pulse-slow" />
          Loading VEYRA Catalog...
        </span>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
