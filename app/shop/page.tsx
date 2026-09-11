"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard, AnyProduct } from "@/components/ui/product-card";
import { formatNpr } from "@/lib/utils";
import Link from "next/link";

import { MARKETPLACE_METAS, getMarketplaceMeta } from "@/lib/marketplace-constants";
import { MarketplaceLogo } from "@/components/ui/marketplace-logos";

const sortOptions = [
  "Featured",
  "Newest",
  "Price Low to High",
  "Price High to Low",
  "Popular",
  "Highest Rated"
] as const;

const marketplaceSources = [
  { id: "All", label: "All Marketplaces", emoji: "🇮🇳" },
  ...MARKETPLACE_METAS.map((m) => ({
    id: m.id,
    label: m.name,
    emoji: m.emoji,
    shortName: m.shortName,
    slug: m.slug
  }))
];

const categoryList = [
  "All",
  "Fashion",
  "Footwear",
  "Watches",
  "Bags",
  "Accessories",
  "Beauty & Lifestyle",
  "Mobile Accessories",
  "Tech & Gadgets",
  "Everyday Essentials"
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("category") || "All";
  const initialSource = searchParams.get("source") || "All";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCat);
  const [source, setSource] = useState(initialSource);
  const [brand, setBrand] = useState("All");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("Featured");
  const [minRating, setMinRating] = useState(0);
  const [badgeFilter, setBadgeFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState(25000);

  const [marketplaceProducts, setMarketplaceProducts] = useState<AnyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync with URL search params when user navigates
  useEffect(() => {
    const s = searchParams.get("source");
    if (s) {
      setSource(s);
    }
    const c = searchParams.get("category");
    if (c) {
      setCategory(c);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadMarketplaceCatalog() {
      try {
        const res = await fetch("/api/marketplace/products?limit=100");
        const data = await res.json();
        if (data.success && data.products) {
          setMarketplaceProducts(data.products);
        }
      } catch (e) {
        console.error("Failed to load marketplace catalog:", e);
      } finally {
        setLoading(false);
      }
    }
    loadMarketplaceCatalog();
  }, []);

  // Marketplace products from MongoDB — the ONLY source (no personal catalog fallback)
  const allProducts: AnyProduct[] = useMemo(() => {
    return marketplaceProducts;
  }, [marketplaceProducts]);

  const brands = useMemo(() => ["All", ...new Set(allProducts.map((p) => p.brand).filter(Boolean))], [allProducts]);
  const badges = ["All", "TRENDING", "BEST SELLER", "NEW", "SALE", "FLASH SALE", "HOT"];

  const filtered = useMemo(() => {
    let result = allProducts;

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (category !== "All") {
      result = result.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }

    if (source !== "All") {
      result = result.filter((p) => p.source?.toLowerCase() === source.toLowerCase());
    }

    if (brand !== "All") {
      result = result.filter((p) => p.brand === brand);
    }

    if (badgeFilter !== "All") {
      result = result.filter(
        (p) => p.badge === badgeFilter || (p.badges && p.badges.includes(badgeFilter))
      );
    }

    result = result.filter((p) => {
      const price = p.finalAmountNPR || p.price || 0;
      const rating = p.rating || 4.5;
      return price <= maxPrice && rating >= minRating;
    });

    switch (sortBy) {
      case "Newest":
        result = [...result].sort((a, b) => Number(Boolean(b.isNewArrival || b.newArrival)) - Number(Boolean(a.isNewArrival || a.newArrival)));
        break;
      case "Price Low to High":
        result = [...result].sort((a, b) => (a.finalAmountNPR || a.price || 0) - (b.finalAmountNPR || b.price || 0));
        break;
      case "Price High to Low":
        result = [...result].sort((a, b) => (b.finalAmountNPR || b.price || 0) - (a.finalAmountNPR || a.price || 0));
        break;
      case "Popular":
        result = [...result].sort((a, b) => (b.reviewCount || b.reviews || 0) - (a.reviewCount || a.reviews || 0));
        break;
      case "Highest Rated":
        result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        result = [...result].sort((a, b) => (b.trendingScore || (b.featured ? 90 : 50)) - (a.trendingScore || (a.featured ? 90 : 50)));
    }

    return result;
  }, [allProducts, query, category, source, brand, badgeFilter, maxPrice, minRating, sortBy]);

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setSource("All");
    setBrand("All");
    setBadgeFilter("All");
    setMinRating(0);
    setMaxPrice(15000);
    setSortBy("Featured");
  };

  const inputClass = "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all";
  const selectClass = "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-medium text-neutral-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all appearance-none cursor-pointer";

  const activeMarketplaceMeta = useMemo(() => {
    if (source === "All") return null;
    return getMarketplaceMeta(source);
  }, [source]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-neutral-950 p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            <span>🇮🇳</span> Authentic Indian Marketplace Catalog
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tight text-white">
            Indian Marketplace Store
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Verified, 100% genuine products sourced directly from Amazon India, Flipkart, Myntra, AJIO, Nykaa, and top Indian shopping destinations with door-to-door Nepal delivery.
          </p>
        </div>

        <Link
          href="/request-product"
          className="relative z-10 self-start md:self-auto rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 px-5 py-3 text-xs sm:text-sm font-black transition-all shadow-lg hover:scale-105 inline-flex items-center gap-2 flex-shrink-0"
        >
          <span>Paste Any Indian Link</span>
          <span>→</span>
        </Link>
      </div>

      {/* Marketplace Channel Selector Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span>🇮🇳</span> Filter by Indian Marketplace
          </span>
          {source !== "All" && (
            <button
              type="button"
              onClick={() => setSource("All")}
              className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
            >
              ✕ Show All Marketplaces
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {marketplaceSources.map((s) => {
            const isSelected = source.toLowerCase() === s.id.toLowerCase();
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSource(s.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-neutral-950 text-white border-neutral-950 shadow-sm scale-[1.02]"
                    : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {s.id === "All" ? (
                  <span>🇮🇳</span>
                ) : (
                  <div className="w-5 h-4 flex items-center justify-center">
                    <MarketplaceLogo marketplace={s.id} className="h-3.5 w-auto max-w-[36px]" />
                  </div>
                )}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Marketplace Highlight Banner */}
      {source !== "All" && activeMarketplaceMeta && (
        <div className="rounded-3xl bg-neutral-950 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-neutral-800 shadow-md">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl px-3 py-1 shadow-xs">
                <MarketplaceLogo marketplace={activeMarketplaceMeta.id} className="h-5 w-auto" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                Active Marketplace Channel
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-neutral-300">
                {activeMarketplaceMeta.domain}
              </span>
            </div>
            <h3 className="text-lg font-black text-white">{activeMarketplaceMeta.name} Products</h3>
            <p className="text-xs text-neutral-400">{activeMarketplaceMeta.tagline}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setSource("All")}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
            >
              ✕ Show All
            </button>
            <Link
              href={`/shop/${activeMarketplaceMeta.slug}`}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition shadow-sm"
            >
              Dedicated {activeMarketplaceMeta.shortName} Store ➔
            </Link>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryList.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-all ${
              category.toLowerCase() === cat.toLowerCase()
                ? "bg-neutral-950 text-white shadow-sm"
                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-end shadow-xs">
        {/* Search */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1">
            Search Products
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Amazon, Myntra, Earbuds, Shoes..."
            className={inputClass}
          />
        </div>

        {/* Marketplace Source Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1">
            Marketplace
          </label>
          <select value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
            {marketplaceSources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1">
            Brand
          </label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className={selectClass}>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b === "All" ? "All Brands" : b}
              </option>
            ))}
          </select>
        </div>

        {/* Badges */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1">
            Badge / Deal
          </label>
          <select value={badgeFilter} onChange={(e) => setBadgeFilter(e.target.value)} className={selectClass}>
            {badges.map((b) => (
              <option key={b} value={b}>
                {b === "All" ? "All Deals" : b}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1">
            Sort By
          </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className={selectClass}>
            {sortOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Price Slider */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1">
            <span className="text-neutral-500">Max NPR Price</span>
            <span className="text-red-600 font-black">{formatNpr(maxPrice)}</span>
          </div>
          <input
            type="range"
            min={500}
            max={25000}
            step={250}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full cursor-pointer accent-red-600"
          />
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1">
            Min Rating
          </label>
          <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className={selectClass}>
            <option value={0}>Any Rating</option>
            <option value={4.0}>⭐ 4.0 &amp; above</option>
            <option value={4.5}>⭐ 4.5 &amp; above</option>
          </select>
        </div>

        {/* Reset */}
        <div>
          <button
            onClick={resetFilters}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Showing <strong className="text-neutral-900 font-black">{filtered.length}</strong> verified items
        </p>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 p-12 text-center bg-white">
          <div className="text-4xl mb-3">🇮🇳</div>
          {loading ? (
            <>
              <h3 className="text-lg font-bold text-neutral-900">Loading Indian Marketplace Catalog...</h3>
              <p className="mt-1 text-xs text-neutral-500">Fetching verified products from Amazon India, Flipkart, Myntra &amp; more.</p>
            </>
          ) : marketplaceProducts.length === 0 ? (
            <>
              <h3 className="text-lg font-bold text-neutral-900">Indian marketplace products are currently being updated.</h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
                Our sync is running. Please check again shortly, or paste any Indian product link below to order directly.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  href="/request-product"
                  className="rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-600 transition"
                >
                  ⚡ Paste Indian Product Link
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-neutral-900">No products match your filters</h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
                Try adjusting your search keywords, price range, or category filters.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={resetFilters}
                  className="rounded-xl bg-neutral-950 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-600 transition"
                >
                  Reset Filters
                </button>
                <Link
                  href="/request-product"
                  className="rounded-xl border border-neutral-300 px-5 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Paste Link from Amazon/Flipkart
                </Link>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-20 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-2 font-bold">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            Loading LINKOVA India Catalog...
          </span>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
