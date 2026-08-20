"use client";

import { FormEvent, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { formatNpr, generateId } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/components/providers/toast-provider";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ provider?: string; status?: string; redirectUrl?: string } | null>(null);
  const { pushToast } = useToast();
  const delivery = items.length ? 250 : 0;
  const total = subtotal + delivery;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!items.length) return;
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    const payload = {
      fullName: String(form.get("fullName") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      province: String(form.get("province") || ""),
      district: String(form.get("district") || ""),
      city: String(form.get("city") || ""),
      ward: String(form.get("ward") || ""),
      fullAddress: String(form.get("fullAddress") || ""),
      paymentMethod: String(form.get("paymentMethod") || "Cash on Delivery"),
      items: items.map((item) => ({ productId: item.id, quantity: item.quantity, unitPrice: item.price }))
    };
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
    setOrderId(data.orderId || generateId("ORD"));
    setPaymentInfo(data.payment || null);
    pushToast("Order placed successfully.", "success");
    clearCart();
    setLoading(false);
  };

  if (orderId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-semibold">Order Confirmed!</h1>
        <p className="mt-4 text-sm">Order ID: <strong>{orderId}</strong></p>
        <p className="mt-2 text-sm">Payment status: Pending confirmation</p>
        {paymentInfo ? (
          <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm">
            <p><strong>Payment Method:</strong> {paymentInfo.provider || "N/A"}</p>
            <p><strong>Payment Flow:</strong> {paymentInfo.status || "Pending"}</p>
            {paymentInfo.redirectUrl ? <p className="mt-1 break-all"><strong>Gateway URL:</strong> {paymentInfo.redirectUrl}</p> : null}
          </div>
        ) : null}
        <p className="mt-2 text-sm">Estimated delivery information: Based on sourcing and Nepal delivery route.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/track-order" className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Track My Order</Link>
          <Link href="/shop" className="rounded-xl border border-black px-5 py-3 text-sm font-semibold">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-neutral-200 p-5 lg:col-span-2">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Full Name", "fullName"],
            ["Phone Number", "phone"],
            ["Email", "email"],
            ["Province", "province"],
            ["District", "district"],
            ["City/Municipality", "city"],
            ["Ward", "ward"],
            ["Landmark", "landmark"]
          ].map(([item, name]) => (
            <input key={name} name={name} required placeholder={item} className="rounded-lg border border-neutral-300 px-3 py-2" />
          ))}
          <textarea name="fullAddress" required placeholder="Full Address" className="min-h-24 rounded-lg border border-neutral-300 px-3 py-2 sm:col-span-2" />
        </div>
        <label className="text-sm">Payment Method
          <select name="paymentMethod" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2">
            <option>eSewa (Configured)</option>
            <option>Khalti (Configured)</option>
            <option>Bank Transfer</option>
            <option>Cash on Delivery (where available)</option>
          </select>
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Placing..." : "Place Order"}</button>
      </form>
      <aside className="h-fit rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p className="flex justify-between"><span>Items</span><span>{items.length}</span></p>
          <p className="flex justify-between"><span>Subtotal</span><span>{formatNpr(subtotal)}</span></p>
          <p className="flex justify-between"><span>Delivery fee</span><span>{formatNpr(delivery)}</span></p>
          <p className="flex justify-between border-t border-neutral-200 pt-2 font-semibold"><span>Total</span><span>{formatNpr(total)}</span></p>
        </div>
      </aside>
    </div>
  );
}
