"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/data";
import { formatNpr } from "@/lib/utils";
import { Product } from "@/lib/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category))], []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim() && selectedCategory === "All") {
      return products.slice(0, 4); // show trending recommendations when empty
    }
    const q = query.toLowerCase().trim();
    return products.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [query, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-sm sm:pt-24 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
        {/* Search input header */}
        <div className="flex items-center gap-3 border-b border-neutral-100 px-6 py-4">
          <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fashion, earbuds, watches, chargers, sneakers..."
            className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400 font-medium"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs text-neutral-400 hover:text-black">
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black transition"
          >
            ✕
          </button>
        </div>

        {/* Quick category chips */}
        <div className="flex gap-2 overflow-x-auto px-6 py-3 border-b border-neutral-100 scrollbar-none bg-neutral-50/50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-black text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {query.trim() ? `Found ${results.length} results` : "Popular & Trending Picks"}
          </p>

          {results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-neutral-500 font-medium">No products found matching &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-neutral-400">Try searching for keywords like earbuds, sneakers, watch, or backpack</p>
              <Link
                href="/request-product"
                onClick={onClose}
                className="mt-4 inline-block rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
              >
                Request Product from India
              </Link>
            </div>
          ) : (
            results.map((product: Product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="flex items-center gap-4 rounded-2xl p-3 transition hover:bg-neutral-50 border border-transparent hover:border-neutral-200 group"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                  <Image
                    src={`${product.image}?auto=format&fit=crop&w=200&q=80`}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase text-neutral-400">{product.category}</span>
                    {product.badge && (
                      <span className="rounded-full bg-black px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="truncate text-sm font-semibold text-neutral-900">{product.name}</h4>
                  <p className="text-xs text-neutral-500">{product.brand}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm text-neutral-900">{formatNpr(product.price)}</p>
                  <p className="text-xs text-neutral-400 line-through">{formatNpr(product.originalPrice)}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-3 flex items-center justify-between text-xs text-neutral-500">
          <span>Press ESC to close</span>
          <Link href="/shop" onClick={onClose} className="font-semibold text-neutral-900 hover:text-veyra-gold transition">
            View All in Shop →
          </Link>
        </div>
      </div>
    </div>
  );
}
