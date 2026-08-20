"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/ui/product-card";
import { formatNpr } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState(product?.gallery[0] ?? "");
  const [color, setColor] = useState(product?.colors[0] ?? "");
  const [size, setSize] = useState(product?.sizes?.[0] ?? "");
  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();

  const recommended = useMemo(
    () => (product ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
    [product]
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Link href="/shop" className="mt-4 inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">
          Back to Shop
        </Link>
      </div>
    );
  }
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery,
    description: product.description,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <p className="text-sm text-neutral-500"><Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / {product.name}</p>
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          <Image src={`${image}?auto=format&fit=crop&w=1400&q=80`} alt={product.name} width={1000} height={900} className="h-[380px] w-full rounded-2xl object-cover sm:h-[500px]" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {product.gallery.map((g) => (
              <button key={g} onClick={() => setImage(g)} className="overflow-hidden rounded-xl border border-neutral-200">
                <Image src={`${g}?auto=format&fit=crop&w=500&q=70`} alt={product.name} width={260} height={220} className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-sm text-neutral-600">⭐ {product.rating} ({product.reviews} reviews)</p>
          <div className="mt-4 flex items-center gap-3">
            <p className="text-2xl font-semibold">{formatNpr(product.price)}</p>
            <p className="text-neutral-500 line-through">{formatNpr(product.originalPrice)}</p>
            <span className="rounded-full bg-black px-2 py-1 text-xs text-white">{product.stock > 0 ? "In Stock" : "Out of Stock"}</span>
          </div>
          <p className="mt-4 text-sm text-neutral-700">{product.description}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Color
              <select value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2">
                {product.colors.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            {product.sizes ? <label className="text-sm">Size
              <select value={size} onChange={(e) => setSize(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2">
                {product.sizes.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label> : null}
            <label className="text-sm">Quantity
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2" />
            </label>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button onClick={() => addToCart(product, quantity)} className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white">Add to Cart</button>
            <button onClick={() => addToCart(product, quantity)} className="rounded-xl border border-black px-4 py-3 text-sm font-semibold">Buy Now</button>
            <button onClick={() => toggle(product.id)} className="rounded-xl border border-neutral-300 px-4 py-3 text-sm">{has(product.id) ? "Wishlisted" : "Wishlist"}</button>
          </div>
          <div className="mt-6 rounded-2xl border border-neutral-200 p-4 text-sm text-neutral-700">
            <p><strong>Delivery:</strong> Estimated within Nepal based on location and sourcing.</p>
            <p className="mt-2"><strong>Return:</strong> Return/replace terms vary by product and supplier.</p>
            <p className="mt-2"><strong>Source:</strong> Available through VEYRA inventory and/or external sourcing workflow.</p>
          </div>
          <div className="mt-6 rounded-2xl border border-neutral-200 p-4">
            <h3 className="font-medium">Specifications</h3>
            <ul className="mt-2 space-y-1 text-sm text-neutral-700">
              {Object.entries(product.specs).map(([k, v]) => <li key={k}><strong>{k}:</strong> {v}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Recommended Products</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">{recommended.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      </section>
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-neutral-200 p-5">
          <h2 className="text-xl font-semibold">Reviews & Ratings</h2>
          <p className="mt-2 text-sm text-neutral-600">Verified Purchase reviews are moderated before publication.</p>
          <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm">
            <p className="font-medium">⭐⭐⭐⭐⭐ Great quality and fast response from VEYRA</p>
            <p className="mt-1 text-neutral-600">Verified Purchase • Bishal K.</p>
          </div>
          <form className="mt-4 grid gap-2">
            <input placeholder="Review title" className="rounded-lg border border-neutral-300 px-3 py-2" />
            <textarea placeholder="Write your review" className="min-h-24 rounded-lg border border-neutral-300 px-3 py-2" />
            <input type="file" className="rounded-lg border border-neutral-300 px-3 py-2" />
            <button className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">Submit Review</button>
          </form>
        </article>
        <article className="rounded-2xl border border-neutral-200 p-5">
          <h2 className="text-xl font-semibold">Recently Viewed</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {products.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="rounded-xl border border-neutral-200 p-3 text-sm hover:border-neutral-400">
                {p.name}
              </Link>
            ))}
          </div>
        </article>
      </section>
      <div className="fixed bottom-14 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 p-3 backdrop-blur md:hidden">
        <button onClick={() => addToCart(product, 1)} className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white">
          Add to Cart • {formatNpr(product.price)}
        </button>
      </div>
    </div>
  );
}
