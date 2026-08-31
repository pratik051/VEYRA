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

  const badgeStyle = (badge: string) => {
    switch (badge) {
      case "TRENDING": return "bg-veyra-gold text-black";
      case "NEW":       return "bg-emerald-500 text-black";
      case "SALE":      return "bg-red-500/90 text-white";
      case "BEST SELLER": return "bg-black/5 text-veyra-text-dark border border-black/10";
      default:          return "bg-black/5 text-veyra-text-dark";
    }
  };

  return (
    <>
      <article className="group relative flex flex-col justify-between rounded-2xl border border-black/[0.04] bg-white p-2.5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover hover:border-veyra-gold/20">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-xl bg-veyra-surface-2">
          <Link href={`/product/${product.slug}`} className="block">
            <Image
              src={`${product.image}?auto=format&fit=crop&w=800&q=80`}
              alt={product.name}
              width={600}
              height={600}
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-56"
            />
          </Link>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
            {product.badge && (
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${badgeStyle(product.badge)}`}>
                {product.badge}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => {
              toggle(product.id);
              pushToast(
                isWishlisted ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`,
                isWishlisted ? "info" : "success"
              );
            }}
            aria-label="Toggle Wishlist"
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-white/70 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-veyra-gold/40 hover:bg-white text-sm shadow-sm"
          >
            {isWishlisted ? "❤️" : "🤍"}
          </button>

          {/* Quick View Hover Button */}
          <button
            onClick={() => setQuickViewOpen(true)}
            className="absolute bottom-2.5 left-2.5 right-2.5 hidden rounded-xl border border-black/5 bg-white/90 py-2 text-center text-[11px] font-semibold text-veyra-text-dark backdrop-blur-md transition-all duration-200 hover:bg-veyra-gold hover:text-black hover:border-veyra-gold sm:block opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 shadow-sm"
          >
            ⚡ Quick View
          </button>
        </div>

        {/* Product Meta */}
        <div className="mt-3 flex flex-1 flex-col justify-between px-0.5">
          <div>
            <div className="flex items-center justify-between text-[10px] text-veyra-muted">
              <span className="font-bold uppercase tracking-wider">{product.category}</span>
              <span className="text-veyra-gold font-semibold">⭐ {product.rating}</span>
            </div>

            <Link href={`/product/${product.slug}`} className="mt-1 block">
              <h3 className="line-clamp-2 text-sm font-semibold text-veyra-text-dark transition-colors duration-200 group-hover:text-veyra-gold-dark">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="mt-3">
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-veyra-gold-dark">{formatNpr(product.price)}</span>
              <span className="text-xs text-veyra-muted/60 line-through">{formatNpr(product.originalPrice)}</span>
              <span className="text-[10px] font-bold text-emerald-400">{discount}% off</span>
            </div>

            {/* Actions */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  addToCart(product, 1);
                  pushToast(`${product.name} added to cart!`, "success");
                }}
                disabled={product.stock <= 0}
                className="w-full rounded-xl bg-veyra-gold py-2.5 text-xs font-bold text-black transition-all duration-200 hover:bg-veyra-gold-light hover:shadow-gold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                onClick={() => setQuickViewOpen(true)}
                className="w-full rounded-xl border border-black/10 py-2.5 text-xs font-semibold text-veyra-text transition-all duration-200 hover:border-veyra-gold/40 hover:text-veyra-gold-dark sm:hidden"
              >
                Quick View
              </button>

              <Link
                href={`/product/${product.slug}`}
                className="hidden w-full items-center justify-center rounded-xl border border-black/10 py-2.5 text-xs font-semibold text-veyra-text transition-all duration-200 hover:border-veyra-gold/40 hover:text-veyra-gold-dark sm:flex hover:bg-black/[0.02]"
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
