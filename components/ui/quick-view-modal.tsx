"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { discountPercent, formatNpr } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { useToast } from "@/components/providers/toast-provider";
import { useRouter } from "next/navigation";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { has, toggle } = useWishlist();
  const { pushToast } = useToast();

  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setActiveImage(product.gallery[0] || product.image);
      setSelectedColor(product.colors[0] || "");
      setSelectedSize(product.sizes?.[0] || "");
      setQuantity(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    pushToast(`Added ${quantity}x ${product.name} to cart`, "success");
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    router.push("/checkout");
  };

  const discount = discountPercent(product.price, product.originalPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl border border-black/[0.06] bg-white p-6 shadow-modal overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Gold top accent */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, #C9A84C 40%, #E8C97A 60%, transparent 100%)" }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-veyra-muted hover:border-veyra-gold/40 hover:text-veyra-gold transition-all duration-200"
        >
          ✕
        </button>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-veyra-surface-2">
              <Image
                src={`${activeImage || product.image}?auto=format&fit=crop&w=800&q=85`}
                alt={product.name}
                width={600}
                height={600}
                className="h-72 w-full object-cover sm:h-80"
              />
            </div>
            {product.gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {product.gallery.map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      activeImage === img
                        ? "border-veyra-gold shadow-gold"
                        : "border-black/10 opacity-50 hover:opacity-80 hover:border-black/20"
                    }`}
                  >
                    <Image
                      src={`${img}?auto=format&fit=crop&w=200&q=75`}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-widest text-veyra-muted/80 font-bold">{product.category}</span>
                {product.badge && (
                  <span className="rounded-full bg-veyra-gold/20 border border-veyra-gold/30 px-2 py-0.5 text-[10px] font-bold text-veyra-gold">
                    {product.badge}
                  </span>
                )}
              </div>

              <h2 className="font-display mt-2 text-2xl font-black text-veyra-text-dark leading-tight">{product.name}</h2>
              <p className="text-xs text-veyra-muted font-semibold mt-0.5">{product.brand}</p>

              {/* Rating */}
              <div className="mt-2.5 flex items-center gap-2">
                <div className="flex text-veyra-gold-dark text-sm">
                  {"★".repeat(Math.round(product.rating))}
                  <span className="text-veyra-border">{"★".repeat(5 - Math.round(product.rating))}</span>
                </div>
                <span className="text-xs text-veyra-muted font-medium">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Pricing */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-2xl font-black text-veyra-gold-dark">{formatNpr(product.price)}</span>
                <span className="text-sm text-veyra-muted/60 line-through">{formatNpr(product.originalPrice)}</span>
                <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-xs font-bold text-emerald-400">
                  {discount}% OFF
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-veyra-muted/80 line-clamp-3">{product.description}</p>

              {/* Color options */}
              {product.colors.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-veyra-muted mb-2">Color: <span className="text-veyra-text-dark">{selectedColor}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                          selectedColor === c
                            ? "bg-veyra-gold text-black shadow-gold"
                            : "border border-black/5 bg-black/[0.02] text-veyra-muted hover:border-veyra-gold/30 hover:text-veyra-gold-dark"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size options */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-veyra-muted mb-2">Size: <span className="text-veyra-text-dark">{selectedSize}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                          selectedSize === s
                            ? "bg-veyra-gold text-black shadow-gold"
                            : "border border-black/5 bg-black/[0.02] text-veyra-muted hover:border-veyra-gold/30 hover:text-veyra-gold-dark"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-veyra-muted">Qty:</span>
                <div className="flex items-center rounded-xl border border-black/10 bg-black/[0.03]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-sm font-bold text-veyra-muted hover:text-veyra-gold-dark transition-colors duration-200"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-black text-veyra-text-dark">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 text-sm font-bold text-veyra-muted hover:text-veyra-gold-dark transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
                <span className={`text-xs font-semibold ${product.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="shimmer-gold rounded-xl bg-veyra-gold py-3 text-xs font-black text-black hover:bg-veyra-gold-light hover:shadow-gold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="rounded-xl border border-veyra-gold/40 bg-veyra-gold/10 py-3 text-xs font-bold text-veyra-gold-dark hover:bg-veyra-gold/20 hover:border-veyra-gold/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Buy Now
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    toggle(product.id);
                    pushToast(has(product.id) ? "Removed from wishlist" : "Saved to wishlist", "info");
                  }}
                  className="flex items-center gap-1.5 text-xs text-veyra-muted hover:text-veyra-gold-dark transition-colors duration-200"
                >
                  <span>{has(product.id) ? "❤️" : "🤍"}</span>
                  <span>{has(product.id) ? "Wishlisted" : "Add to Wishlist"}</span>
                </button>
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-xs font-bold text-veyra-gold-dark hover:text-veyra-gold transition-colors duration-200"
                >
                  Full Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
