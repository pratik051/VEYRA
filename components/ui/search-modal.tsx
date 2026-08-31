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
      return products.slice(0, 4);
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-white/60 p-4 pt-16 backdrop-blur-sm sm:pt-24 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-black/[0.06] bg-white shadow-modal overflow-hidden">
        {/* Gold top accent */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 0%, #C9A84C 40%, #E8C97A 60%, transparent 100%)" }} />

        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-black/[0.06] px-6 py-4">
          <svg className="h-5 w-5 text-veyra-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fashion, earbuds, watches, chargers, sneakers..."
            className="w-full bg-transparent text-base outline-none placeholder:text-veyra-muted/50 font-medium text-veyra-text"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs text-veyra-muted/70 hover:text-veyra-gold transition-colors duration-200">
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-veyra-muted hover:border-veyra-gold/40 hover:text-veyra-gold transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto px-6 py-3 border-b border-black/[0.06] scrollbar-none bg-veyra-surface-2/30">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-veyra-gold text-black shadow-gold"
                  : "border border-black/5 bg-black/[0.02] text-veyra-muted hover:border-veyra-gold/30 hover:text-veyra-gold-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          <p className="px-2 text-[10px] font-black uppercase tracking-widest text-veyra-muted mb-3">
            {query.trim() ? `Found ${results.length} results` : "Popular & Trending Picks"}
          </p>

          {results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-veyra-text-dark font-medium">No products found matching &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-veyra-muted">Try earbuds, sneakers, watch, or backpack</p>
              <Link
                href="/request-product"
                onClick={onClose}
                className="mt-5 inline-block rounded-xl bg-veyra-gold px-5 py-2.5 text-xs font-bold text-black hover:bg-veyra-gold-light shadow-gold transition-all duration-200"
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
                className="flex items-center gap-4 rounded-2xl p-3 transition-all duration-200 hover:bg-black/[0.02] border border-transparent hover:border-veyra-gold/15 group"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-veyra-surface-2 border border-black/[0.04]">
                  <Image
                    src={`${product.image}?auto=format&fit=crop&w=200&q=80`}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-veyra-muted/80">{product.category}</span>
                    {product.badge && (
                      <span className="rounded-full bg-veyra-gold/10 border border-veyra-gold/20 px-1.5 py-0.5 text-[9px] font-bold text-veyra-gold-dark">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="truncate text-sm font-semibold text-veyra-text-dark group-hover:text-veyra-gold-dark transition-colors duration-200 mt-0.5">{product.name}</h4>
                  <p className="text-xs text-veyra-muted mt-0.5">{product.brand}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-veyra-gold-dark">{formatNpr(product.price)}</p>
                  <p className="text-xs text-veyra-muted/60 line-through">{formatNpr(product.originalPrice)}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-black/[0.06] bg-veyra-surface-2/30 px-6 py-3 flex items-center justify-between text-xs text-veyra-muted">
          <span>Press ESC to close</span>
          <Link href="/shop" onClick={onClose} className="font-bold text-veyra-text-dark hover:text-veyra-gold-dark transition-colors duration-200">
            View All in Shop →
          </Link>
        </div>
      </div>
    </div>
  );
}
