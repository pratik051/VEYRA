"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { products, sampleReviews } from "@/lib/data";
import { ProductCard } from "@/components/ui/product-card";
import { discountPercent, formatNpr } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Review } from "@/lib/types";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const product = products.find((p) => p.slug === params.slug);

  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();
  const { pushToast } = useToast();

  const [activeImage, setActiveImage] = useState(product?.gallery[0] || product?.image || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || "");
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "delivery" | "returns" | "sourcing">("specs");

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>(sampleReviews);
  const [reviewName, setReviewName] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Track recently viewed in localStorage
  const [recentlyViewed, setRecentlyViewed] = useState<typeof products>([]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.gallery[0] || product.image);
      setSelectedColor(product.colors[0] || "");
      setSelectedSize(product.sizes?.[0] || "");
      setQuantity(1);

      try {
        const saved = JSON.parse(localStorage.getItem("veyra_recent_views") || "[]") as string[];
        const updated = [product.id, ...saved.filter((id) => id !== product.id)].slice(0, 5);
        localStorage.setItem("veyra_recent_views", JSON.stringify(updated));

        const recentProducts = products.filter((p) => updated.includes(p.id) && p.id !== product.id);
        setRecentlyViewed(recentProducts);
      } catch (e) {
        console.error(e);
      }
    }
  }, [product]);

  const recommended = useMemo(() => {
    if (!product) return [];
    const sameCat = products.filter((p) => p.category === product.category && p.id !== product.id);
    if (sameCat.length >= 4) return sameCat.slice(0, 4);
    const others = products.filter((p) => p.id !== product.id && !sameCat.includes(p));
    return [...sameCat, ...others].slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <h1 className="text-2xl font-bold text-neutral-900">Product Not Found</h1>
        <p className="mt-2 text-sm text-neutral-500">The product you are looking for does not exist or has been moved.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/shop" className="rounded-xl bg-black px-5 py-3 text-xs font-semibold text-white">
            Browse All Products
          </Link>
          <Link href="/request-product" className="rounded-xl border border-black px-5 py-3 text-xs font-semibold">
            Request from India Marketplaces
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = has(product.id);
  const discount = discountPercent(product.price, product.originalPrice);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    pushToast(`Added ${quantity}x ${product.name} to your cart!`, "success");
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      pushToast("Product link copied to clipboard!", "info");
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewTitle || !reviewContent) {
      pushToast("Please complete all review fields.", "error");
      return;
    }
    const newRev: Review = {
      id: `REV-${Date.now()}`,
      productId: product.id,
      author: `${reviewName} (Verified Customer)`,
      rating: reviewRating,
      date: "Just now",
      title: reviewTitle,
      content: reviewContent,
      verified: true
    };
    setReviewsList([newRev, ...reviewsList]);
    setReviewSubmitted(true);
    pushToast("Review submitted successfully! Thank you.", "success");
    setReviewName("");
    setReviewTitle("");
    setReviewContent("");
  };

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "VEYRA"
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black">
          Shop
        </Link>
        <span>/</span>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-black">
          {product.category}
        </Link>
        <span>/</span>
        <span className="truncate text-neutral-800 font-medium">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        {/* Left Column: Interactive Image Gallery */}
        <div className="space-y-4 lg:col-span-6">
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-sm">
            <Image
              src={`${activeImage || product.image}?auto=format&fit=crop&w=1200&q=85`}
              alt={product.name}
              width={1000}
              height={1000}
              priority
              className="h-[380px] w-full object-cover sm:h-[500px] transition-transform duration-500"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 rounded-full bg-black px-3 py-1 text-xs font-bold uppercase text-white shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {product.gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.gallery.map((g, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(g)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    activeImage === g ? "border-black shadow-sm" : "border-neutral-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={`${g}?auto=format&fit=crop&w=200&q=75`}
                    alt={`${product.name} preview ${idx + 1}`}
                    width={100}
                    height={100}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details & Controls */}
        <div className="flex flex-col justify-between lg:col-span-6">
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">{product.category}</span>
                <span className="text-xs text-neutral-500 font-medium">Brand: <strong>{product.brand}</strong></span>
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-neutral-900 sm:text-3xl lg:text-4xl">{product.name}</h1>

              {/* Rating & Share */}
              <div className="mt-3 flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex text-amber-500 font-semibold">
                    {"★".repeat(Math.round(product.rating))}
                    {"☆".repeat(5 - Math.round(product.rating))}
                  </div>
                  <span className="font-bold text-neutral-800">{product.rating}</span>
                  <span className="text-neutral-400">({product.reviews} verified reviews)</span>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black transition"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-neutral-900">{formatNpr(product.price)}</span>
                <span className="text-base text-neutral-400 line-through">{formatNpr(product.originalPrice)}</span>
                <span className="rounded-lg bg-amber-100/70 px-2.5 py-1 text-xs font-bold text-amber-800">
                  Save {discount}%
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Inclusive of all taxes. Free delivery on orders over Rs. 3,000.
              </p>
            </div>

            <p className="text-sm leading-relaxed text-neutral-700">{product.description}</p>

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Color: <span className="text-neutral-900 font-semibold">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
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

            {/* Size selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Size: <span className="text-neutral-900 font-semibold">{selectedSize}</span>
                  </p>
                  <span className="text-xs text-neutral-400">Standard Nepal / EU Sizing</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
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

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Quantity:</span>
              <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-neutral-600 hover:bg-white transition"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-neutral-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-neutral-600 hover:bg-white transition"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-neutral-400">
                {product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of Stock"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="rounded-2xl bg-black py-4 text-sm font-bold text-white shadow-md hover:bg-neutral-800 disabled:opacity-50 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="rounded-2xl border-2 border-black bg-white py-4 text-sm font-bold text-black hover:bg-black hover:text-white disabled:opacity-50 transition"
                >
                  Buy Now
                </button>
              </div>

              <button
                onClick={() => {
                  toggle(product.id);
                  pushToast(
                    isWishlisted ? "Removed from wishlist" : "Saved to your wishlist!",
                    isWishlisted ? "info" : "success"
                  );
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 py-3 text-xs font-semibold text-neutral-700 hover:border-neutral-400 transition"
              >
                <span>{isWishlisted ? "❤️" : "🤍"}</span>
                <span>{isWishlisted ? "Product Saved in Wishlist" : "Save to Wishlist"}</span>
              </button>
            </div>
          </div>

          {/* Product Tabs (Specs / Delivery / Returns / Sourcing) */}
          <div className="mt-10 rounded-3xl border border-neutral-200 p-6 bg-neutral-50/40">
            <div className="flex border-b border-neutral-200 pb-3 gap-4 text-xs font-bold overflow-x-auto">
              {[
                { id: "specs", label: "Specifications" },
                { id: "delivery", label: "Nepal Delivery" },
                { id: "returns", label: "Return Policy" },
                { id: "sourcing", label: "Source Info" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`pb-1 border-b-2 transition whitespace-nowrap ${
                    activeTab === t.id
                      ? "border-black text-neutral-900"
                      : "border-transparent text-neutral-400 hover:text-black"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-4 text-xs leading-relaxed text-neutral-700">
              {activeTab === "specs" && (
                <div className="space-y-2">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-neutral-100 py-1.5">
                      <span className="font-semibold text-neutral-500">{k}</span>
                      <span className="text-neutral-900 font-medium text-right">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "delivery" && (
                <div className="space-y-2 text-neutral-600">
                  <p>• <strong>Kathmandu Valley:</strong> 1-2 business days express delivery.</p>
                  <p>• <strong>Major Cities (Pokhara, Biratnagar, Chitwan, Butwal, etc.):</strong> 2-4 business days.</p>
                  <p>• <strong>Other Nepal districts:</strong> 3-6 business days via local courier partners.</p>
                  <p>• <strong>Cash on Delivery:</strong> Available across major city locations.</p>
                </div>
              )}

              {activeTab === "returns" && (
                <div className="space-y-2 text-neutral-600">
                  <p>• <strong>7-Day Replacement:</strong> Defective, damaged or wrong items are eligible for prompt replacement.</p>
                  <p>• <strong>Verification Check:</strong> Please keep original packaging and tags intact.</p>
                </div>
              )}

              {activeTab === "sourcing" && (
                <div className="space-y-2 text-neutral-600">
                  <p>• Sourced directly from verified brands and trusted Indian/international suppliers.</p>
                  <p>• VEYRA verifies authentic serials and quality standards before dispatch in Nepal.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Form Section */}
      <section className="mt-16 border-t border-neutral-200 pt-12">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Customer Feedback</span>
              <h2 className="text-2xl font-extrabold text-neutral-900 mt-1">Verified Customer Reviews</h2>
              <p className="text-xs text-neutral-500">Real feedback from verified buyers across Nepal.</p>
            </div>

            <div className="space-y-4">
              {reviewsList.map((rev) => (
                <article key={rev.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">{rev.author}</span>
                      {rev.verified && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400">{rev.date}</span>
                  </div>

                  <div className="mt-2 flex text-amber-500 text-xs">
                    {"★".repeat(rev.rating)}
                    {"☆".repeat(5 - rev.rating)}
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-neutral-900">{rev.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600">{rev.content}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Submit a Review Form */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50/70 p-6">
              <h3 className="text-lg font-bold text-neutral-900">Write a Review</h3>
              <p className="mt-1 text-xs text-neutral-500">Share your experience with this product.</p>

              {reviewSubmitted && (
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
                  ✓ Your review has been submitted and posted!
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Your Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-medium"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars - Excellent</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars - Very Good</option>
                    <option value={3}>⭐⭐⭐ 3 Stars - Average</option>
                    <option value={2}>⭐⭐ 2 Stars - Below Average</option>
                    <option value={1}>⭐ 1 Star - Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Your Name</label>
                  <input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="e.g. Pratik S. (Kathmandu)"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Review Headline</label>
                  <input
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Impressive sound quality and fast delivery"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Your Review</label>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Tell other shoppers in Nepal about your experience..."
                    rows={4}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-black py-3 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition"
                >
                  Submit Verified Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="mt-16 border-t border-neutral-200 pt-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">You May Also Like</span>
            <h2 className="text-2xl font-extrabold text-neutral-900 mt-1">Recommended Products</h2>
          </div>
          <Link href="/shop" className="text-xs font-bold text-neutral-900 hover:text-veyra-gold">
            View All in Shop →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {recommended.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-12">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Your Browsing History</span>
            <h2 className="text-xl font-extrabold text-neutral-900 mt-1">Recently Viewed</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-30 border-t border-neutral-200/90 bg-white/95 p-3 backdrop-blur-md md:hidden flex items-center justify-between gap-3 shadow-lg">
        <div>
          <p className="text-xs font-bold text-neutral-900 truncate max-w-[160px]">{product.name}</p>
          <p className="text-xs font-extrabold text-neutral-900">{formatNpr(product.price)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="rounded-xl bg-black px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
        >
          {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
