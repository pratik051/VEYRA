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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black transition"
        >
          ✕
        </button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
              <Image
                src={`${activeImage || product.image}?auto=format&fit=crop&w=800&q=85`}
                alt={product.name}
                width={600}
                height={600}
                className="h-72 w-full object-cover sm:h-80"
              />
            </div>
            {product.gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.gallery.map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      activeImage === img ? "border-black" : "border-neutral-200 opacity-70 hover:opacity-100"
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
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">{product.category}</span>
                {product.badge && (
                  <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                    {product.badge}
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-2xl font-bold text-neutral-900">{product.name}</h2>
              <p className="text-xs text-neutral-500 font-medium">{product.brand}</p>

              <div className="mt-2 flex items-center gap-2">
                <div className="flex text-amber-500 text-sm">
                  {"★".repeat(Math.round(product.rating))}
                  {"☆".repeat(5 - Math.round(product.rating))}
                </div>
                <span className="text-xs text-neutral-600 font-medium">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Pricing */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-neutral-900">{formatNpr(product.price)}</span>
                <span className="text-sm text-neutral-400 line-through">{formatNpr(product.originalPrice)}</span>
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {discountPercent(product.price, product.originalPrice)}% OFF
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-neutral-600 line-clamp-3">{product.description}</p>

              {/* Color options */}
              {product.colors.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-neutral-700">Color: {selectedColor}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          selectedColor === c
                            ? "bg-black text-white"
                            : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
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
                  <p className="text-xs font-semibold text-neutral-700">Size: {selectedSize}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          selectedSize === s
                            ? "bg-black text-white"
                            : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
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
                <span className="text-xs font-semibold text-neutral-700">Qty:</span>
                <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-sm font-semibold text-neutral-600 hover:text-black"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 text-sm font-semibold text-neutral-600 hover:text-black"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-neutral-400">
                  {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="rounded-xl bg-black py-3 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="rounded-xl border-2 border-black py-3 text-xs font-semibold text-black hover:bg-black hover:text-white disabled:opacity-50 transition"
                >
                  Buy Now
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    toggle(product.id);
                    pushToast(has(product.id) ? "Removed from wishlist" : "Saved to wishlist", "info");
                  }}
                  className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black"
                >
                  <span>{has(product.id) ? "❤️" : "🤍"}</span>
                  <span>{has(product.id) ? "Wishlisted" : "Add to Wishlist"}</span>
                </button>
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-xs font-semibold text-neutral-900 underline underline-offset-4 hover:text-veyra-gold"
                >
                  View Full Product Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
