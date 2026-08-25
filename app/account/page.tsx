"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/ui/product-card";
import { formatNpr } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import { ProductRequestItem } from "@/lib/types";
import Link from "next/link";

const tabs = ["Overview", "Orders", "Product Requests", "Wishlist", "Security & Auth"] as const;

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as (typeof tabs)[number]) || "Overview";

  const [tab, setTab] = useState<(typeof tabs)[number]>(
    tabs.includes(initialTab) ? initialTab : "Overview"
  );
  const [user, setUser] = useState<{ id: string; fullName: string; email: string; phone?: string; role: string } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const { ids, clear: clearWishlist } = useWishlist();
  const { pushToast } = useToast();

  // Sample order history
  const [orders] = useState([
    {
      orderId: "VEYRA-ORD-10245",
      date: "Aug 18, 2026",
      itemsCount: 2,
      total: 6398,
      status: "In Transit",
      paymentStatus: "Confirmed",
      paymentMethod: "eSewa"
    }
  ]);

  // Sample India product requests with quote
  const [requests, setRequests] = useState<ProductRequestItem[]>([
    {
      requestId: "VEYRA-REQ-10245",
      fullName: "Pratik S.",
      phone: "9801234567",
      productUrl: "https://www.amazon.in/dp/B09XYZ1234",
      productName: "Sony WH-1000XM5 Wireless Headphones",
      productCategory: "Tech & Gadgets",
      quantity: 1,
      status: "Quote Sent",
      createdAt: "Aug 19, 2026",
      quote: {
        indianProductPrice: 24999, // INR
        exchangeRate: 1.60,
        shippingIndiaToNepal: 800,
        customsTaxes: 4000,
        handlingFee: 600,
        nepalDeliveryFee: 200,
        serviceFee: 1200,
        finalEstimatedPrice: 46798,
        customerQuote: 46798,
        quoteExpiry: "Valid until Aug 25, 2026"
      }
    }
  ]);

  const wishedProducts = products.filter((p) => ids.includes(p.id));

  useEffect(() => {
    const loadMe = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) return;
        const data = await response.json();
        setUser(data.user || null);
      } catch (e) {
        console.error(e);
      }
    };
    void loadMe();
  }, []);

  const register = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      password: String(form.get("password") || "").trim()
    };
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to create account.");
      pushToast(data.error || "Registration failed.", "error");
      return;
    }
    setUser(data.user);
    setMessage("Account created and logged in.");
    pushToast("Welcome to VEYRA!", "success");
    setTab("Overview");
  };

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || "").trim()
    };
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Invalid credentials.");
      pushToast(data.error || "Login failed.", "error");
      return;
    }
    setUser(data.user);
    setMessage("Login successful.");
    pushToast("Logged in successfully!", "success");
    setTab("Overview");
  };

  const logout = async () => {
    setError("");
    setMessage("");
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMessage("Logged out successfully.");
    pushToast("Logged out.", "info");
  };

  const handleAcceptQuote = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.requestId === reqId ? { ...r, status: "Customer Confirmed" } : r))
    );
    pushToast(`Quote for ${reqId} accepted! VEYRA will contact you for dispatch.`, "success");
  };

  const handleDeclineQuote = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.requestId === reqId ? { ...r, status: "Cancelled" } : r))
    );
    pushToast(`Quote for ${reqId} declined.`, "info");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900">Customer Account</h1>
          <p className="mt-1 text-xs text-neutral-500">
            {user ? (
              <>
                Logged in as <strong className="text-neutral-900">{user.fullName}</strong> ({user.email})
              </>
            ) : (
              "Manage orders, check India product quotations and access saved wishlist items."
            )}
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                Go to Admin Dashboard →
              </Link>
            )}
            <button
              onClick={logout}
              className="rounded-xl bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              tab === t
                ? "bg-black text-white shadow-sm"
                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-black"
            }`}
          >
            {t === "Orders" && `Orders (${orders.length})`}
            {t === "Product Requests" && `Product Requests (${requests.length})`}
            {t === "Wishlist" && `Wishlist (${ids.length})`}
            {t !== "Orders" && t !== "Product Requests" && t !== "Wishlist" && t}
          </button>
        ))}
      </div>

      {/* Alert Messages */}
      {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">{message}</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</p>}

      {/* Tab Panels */}
      <div className="mt-6">
        {/* 1. Overview & Profile */}
        {tab === "Overview" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-neutral-900">Profile Information</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-neutral-400 font-semibold uppercase">Full Name</span>
                  <p className="text-sm font-bold text-neutral-900">{user?.fullName || "Guest Customer"}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-semibold uppercase">Email</span>
                  <p className="font-medium text-neutral-800">{user?.email || "Not signed in"}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-semibold uppercase">Default Phone</span>
                  <p className="font-medium text-neutral-800">{user?.phone || "+977-9801234567"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-neutral-900">Default Shipping Address</h3>
              <div className="space-y-2 text-xs text-neutral-600">
                <p className="font-semibold text-neutral-900">Pratik Sharma</p>
                <p>House 42, Baluwatar Marg, Ward 4</p>
                <p>Kathmandu Metropolitan, Bagmati Province</p>
                <p>Phone: +977-9801234567</p>
              </div>
              <button
                onClick={() => pushToast("Address update saved.", "success")}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Edit Address
              </button>
            </div>
          </div>
        )}

        {/* 2. Orders History */}
        {tab === "Orders" && (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.orderId}
                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900 font-mono">{ord.orderId}</span>
                    <span className="rounded-full bg-veyra-gold/15 px-2.5 py-0.5 font-bold text-veyra-gold-dark text-[10px]">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-neutral-500">Placed on {ord.date} • {ord.itemsCount} item(s)</p>
                  <p className="text-neutral-700">Payment: <strong>{ord.paymentMethod}</strong> ({ord.paymentStatus})</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-neutral-400">Total</span>
                    <p className="text-base font-bold text-neutral-900">{formatNpr(ord.total)}</p>
                  </div>
                  <Link
                    href={`/track-order?orderId=${ord.orderId}`}
                    className="rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800"
                  >
                    Track Shipment →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Product Requests & India Quotations */}
        {tab === "Product Requests" && (
          <div className="space-y-6">
            {requests.map((req) => (
              <div key={req.requestId} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 font-mono">
                      {req.requestId}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900">{req.productName || "Custom Sourced Product"}</h3>
                    <a
                      href={req.productUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate max-w-sm block"
                    >
                      🔗 {req.productUrl}
                    </a>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      req.status === "Quote Sent"
                        ? "bg-amber-100 text-amber-800"
                        : req.status === "Customer Confirmed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    Status: {req.status}
                  </span>
                </div>

                {/* Quotation Breakdown Card */}
                {req.quote && (
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5 space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                      <span className="font-bold text-neutral-900 text-sm">📋 Sourced Product Sourcing Quote</span>
                      <span className="text-[11px] font-semibold text-neutral-500">{req.quote.quoteExpiry}</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-neutral-700">
                      <div>
                        <span className="text-neutral-400 font-medium">Source Platform:</span>
                        <p className="font-bold text-neutral-900">{req.detectedPlatform || "Indian Marketplace"}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400 font-medium">Expected Delivery:</span>
                        <p className="font-bold text-neutral-900">{req.quote.expectedDeliveryTime || "5–10 business days"}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-neutral-400 font-medium">Sourcing Location:</span>
                        <p className="font-bold text-neutral-900">Configured Hub (Nepal Import Channel)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-neutral-700">
                      <div>
                        <span className="text-neutral-400">Estimated Product Price:</span>
                        <p className="font-semibold text-neutral-900">
                          {formatNpr(Math.round((req.quote.indianProductPrice || 0) * (req.quote.exchangeRate || 1.60)))}
                        </p>
                        <span className="text-[10px] text-neutral-400">
                          (₹{req.quote.indianProductPrice?.toLocaleString()} @ {req.quote.exchangeRate || 1.60})
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Estimated Additional Charges:</span>
                        <p className="font-semibold text-neutral-900">
                          {formatNpr(
                            (req.quote.shippingIndiaToNepal || 0) +
                              (req.quote.customsTaxes || 0) +
                              (req.quote.handlingFee || 0) +
                              (req.quote.serviceFee || 0)
                          )}
                        </p>
                        <span className="text-[10px] text-neutral-400">(Freight, customs, service fee)</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Estimated Nepal Delivery:</span>
                        <p className="font-semibold text-neutral-900">
                          {formatNpr(req.quote.nepalDeliveryFee || 0)}
                        </p>
                        <span className="text-[10px] text-neutral-400">(Kathmandu / Province)</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 font-bold">Estimated Total:</span>
                        <p className="text-lg font-extrabold text-neutral-900">
                          {formatNpr(req.quote.finalEstimatedPrice || 0)}
                        </p>
                      </div>
                    </div>

                    {req.quote.adminNotes && (
                      <div className="rounded-xl bg-white p-3 border border-neutral-200 text-[11px] text-neutral-600">
                        <strong>VEYRA Representative Note:</strong> {req.quote.adminNotes}
                      </div>
                    )}

                    {/* Disclaimer */}
                    <p className="text-[10px] text-neutral-400 leading-relaxed pt-1">
                      <strong>Disclaimer:</strong> Final pricing may change depending on product availability, seller pricing, exchange rates, shipping, applicable taxes/customs and other charges at the time of purchase.
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-neutral-200 pt-3">
                      <div>
                        <span className="text-neutral-500">Do you want to proceed with this request?</span>
                      </div>

                      {req.status === "Quote Sent" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptQuote(req.requestId)}
                            className="rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition"
                          >
                            ✓ Accept &amp; Continue
                          </button>
                          <button
                            onClick={() => handleDeclineQuote(req.requestId)}
                            className="rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 4. Wishlist */}
        {tab === "Wishlist" && (
          <div>
            {wishedProducts.length === 0 ? (
              <div className="rounded-3xl border border-neutral-200 p-12 text-center bg-white shadow-sm">
                <p className="text-2xl mb-2">🤍</p>
                <h3 className="text-base font-bold text-neutral-900">Your Wishlist is Empty</h3>
                <p className="mt-1 text-xs text-neutral-500">Save products while browsing to view and buy them later.</p>
                <Link href="/shop" className="mt-4 inline-block rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white">
                  Explore Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>Saved Items ({wishedProducts.length})</span>
                  <button onClick={clearWishlist} className="text-red-600 hover:underline">
                    Clear Wishlist
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {wishedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. Security & Authentication */}
        {tab === "Security & Auth" && (
          <div className="grid gap-8 md:grid-cols-2">
            {/* Login Form */}
            <form onSubmit={login} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-neutral-900">Customer Login</h3>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. pratik@example.com"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-black py-3 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition"
              >
                Sign In
              </button>
            </form>

            {/* Register Form */}
            <form onSubmit={register} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-neutral-900">Create New Account</h3>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Full Name</label>
                <input
                  name="fullName"
                  required
                  placeholder="e.g. Pratik Sharma"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. pratik@example.com"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Phone</label>
                <input
                  name="phone"
                  required
                  placeholder="e.g. 9801234567"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-black py-3 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition"
              >
                Register Account
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-neutral-500">Loading Account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
