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

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();
  const { pushToast } = useToast();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const isWishlisted = has(product.id);
  const discount = discountPercent(product.price, product.originalPrice);

  return (
    <>
      <article className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-3 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-neutral-300">
        {/* Product Image & Badges */}
        <div className="relative overflow-hidden rounded-xl bg-neutral-100">
          <Link href={`/product/${product.slug}`} className="block">
            <Image
              src={`${product.image}?auto=format&fit=crop&w=800&q=80`}
              alt={product.name}
              width={600}
              height={600}
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-56"
            />
          </Link>

          {/* Badges */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
            {product.badge && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                  product.badge === "TRENDING"
                    ? "bg-veyra-gold text-black shadow-sm"
                    : product.badge === "NEW"
                    ? "bg-black text-white"
                    : product.badge === "SALE"
                    ? "bg-red-600 text-white"
                    : product.badge === "BEST SELLER"
                    ? "bg-black text-white"
                    : "bg-neutral-800 text-white"
                }`}
              >
                {product.badge}
              </span>
            )}
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={() => {
              toggle(product.id);
              pushToast(
                isWishlisted ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`,
                isWishlisted ? "info" : "success"
              );
            }}
            aria-label="Toggle Wishlist"
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition hover:scale-110 hover:bg-white text-sm"
          >
            {isWishlisted ? "❤️" : "🤍"}
          </button>

          {/* Quick View Hover Button */}
          <button
            onClick={() => setQuickViewOpen(true)}
            className="absolute bottom-2.5 left-2.5 right-2.5 hidden rounded-xl bg-white/95 py-2 text-center text-xs font-semibold text-neutral-900 shadow-md backdrop-blur-sm transition hover:bg-black hover:text-white sm:block opacity-0 group-hover:opacity-100"
          >
            ⚡ Quick View
          </button>
        </div>

        {/* Product Meta */}
        <div className="mt-3 flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold uppercase tracking-wider">{product.category}</span>
              <span>⭐ {product.rating}</span>
            </div>

            <Link href={`/product/${product.slug}`} className="mt-1 block">
              <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900 transition group-hover:text-veyra-gold">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="mt-3">
            {/* Price section */}
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-neutral-900">{formatNpr(product.price)}</span>
              <span className="text-xs text-neutral-400 line-through">{formatNpr(product.originalPrice)}</span>
              <span className="text-[11px] font-bold text-amber-700">{discount}% OFF</span>
            </div>

            {/* Actions Grid */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  addToCart(product, 1);
                  pushToast(`${product.name} added to cart!`, "success");
                }}
                disabled={product.stock <= 0}
                className="w-full rounded-xl bg-black py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
              >
                {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                onClick={() => setQuickViewOpen(true)}
                className="w-full rounded-xl border border-neutral-300 py-2.5 text-xs font-semibold text-neutral-700 transition hover:border-black hover:text-black sm:hidden"
              >
                Quick View
              </button>

              <Link
                href={`/product/${product.slug}`}
                className="hidden w-full items-center justify-center rounded-xl border border-neutral-300 py-2.5 text-xs font-semibold text-neutral-700 transition hover:border-black hover:text-black sm:flex"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Quick View Modal */}
      <QuickViewModal product={quickViewOpen ? product : null} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}
