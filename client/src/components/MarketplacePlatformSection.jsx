import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { MARKETPLACE_METAS } from '../constants/marketplaces';
import { MarketplaceLogo } from './MarketplaceLogos';

export function MarketplacePlatformSection({ initialProducts = [], onQuickView }) {
  const [activePlatformId, setActivePlatformId] = useState("amazon-india");

  const activeMeta = useMemo(() => {
    return (
      MARKETPLACE_METAS.find((m) => m.id === activePlatformId) ||
      MARKETPLACE_METAS[0]
    );
  }, [activePlatformId]);

  // Strictly filter products to selected marketplace or mock
  const platformProducts = useMemo(() => {
    const matched = initialProducts.filter(
      (p) =>
        (p.source && p.source.toLowerCase() === activePlatformId.toLowerCase()) ||
        (activePlatformId === "amazon-india" && (p.source?.toLowerCase() === "amazon" || p.brand === "boAt")) ||
        (activePlatformId === "noise" && p.brand === "Noise") ||
        (activePlatformId === "boat" && p.brand === "boAt")
    );
    return matched.length > 0 ? matched : initialProducts.slice(0, 4);
  }, [initialProducts, activePlatformId]);

  return (
    <section className="space-y-6">
      {/* SECTION HEADER: INDIAN SHOPPING */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 text-xs font-black tracking-wider uppercase">
            🇮🇳 INDIAN SHOPPING
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
            Shop By Indian Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#a3aed0] max-w-2xl">
            Select a store to view verified, authentic products sourced directly from India's leading e-commerce platforms.
          </p>
        </div>

        <Link
          to={`/shop/${activeMeta.slug}`}
          className="self-start sm:self-end inline-flex items-center gap-2 rounded-full bg-neutral-950 dark:bg-amber-400 px-5 py-2.5 text-xs font-bold text-white dark:text-neutral-950 hover:bg-red-600 dark:hover:bg-amber-300 transition-all shadow-2xs"
        >
          <span>Shop {activeMeta.name} →</span>
        </Link>
      </div>

      {/* OFFICIAL MARKETPLACE BRAND CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {MARKETPLACE_METAS.slice(0, 10).map((meta) => {
          const isActive = meta.id === activePlatformId;
          return (
            <button
              key={meta.id}
              type="button"
              onClick={() => setActivePlatformId(meta.id)}
              className={`flex flex-col items-center justify-between p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-200 text-center ${
                isActive
                  ? "bg-white dark:bg-[#111c44] border-neutral-950 dark:border-amber-400 shadow-md ring-2 ring-neutral-950 dark:ring-amber-400 scale-[1.02]"
                  : "bg-white dark:bg-[#111c44]/80 border-neutral-200/90 dark:border-[#1b2559] hover:bg-neutral-50 dark:hover:bg-[#1b254b] hover:shadow-2xs"
              }`}
            >
              <div className="h-8 sm:h-9 w-full flex items-center justify-center">
                <MarketplaceLogo marketplace={meta.id} className="h-5 sm:h-6 w-auto max-w-[85px] sm:max-w-[90px]" />
              </div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white mt-2 line-clamp-1">
                {meta.name}
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-[#a3aed0] font-semibold mt-0.5">
                Shop {meta.shortName}
              </span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE PLATFORM HIGHLIGHT BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 dark:from-[#0b1437] dark:via-[#111c44] dark:to-[#0b1437] p-5 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-neutral-800 dark:border-[#1b2559]">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-3 py-1.5 shadow-xs">
              <MarketplaceLogo marketplace={activeMeta.id} className="h-6 w-auto" />
            </div>
            <span className="text-xs font-black tracking-widest uppercase text-amber-400">
              Official Sourcing Channel
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">{activeMeta.name}</h3>
          <p className="text-xs text-neutral-300 dark:text-[#a3aed0] max-w-xl font-medium">{activeMeta.tagline}</p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link
            to={`/order?source=${activeMeta.slug}`}
            className="rounded-2xl bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-xs font-black transition active:scale-95 shadow-md"
          >
            Paste {activeMeta.shortName} Link ➔
          </Link>
          <Link
            to={`/shop/${activeMeta.slug}`}
            className="rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 text-xs font-bold transition"
          >
            Open {activeMeta.shortName} Store
          </Link>
        </div>
      </div>

      {/* EXCLUSIVE PLATFORM PRODUCTS GRID */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {platformProducts.map((product) => (
          <ProductCard
            key={product._id || product.id || product.slug}
            product={product}
            onQuickView={onQuickView}
          />
        ))}
      </div>

      <div className="border-b border-neutral-200 dark:border-[#1b2559] pt-4" />
    </section>
  );
}

export default MarketplacePlatformSection;
