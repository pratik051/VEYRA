"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/providers/cart-provider";
import { formatNpr } from "@/lib/utils";
import { coupons } from "@/lib/data";
import { useToast } from "@/components/providers/toast-provider";

export default function CartPage() {
  const { items, removeFromCart, subtotal, updateQty } = useCart();
  const { pushToast } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  const delivery = items.length ? (subtotal >= 3000 ? 0 : 200) : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discountAmount + delivery);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const cleanCode = couponCode.trim().toUpperCase();

    const found = coupons.find((c) => c.code === cleanCode);
    if (!found) {
      setCouponError("Invalid coupon code. Try WELCOME10 or VEYRA500.");
      pushToast("Invalid coupon code.", "error");
      return;
    }

    if (subtotal < found.minOrder) {
      setCouponError(`Minimum order of ${formatNpr(found.minOrder)} required for this coupon.`);
      pushToast(`Minimum order of ${formatNpr(found.minOrder)} required.`, "error");
      return;
    }

    let calculatedDiscount = 0;
    if (found.discountType === "percentage") {
      calculatedDiscount = Math.round((subtotal * found.amount) / 100);
    } else {
      calculatedDiscount = found.amount;
    }

    setAppliedCoupon({ code: found.code, discount: calculatedDiscount });
    pushToast(`Coupon ${found.code} applied! Saved ${formatNpr(calculatedDiscount)}`, "success");
    setCouponCode("");
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    pushToast("Coupon removed.", "info");
  };

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-3xl mb-4">
          🛒
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900">Your cart is waiting.</h1>
        <p className="mt-2 text-sm text-neutral-500 max-w-sm mx-auto">
          Discover curated fashion, tech accessories, and everyday essentials you&apos;ll love.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-xl bg-black px-7 py-3.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition"
          >
            Start Shopping
          </Link>
          <Link
            href="/request-product"
            className="rounded-xl border border-black bg-white px-7 py-3.5 text-xs font-bold text-black hover:bg-neutral-100 transition"
          >
            Request from India
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-neutral-900">Shopping Cart</h1>
      <p className="mt-1 text-xs text-neutral-500">
        You have <strong className="text-neutral-900">{items.length}</strong> unique item(s) in your bag.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Cart Items List */}
        <div className="space-y-4 lg:col-span-8">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <Link href={`/product/${item.slug}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                  <Image
                    src={`${item.image}?auto=format&fit=crop&w=300&q=80`}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{item.category}</span>
                  <Link href={`/product/${item.slug}`} className="block">
                    <h3 className="text-sm font-bold text-neutral-900 hover:text-veyra-gold transition line-clamp-1">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs font-semibold text-neutral-800">{formatNpr(item.price)}</p>

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <button
                      onClick={() => {
                        removeFromCart(item.id);
                        pushToast(`${item.name} removed from cart.`, "info");
                      }}
                      className="text-red-600 hover:underline font-medium"
                    >
                      Remove
                    </button>
                    <span className="text-neutral-300">•</span>
                    <button
                      onClick={() => pushToast("Saved for later!", "info")}
                      className="text-neutral-500 hover:text-black font-medium"
                    >
                      Save for later
                    </button>
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Subtotal */}
              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                <div className="flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1">
                  <button
                    onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-neutral-600 hover:bg-white transition"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-neutral-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-neutral-600 hover:bg-white transition"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-xs text-neutral-400">Total</p>
                  <p className="text-sm font-bold text-neutral-900">{formatNpr(item.price * item.quantity)}</p>
                </div>
              </div>
            </article>
          ))}

          {/* Coupon Code Box */}
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50/70 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">Have a Promo or Coupon Code?</h3>
            {appliedCoupon ? (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                <span>
                  ✓ Coupon <strong>{appliedCoupon.code}</strong> applied (-{formatNpr(appliedCoupon.discount)})
                </span>
                <button onClick={handleRemoveCoupon} className="font-bold text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. WELCOME10 or VEYRA500"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 focus:border-black focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition"
                >
                  Apply
                </button>
              </form>
            )}
            {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
            <p className="mt-2 text-[11px] text-neutral-400">
              Try <code className="font-mono text-neutral-700 bg-neutral-200 px-1 py-0.5 rounded">WELCOME10</code> for 10% off or <code className="font-mono text-neutral-700 bg-neutral-200 px-1 py-0.5 rounded">VEYRA500</code> for Rs. 500 off.
            </p>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-neutral-200 bg-white p-6 shadow-card space-y-5">
            <h2 className="text-lg font-bold text-neutral-900">Order Summary</h2>

            <div className="space-y-3 text-xs text-neutral-600 border-b border-neutral-100 pb-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatNpr(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-{formatNpr(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Delivery Fee</span>
                <span className="font-semibold text-neutral-900">
                  {delivery === 0 ? <strong className="text-emerald-600">FREE</strong> : formatNpr(delivery)}
                </span>
              </div>

              {subtotal < 3000 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg">
                  Add {formatNpr(3000 - subtotal)} more to qualify for <strong>FREE Delivery</strong> across Nepal!
                </p>
              )}
            </div>

            <div className="flex justify-between text-base font-extrabold text-neutral-900 pt-1">
              <span>Estimated Total</span>
              <span className="text-xl">{formatNpr(total)}</span>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center rounded-2xl bg-black py-4 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition"
              >
                Proceed to Checkout →
              </Link>
              <Link
                href="/shop"
                className="flex w-full items-center justify-center rounded-2xl border border-neutral-200 bg-white py-3.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
              >
                Continue Shopping
              </Link>
            </div>

            <div className="pt-2 text-center text-[11px] text-neutral-400">
              🔒 Safe &amp; Encrypted Checkout • eSewa • Khalti • Bank Transfer • COD
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
