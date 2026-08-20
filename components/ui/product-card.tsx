"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { discountPercent, formatNpr } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { useToast } from "@/components/providers/toast-provider";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();
  const { pushToast } = useToast();

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-card transition hover:-translate-y-1">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded-xl">
        <Image src={`${product.image}?auto=format&fit=crop&w=900&q=80`} alt={product.name} width={700} height={700} className="h-48 w-full object-cover sm:h-56" />
      </Link>
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-neutral-500">{product.category}</span>
          {product.badge ? <span className="rounded-full bg-black px-2 py-1 text-[10px] font-semibold text-white">{product.badge}</span> : null}
        </div>
        <Link href={`/product/${product.slug}`} className="line-clamp-2 font-medium">
          {product.name}
        </Link>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <p className="font-semibold">{formatNpr(product.price)}</p>
          <p className="text-neutral-500 line-through">{formatNpr(product.originalPrice)}</p>
          <p className="text-veyra-gold">{discountPercent(product.price, product.originalPrice)}% OFF</p>
        </div>
        <p className="mt-1 text-xs text-neutral-500">⭐ {product.rating} ({product.reviews} reviews)</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            addToCart(product, 1);
            pushToast(`${product.name} added to cart`, "success");
          }}
          className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white"
        >
          Add to Cart
        </button>
        <button
          onClick={() => {
            toggle(product.id);
            pushToast(has(product.id) ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`, "info");
          }}
          className={`rounded-xl border px-3 py-2 text-sm font-medium ${has(product.id) ? "border-veyra-gold text-veyra-gold" : "border-neutral-300"}`}
        >
          {has(product.id) ? "Wishlisted" : "Wishlist"}
        </button>
      </div>
      <Link href={`/product/${product.slug}?quick=1`} className="mt-2 block rounded-xl border border-neutral-300 px-3 py-2 text-center text-sm">
        Quick View
      </Link>
      <Link href={`/product/${product.slug}`} className="mt-2 block rounded-xl border border-neutral-300 px-3 py-2 text-center text-sm">
        View Details
      </Link>
    </article>
  );
}
