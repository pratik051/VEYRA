"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sampleReviews } from "@/lib/data";
import { ProductCard, AnyProduct } from "@/components/ui/product-card";
import { discountPercent, formatNpr } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Review } from "@/lib/types";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<AnyProduct | null>(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();
  const { pushToast } = useToast();

  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "delivery" | "returns" | "sourcing">("specs");

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>(sampleReviews);
  const [reviewName, setReviewName] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState<AnyProduct[]>([]);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      // Only load from marketplace API — no personal catalog fallback
      try {
        const res = await fetch(`/api/marketplace/products/${params.slug}`);
        const data = await res.json();
        if (data.success && data.product) {
          const mkt = data.product;
          setProduct(mkt);
          setActiveImage(mkt.images?.[0] || mkt.image || "");
          setSelectedColor(mkt.variants?.find((v: any) => v.name === "Color")?.values?.[0] || "");
          setSelectedSize(mkt.variants?.find((v: any) => v.name === "Size")?.values?.[0] || "");
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error loading marketplace product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.slug]);

  useEffect(() => {
    if (product) {
      try {
        const saved = JSON.parse(localStorage.getItem("linkova_recent_views") || "[]") as string[];
        const updated = [product.slug, ...saved.filter((s) => s !== product.slug)].slice(0, 6);
        localStorage.setItem("linkova_recent_views", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  }, [product]);

  // Recommended: load similar marketplace products dynamically (not from static catalog)
  const [recommended, setRecommended] = useState<AnyProduct[]>([]);
  useEffect(() => {
    if (!product?.category) return;
    fetch(`/api/marketplace/products?category=${encodeURIComponent(product.category)}&limit=4`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.products) {
          setRecommended(data.products.filter((p: AnyProduct) => p.slug !== product.slug).slice(0, 4));
        }
      })
      .catch(() => {});
  }, [product?.category, product?.slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="inline-flex items-center gap-3 text-neutral-600 font-bold">
          <span className="h-3 w-3 rounded-full bg-red-600 animate-ping" />
          Loading Product Details from LINKOVA...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h1 className="text-2xl font-bold text-neutral-900">Product Not Found</h1>
        <p className="mt-2 text-sm text-neutral-500">The product you are looking for does not exist or has been updated.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/shop" className="rounded-xl bg-black px-5 py-3 text-xs font-semibold text-white">
            Browse All Products
          </Link>
          <Link href="/request-product" className="rounded-xl border border-black px-5 py-3 text-xs font-semibold">
            Paste Indian Product URL
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = has(product.id || product.slug);
  const curPrice = product.finalAmountNPR || product.price || 0;
  const origPrice = product.originalPrice || curPrice;
  const discount = discountPercent(curPrice, origPrice);
  const isImported = Boolean(product.source || product.sourceUrl);

  const orderNowUrl = isImported
    ? `/request-product?url=${encodeURIComponent(product.sourceUrl || "")}&inr=${product.priceINR || ""}&name=${encodeURIComponent(product.name || product.title || "")}&sid=${encodeURIComponent(product.sourceProductId || "")}`
    : `/checkout`;

  const handleOrderFromIndia = () => {
    router.push(orderNowUrl);
  };

  const handleAddToCart = () => {
    addToCart(product as any, quantity);
    pushToast(`Added ${quantity}x ${product.name || product.title} to your cart!`, "success");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      pushToast("Product link copied to clipboard!", "info");
    }
  };

  const galleryImages = (product.gallery && product.gallery.length > 0)
    ? product.gallery
    : ((product.images && product.images.length > 0) ? product.images : [product.image || ""]);


  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-black">
          {product.category}
        </Link>
        <span>/</span>
        <span className="truncate text-neutral-800 font-medium">{product.name || product.title}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4 lg:col-span-6">
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-sm flex items-center justify-center p-6">
            <Image
              src={`${activeImage || product.image || galleryImages[0]}?auto=format&fit=crop&w=1200&q=85`}
              alt={product.name || product.title || "Product"}
              width={1000}
              height={1000}
              priority
              className="h-[380px] w-full object-contain sm:h-[480px] transition-transform duration-500 hover:scale-105"
            />
            {isImported && (
              <span className="absolute top-4 left-4 rounded-full bg-amber-500 text-neutral-950 px-3 py-1 text-xs font-black uppercase shadow-sm">
                🇮🇳 {product.source || "India Sourced"}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((g: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(g)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition p-1 bg-white ${
                    activeImage === g ? "border-black shadow-sm" : "border-neutral-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={`${g}?auto=format&fit=crop&w=200&q=75`}
                    alt={`Preview ${idx + 1}`}
                    width={100}
                    height={100}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Order Form */}
        <div className="flex flex-col justify-between lg:col-span-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">{product.category}</span>
                <span className="text-xs text-neutral-500 font-medium">Brand: <strong>{product.brand}</strong></span>
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-neutral-900 sm:text-3xl lg:text-4xl">
                {product.name || product.title}
              </h1>

              {/* Rating & Share */}
              <div className="mt-3 flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex text-amber-500 font-semibold">
                    {"★".repeat(Math.round(product.rating || 4.5))}
                    {"☆".repeat(5 - Math.round(product.rating || 4.5))}
                  </div>
                  <span className="font-bold text-neutral-800">{product.rating || 4.5}</span>
                  <span className="text-neutral-400">({product.reviews || product.reviewCount || 0} verified reviews)</span>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black transition"
                >
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5 space-y-2">
              {product.priceINR ? (
                <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Indian Marketplace Price</span>
                  <span className="text-base font-bold text-neutral-900">₹{product.priceINR.toLocaleString()} INR</span>
                </div>
              ) : null}

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="block text-[11px] font-black uppercase tracking-wider text-neutral-500">
                    Final Landed Nepal Price (LINKOVA)
                  </span>
                  <div className="flex items-baseline gap-3 mt-0.5">
                    <span className="text-3xl font-black text-red-600">
                      {formatNpr(product.finalAmountNPR || product.price || 0)}
                    </span>
                    {product.originalPrice && product.originalPrice > (product.price || product.finalAmountNPR || 0) && (
                      <span className="text-sm text-neutral-400 line-through">{formatNpr(product.originalPrice)}</span>
                    )}
                  </div>
                </div>

                {discount > 0 && (
                  <span className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-black text-red-700">
                    Save {discount}%
                  </span>
                )}
              </div>

              <p className="text-[11px] text-neutral-500 pt-1">
                ✓ Inclusive of cross-border courier, handling, customs clearance &amp; doorstep delivery in Nepal.
              </p>
            </div>

            <p className="text-sm leading-relaxed text-neutral-700">{product.description}</p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Color: <span className="text-neutral-900 font-semibold">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c: string) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        selectedColor === c
                          ? "bg-black text-white shadow-sm"
                          : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Size: <span className="text-neutral-900 font-semibold">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        selectedSize === s
                          ? "bg-black text-white shadow-sm"
                          : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={handleOrderFromIndia}
                  className="rounded-2xl bg-red-600 py-4 text-sm font-black text-white shadow-md hover:bg-red-700 transition"
                >
                  ⚡ Order Now (COD / Online)
                </button>
                <button
                  onClick={handleAddToCart}
                  className="rounded-2xl border-2 border-black bg-white py-4 text-sm font-bold text-black hover:bg-black hover:text-white transition"
                >
                  Add to Cart
                </button>
              </div>

              {(product.verifiedSourceUrl || product.canonicalSourceUrl || product.sourceUrl) && (
                <div className="text-center pt-1">
                  <a
                    href={product.verifiedSourceUrl || product.canonicalSourceUrl || product.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400 transition"
                  >
                    <span>🇮🇳</span>
                    <span>Open Verified Product on {product.source ? product.source.replace("amazon-india", "Amazon India").replace("tatacliq", "Tata CLiQ").replace("boat", "boAt").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Indian Marketplace"}</span>
                    <span>↗</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Specifications & Delivery Info Tabs */}
          <div className="mt-8 rounded-3xl border border-neutral-200 p-6 bg-neutral-50/40">
            <div className="flex border-b border-neutral-200 pb-3 gap-4 text-xs font-bold">
              {[
                { id: "specs", label: "Specifications" },
                { id: "delivery", label: "Nepal Delivery" },
                { id: "sourcing", label: "Sourcing Guarantee" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`pb-1 border-b-2 transition ${
                    activeTab === t.id ? "border-black text-neutral-900" : "border-transparent text-neutral-400 hover:text-black"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-4 text-xs leading-relaxed text-neutral-700">
              {activeTab === "specs" && (
                <div className="space-y-2">
                  {product.specs && Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-neutral-100 py-1.5">
                      <span className="font-semibold text-neutral-500">{k}</span>
                      <span className="text-neutral-900 font-medium text-right">{v}</span>
                    </div>
                  ))}
                  {(!product.specs || Object.keys(product.specs).length === 0) && (
                    <p className="text-neutral-500">Standard brand specifications verified by LINKOVA.</p>
                  )}
                </div>
              )}

              {activeTab === "delivery" && (
                <div className="space-y-2 text-neutral-600">
                  <p>• <strong>Delivery Time:</strong> 5-8 business days for Indian cross-border verified fulfillment.</p>
                  <p>• <strong>Payment Choices:</strong> Cash on Delivery (COD) or Instant Online Payment.</p>
                  <p>• <strong>Real-time Tracking:</strong> SMS / WhatsApp updates throughout the customs and courier stages.</p>
                </div>
              )}

              {activeTab === "sourcing" && (
                <div className="space-y-2 text-neutral-600">
                  <p>• 100% Genuine product procured from authorized brand distributors across India.</p>
                  <p>• Verified seal check and inspection before dispatch from Nepal transit center.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      {recommended.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Discover More</span>
              <h2 className="text-2xl font-extrabold text-neutral-900 mt-1">Recommended for You</h2>
            </div>
            <Link href="/shop" className="text-xs font-bold text-neutral-900 hover:text-red-600">
              View All in Shop →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recommended.map((p) => (
              <ProductCard key={p.id || p.slug} product={p as AnyProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
