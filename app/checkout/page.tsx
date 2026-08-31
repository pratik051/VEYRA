"use client";

import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { formatNpr, generateId } from "@/lib/utils";
import { nepalProvinces } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("eSewa");
  const [paymentInfo, setPaymentInfo] = useState<{ provider?: string; status?: string; redirectUrl?: string } | null>(null);
  const { pushToast } = useToast();

  useEffect(() => {
    if (!items.length) {
      setIsAuthReady(true);
      return;
    }

    let isMounted = true;
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!isMounted) return;

        if (!response.ok) {
          router.replace("/account?tab=Security%20%26%20Auth");
          return;
        }

        setIsAuthReady(true);
      } catch (error) {
        if (!isMounted) return;
        console.error("Checkout auth check failed", error);
        router.replace("/account?tab=Security%20%26%20Auth");
      }
    };

    void checkAuth();
    return () => {
      isMounted = false;
    };
  }, [items.length, router]);

  const delivery = items.length ? (subtotal >= 3000 ? 0 : 200) : 0;
  const total = subtotal + delivery;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!items.length) {
      pushToast("Your cart is empty.", "error");
      return;
    }
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError("");

    const payload = {
      fullName: String(form.get("fullName") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      email: String(form.get("email") || "").trim(),
      province: String(form.get("province") || ""),
      district: String(form.get("district") || ""),
      city: String(form.get("city") || ""),
      ward: String(form.get("ward") || ""),
      fullAddress: String(form.get("fullAddress") || ""),
      landmark: String(form.get("landmark") || ""),
      paymentMethod: selectedPayment,
      items: items.map((item) => ({ productId: item.id, quantity: item.quantity, unitPrice: item.price }))
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Checkout failed.");
        pushToast(data.error || "Checkout failed.", "error");
        setLoading(false);
        return;
      }
      const confirmedId = data.orderId || generateId("ORD");
      setOrderId(confirmedId);
      setPaymentInfo(data.payment || null);
      pushToast(`Order ${confirmedId} placed successfully!`, "success");
      clearCart();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Network error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-12 shadow-card text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
            ✓
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900">Order Confirmed!</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Thank you for shopping with VEYRA. We are preparing your order for dispatch.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-6 text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 font-medium">Order Reference ID:</span>
              <strong className="text-sm font-extrabold text-neutral-900">{orderId}</strong>
            </div>

            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 font-medium">Selected Payment:</span>
              <strong className="text-neutral-900">{selectedPayment}</strong>
            </div>

            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 font-medium">Payment Status:</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                Pending Verification
              </span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-neutral-500 font-medium">Estimated Nepal Delivery:</span>
              <strong className="text-neutral-900">2-4 Business Days</strong>
            </div>

            {selectedPayment === "Bank Transfer" && (
              <div className="mt-4 rounded-xl border border-neutral-300 bg-white p-4 text-xs space-y-2">
                <p className="font-bold text-neutral-900">🏦 VEYRA Bank Details for Transfer:</p>
                <p><strong>Bank:</strong> Nabil Bank Limited (Kathmandu Branch)</p>
                <p><strong>Account Name:</strong> VEYRA RETAIL NEPAL</p>
                <p><strong>Account Number:</strong> 01200175089201</p>
                <p className="text-[11px] text-neutral-500">
                  Please include your Order ID (<strong>{orderId}</strong>) in the remarks/narration.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href={`/track-order?orderId=${orderId}`}
              className="rounded-xl bg-black px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition"
            >
              Track My Order
            </Link>
            <Link
              href="/shop"
              className="rounded-xl border border-black bg-white px-6 py-3.5 text-xs font-bold text-black hover:bg-neutral-50 transition"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => window.print()}
              className="rounded-xl border border-neutral-300 bg-white px-5 py-3.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
            >
              🖨️ Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Your Cart is Empty</h1>
        <p className="mt-2 text-xs text-neutral-500">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-xs font-bold text-white">
          Return to Shop
        </Link>
      </div>
    );
  }

  if (!isAuthReady) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Checking your account</h1>
        <p className="mt-2 text-xs text-neutral-500">Please wait while we confirm you are signed in before placing your order.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-neutral-900">Checkout</h1>
      <p className="mt-1 text-xs text-neutral-500">Complete your delivery address and choose a payment method.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Checkout Form */}
        <form onSubmit={onSubmit} className="space-y-8 lg:col-span-8">
          {/* Customer & Delivery Information */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              1. Customer &amp; Delivery Information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Full Name *</label>
                <input
                  name="fullName"
                  required
                  placeholder="e.g. Pratik Sharma"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Phone Number *</label>
                <input
                  name="phone"
                  required
                  placeholder="e.g. 9801234567"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. pratik@example.com"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              {/* Province Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Province *</label>
                <select
                  name="province"
                  required
                  defaultValue={nepalProvinces[2]} // Bagmati default
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                >
                  {nepalProvinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">District *</label>
                <input
                  name="district"
                  required
                  placeholder="e.g. Kathmandu / Kaski / Morang"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">City / Municipality *</label>
                <input
                  name="city"
                  required
                  placeholder="e.g. Kathmandu Metropolitan"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Ward No. *</label>
                <input
                  name="ward"
                  required
                  placeholder="e.g. Ward 4"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Full Street Address *</label>
                <textarea
                  name="fullAddress"
                  required
                  placeholder="e.g. House No. 42, Baluwatar Marg, near Prime Minister Residence"
                  rows={2}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Nearest Landmark (Optional)</label>
                <input
                  name="landmark"
                  placeholder="e.g. Opposite Bhatbhateni Supermarket"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              2. Payment Method
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  id: "eSewa",
                  name: "eSewa Mobile Wallet",
                  desc: "Instant payment with eSewa digital wallet."
                },
                {
                  id: "Khalti",
                  name: "Khalti Digital Wallet",
                  desc: "Quick checkout using Khalti credentials."
                },
                {
                  id: "Bank Transfer",
                  name: "Direct Bank Transfer / Fonepay",
                  desc: "Mobile banking or bank account transfer."
                },
                {
                  id: "Cash on Delivery",
                  name: "Cash on Delivery (COD)",
                  desc: "Pay in cash upon doorstep delivery in Nepal."
                }
              ].map((p) => (
                <label
                  key={p.id}
                  onClick={() => setSelectedPayment(p.id)}
                  className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition ${
                    selectedPayment === p.id
                      ? "border-black bg-neutral-50 shadow-sm"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">{p.name}</span>
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      checked={selectedPayment === p.id}
                      onChange={() => setSelectedPayment(p.id)}
                      className="accent-black"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-500">{p.desc}</p>
                </label>
              ))}
            </div>

            {selectedPayment === "Bank Transfer" && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 text-xs space-y-1">
                <p className="font-bold text-neutral-900">🏦 Transfer Details:</p>
                <p>Nabil Bank • Acc: 01200175089201 • VEYRA RETAIL NEPAL</p>
                <p className="text-[11px] text-neutral-500">Scan Fonepay QR or transfer after confirming order.</p>
              </div>
            )}
          </div>

          {error && <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black py-4 text-sm font-bold text-white shadow-lg hover:bg-neutral-800 disabled:opacity-60 transition"
          >
            {loading ? "Placing Your Order..." : `Place Order • ${formatNpr(total)}`}
          </button>
        </form>

        {/* Order Summary Aside */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-3xl border border-neutral-200 bg-white p-6 shadow-card space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Items Summary ({items.length})</h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-700">{item.quantity}x</span>
                    <span className="truncate max-w-[150px] text-neutral-800 font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-neutral-900">{formatNpr(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 pt-3 space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatNpr(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-neutral-900">
                  {delivery === 0 ? <strong className="text-emerald-600">FREE</strong> : formatNpr(delivery)}
                </span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-extrabold text-neutral-900">
                <span>Total Amount</span>
                <span>{formatNpr(total)}</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 text-center">
              By placing this order, you agree to VEYRA terms and delivery policies.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
