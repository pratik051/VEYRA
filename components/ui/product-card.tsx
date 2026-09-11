"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { discountPercent, formatNpr } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { useToast } from "@/components/providers/toast-provider";
import { QuickViewModal } from "@/components/ui/quick-view-modal";

export type AnyProduct = {
  id?: string;
  slug: string;
  name?: string;
  title?: string;
  category: string;
  subcategory?: string;
  brand: string;
  price?: number;
  originalPrice?: number;
  priceINR?: number;
  originalPriceINR?: number;
  finalAmountNPR?: number;
  rating?: number;
  reviews?: number;
  reviewCount?: number;
  stock?: number;
  badge?: string;
  badges?: string[];
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
  isFlashSale?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  trendingScore?: number;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  variants?: { name: string; values: string[] }[];
  description?: string;
  specs?: Record<string, string>;
  image?: string;
  images?: string[];
  gallery?: string[];
  source?: string;
  sourceProductId?: string;
  sourceUrl?: string;
  originalSourceUrl?: string;
  verifiedSourceUrl?: string;
  canonicalSourceUrl?: string;
  verificationStatus?: "pending" | "verified" | "failed";
  availability?: string;
  lastSyncedAt?: Date;
};


function HeartIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  const fullStars = Math.floor(rating || 4.5);
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="flex text-amber-400 text-xs">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < fullStars ? "text-amber-400" : "text-neutral-200"}>
            ★
          </span>
        ))}
      </div>
      <span className="text-[11px] font-bold text-neutral-500">({reviews || 0})</span>
    </div>
  );
}

import { MarketplaceLogo } from "@/components/ui/marketplace-logos";

function getMarketplaceBadge(source?: string) {
  if (!source) return null;
  const s = source.toLowerCase();
  switch (s) {
    case "amazon-india":
    case "amazon":
      return { id: "amazon", name: "Amazon", color: "bg-amber-50 text-neutral-950 border border-amber-300" };
    case "flipkart":
      return { id: "flipkart", name: "Flipkart", color: "bg-blue-50 text-blue-900 border border-blue-300" };
    case "myntra":
      return { id: "myntra", name: "Myntra", color: "bg-rose-50 text-rose-950 border border-rose-300" };
    case "ajio":
      return { id: "ajio", name: "AJIO", color: "bg-neutral-900 text-amber-400 border border-neutral-800" };
    case "meesho":
      return { id: "meesho", name: "Meesho", color: "bg-pink-50 text-pink-950 border border-pink-300" };
    case "nykaa":
      return { id: "nykaa", name: "Nykaa", color: "bg-fuchsia-50 text-fuchsia-950 border border-fuchsia-300" };
    case "tatacliq":
      return { id: "tatacliq", name: "Tata CLiQ", color: "bg-red-50 text-red-950 border border-red-300" };
    case "croma":
      return { id: "croma", name: "Croma", color: "bg-teal-50 text-teal-950 border border-teal-300" };
    case "boat":
      return { id: "boat", name: "boAt", color: "bg-red-50 text-red-950 border border-red-300" };
    case "noise":
      return { id: "noise", name: "Noise", color: "bg-indigo-50 text-indigo-950 border border-indigo-300" };
    default:
      return { id: source, name: "India Import", color: "bg-neutral-900 text-white" };
  }
}

export function ProductCard({ product }: { product: AnyProduct }) {
  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();
  const { pushToast } = useToast();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const isWishlisted = has(product.id || product.slug);
  const currentPrice = product.finalAmountNPR || product.price || 0;
  const origPrice = product.originalPrice || currentPrice;
  const discount = discountPercent(currentPrice, origPrice);
  const mktBadge = getMarketplaceBadge(product.source);

  // Link to either product detail page or pre-populated order wizard
  const isImported = Boolean(product.sourceUrl || product.source);
  const orderNowUrl = isImported
    ? `/request-product?url=${encodeURIComponent(product.sourceUrl || "")}&inr=${product.priceINR || ""}&name=${encodeURIComponent(product.name || product.title || "")}`
    : `/product/${product.slug}`;

  const primaryBadge = product.badges?.[0] || product.badge || (discount > 0 ? `-${discount}%` : null);

  return (
    <>
      <article className="group relative flex flex-col justify-between rounded-2xl bg-white border border-neutral-100 p-2 sm:p-2.5 transition-all duration-300 hover:shadow-md hover:border-neutral-200">
        {/* Top Image Container */}
        <div className="relative overflow-hidden rounded-xl bg-neutral-50 flex items-center justify-center p-3 h-52 sm:h-60">
          <Link href={`/product/${product.slug}`} className="relative h-full w-full block">
            <Image
              src={`${product.image || product.images?.[0]}?auto=format&fit=crop&w=600&q=80`}
              alt={product.name || product.title || "Product"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Left Badges Stack */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 items-start z-10">
            {mktBadge && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] uppercase font-black tracking-wider shadow-xs backdrop-blur-md ${mktBadge.color}`}>
                <MarketplaceLogo marketplace={mktBadge.id} className="h-2.5 w-auto max-w-[36px]" />
                <span>{mktBadge.name}</span>
              </span>
            )}
            {primaryBadge && (
              <span className="rounded-full bg-neutral-950 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-xs">
                {primaryBadge}
              </span>
            )}
          </div>

          {/* Floating Actions (Wishlist & Quick View) */}
          <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5 z-10">
            <button
              onClick={() => {
                toggle(product.id || product.slug);
                pushToast(
                  isWishlisted ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`,
                  isWishlisted ? "info" : "success"
                );
              }}
              aria-label="Wishlist"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-neutral-700 shadow-sm hover:bg-white hover:text-red-500 transition hover:scale-110"
            >
              <HeartIcon filled={isWishlisted} />
            </button>

            <button
              onClick={() => setQuickViewOpen(true)}
              aria-label="Quick View"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-neutral-700 shadow-sm hover:bg-white hover:text-neutral-950 transition hover:scale-110"
            >
              <EyeIcon />
            </button>
          </div>

          {/* Slide-Up Action Bar */}
          <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 transition-all duration-300 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
            <Link
              href={orderNowUrl}
              className="flex-1 rounded-xl bg-red-600 py-2 text-center text-[11px] font-black text-white hover:bg-red-700 shadow-md transition"
            >
              ⚡ Order Now
            </Link>
            <Link
              href={`/product/${product.slug}`}
              className="rounded-xl bg-neutral-950 px-3 py-2 text-center text-[11px] font-bold text-white hover:bg-neutral-800 shadow-md transition"
            >
              View
            </Link>
          </div>
        </div>

        {/* Product Meta */}
        <div className="mt-2.5 space-y-1 px-1 pb-1">
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
            <span>{product.category}</span>
            <span>{product.brand}</span>
          </div>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-1 group-hover:text-red-600 transition-colors">
              {product.name || product.title}
            </h3>
          </Link>

          {/* Indian Price & Final NPR Price Display */}
          <div className="pt-0.5 space-y-0.5">
            {product.priceINR ? (
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-[11px] text-neutral-500 font-semibold">
                  INR: <strong className="text-neutral-700 font-bold">₹{product.priceINR.toLocaleString()}</strong>
                </span>
                {product.originalPriceINR && product.originalPriceINR > product.priceINR && (
                  <span className="text-[10px] text-neutral-400 line-through">
                    ₹{product.originalPriceINR.toLocaleString()}
                  </span>
                )}
              </div>
            ) : null}

            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-neutral-500">LINKOVA Price:</span>
                <span className="text-sm sm:text-base font-black text-red-600">
                  {formatNpr(product.finalAmountNPR || product.price || 0)}
                </span>
              </div>
              {product.originalPrice && product.originalPrice > (product.price || product.finalAmountNPR || 0) && !product.priceINR && (
                <span className="text-[11px] text-neutral-400 line-through">
                  {formatNpr(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Ratings */}
          <div className="pt-1">
            <StarRating rating={product.rating || 4.5} reviews={product.reviews || product.reviewCount || 0} />
          </div>
        </div>
      </article>

      {/* Quick View Modal */}
      <QuickViewModal product={quickViewOpen ? (product as Product) : null} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}
