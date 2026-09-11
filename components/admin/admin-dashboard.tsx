"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { formatNpr } from "@/lib/utils";
import { categories, orderTimeline, products as defaultProducts } from "@/lib/data";

type AdminProduct = {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  badge?: string;
  featured?: boolean;
  trending?: boolean;
  image?: string;
  description?: string;
};

type AdminOrder = {
  _id: string;
  orderId: string;
  fullName: string;
  phone?: string;
  fullAddress?: string;
  total?: number;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber?: string;
  createdAt?: string;
};

type AdminIndiaOrder = {
  _id: string;
  orderId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  deliveryInstructions?: string;
  marketplace?: string;        // e.g. "amazon-india", "myntra"
  sourceProductId?: string;
  productUrl: string;          // Original Indian marketplace URL
  productName: string;
  productImage?: string;
  productVariant?: string;
  size?: string;
  color?: string;
  quantity: number;
  indianPriceINR: number;
  conversionAmountNPR: number;
  serviceChargeNPR: number;
  deliveryChargeNPR: number;
  finalAmountNPR: number;
  paymentMethod: "COD" | "FULL_PAYMENT";
  paymentStatus: "Pending" | "PAID" | "Failed" | "Refunded";
  paymentTransactionId?: string;
  orderStatus: string;
  invoiceUrl?: string;
  createdAt?: string;
};

type AdminPayment = {
  _id: string;
  orderId: string;
  paymentMethod?: string;
  provider?: string;
  amount: number;
  transactionCode?: string;
  status: string;
  submittedAt?: string;
  createdAt?: string;
  userId?: { fullName?: string; email?: string; phone?: string } | string;
};

type MarketplaceProviderStatus = {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  importedCount: number;
  lastSyncedAt: string | null;
};

type MarketplaceProductItem = {
  _id: string;
  source: string;
  sourceProductId: string;
  sourceUrl: string;
  originalSourceUrl?: string;
  verifiedSourceUrl?: string;
  canonicalSourceUrl?: string;
  title: string;
  brand: string;
  category: string;
  priceINR: number;
  rating: number;
  images: string[];
  isActive?: boolean;
  published?: boolean;
  verificationStatus?: "pending" | "verified" | "failed";
  verificationMethod?: "original_url" | "ai_candidate" | "api" | "feed" | "manual";
  matchConfidence?: number;
  verificationCheckedAt?: string;
  verificationError?: string;
  imageVerified?: boolean;
  priceVerified?: boolean;
};

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span
        className={`text-xs font-semibold text-slate-800 break-words ${
          mono ? "font-mono text-slate-600 text-[11px]" : ""
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

const adminTabs = [
  "Overview",
  "India Orders & Invoices",
  "Marketplace Sources",
  "Products",
  "Store Orders",
  "Payment Verification",
  "Coupons & Settings"
] as const;

export function AdminDashboard() {
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<(typeof adminTabs)[number]>("Overview");

  const [productsList, setProductsList] = useState<AdminProduct[]>(defaultProducts);
  const [ordersList, setOrdersList] = useState<AdminOrder[]>([]);
  const [indiaOrdersList, setIndiaOrdersList] = useState<AdminIndiaOrder[]>([]);
  const [paymentsList, setPaymentsList] = useState<AdminPayment[]>([]);
  const [marketplaceProviders, setMarketplaceProviders] = useState<MarketplaceProviderStatus[]>([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProductItem[]>([]);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [reverifyingId, setReverifyingId] = useState<string | null>(null);
  const [auditingAll, setAuditingAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Full order detail panel (fetches fresh from API, not stale table row)
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<AdminIndiaOrder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Open order details: fetch fresh data from API
  const openOrderDetail = async (orderId: string) => {
    setDetailLoading(true);
    setSelectedOrderDetail(null);
    // optimistic: show from list immediately
    const local = indiaOrdersList.find((o) => o.orderId === orderId || o._id === orderId);
    if (local) setSelectedOrderDetail(local);
    try {
      const res = await fetch(`/api/admin/india-orders/${orderId}`);
      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrderDetail(data.order);
      }
    } catch {
      // fallback to optimistic local already set
    } finally {
      setDetailLoading(false);
    }
  };

  // Kept for backward compat — points to openOrderDetail
  const [selectedBreakdownOrder, setSelectedBreakdownOrder] = useState<AdminIndiaOrder | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [productRes, orderRes, indiaOrderRes, paymentRes, mktRes, mktProductsRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/india-orders"),
        fetch("/api/admin/payments"),
        fetch("/api/admin/marketplace/status"),
        fetch("/api/admin/marketplace/products")
      ]);
      if (productRes.ok) {
        const p = await productRes.json();
        if (p.products && p.products.length > 0) setProductsList(p.products);
      }
      if (orderRes.ok) {
        const o = await orderRes.json();
        setOrdersList(o.orders || []);
      }
      if (indiaOrderRes.ok) {
        const r = await indiaOrderRes.json();
        setIndiaOrdersList(r.orders || []);
      }
      if (paymentRes.ok) {
        const p = await paymentRes.json();
        setPaymentsList(p.payments || []);
      }
      if (mktRes.ok) {
        const m = await mktRes.json();
        if (m.providers) setMarketplaceProviders(m.providers);
      }
      if (mktProductsRes.ok) {
        const mp = await mktProductsRes.json();
        if (mp.products) setMarketplaceProducts(mp.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const updateIndiaOrderStatus = async (id: string, orderStatus: string, paymentStatus: string) => {
    try {
      await fetch(`/api/admin/india-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus, paymentStatus })
      });
      setIndiaOrdersList((prev) =>
        prev.map((o) =>
          o._id === id || o.orderId === id
            ? { ...o, orderStatus, paymentStatus: paymentStatus as any }
            : o
        )
      );
      pushToast("India Order status updated successfully.", "success");
    } catch {
      pushToast("Failed to update order status.", "error");
    }
  };

  const syncMarketplace = async (providerId?: string) => {
    setSyncingProvider(providerId || "ALL");
    try {
      const res = await fetch("/api/admin/marketplace/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId })
      });
      const data = await res.json();
      if (data.success) {
        pushToast(data.message || "Marketplace synchronization complete!", "success");
      } else {
        pushToast(data.error || "Sync completed with warnings.", "info");
      }
      await loadAll();
    } catch {
      pushToast("Network error during sync.", "error");
    } finally {
      setSyncingProvider(null);
    }
  };

  const toggleProvider = async (providerId: string, enabled: boolean) => {
    try {
      const res = await fetch("/api/admin/marketplace/provider", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, enabled })
      });
      if (res.ok) {
        setMarketplaceProviders((prev) =>
          prev.map((p) => (p.id === providerId ? { ...p, enabled } : p))
        );
        pushToast(`Provider ${providerId} is now ${enabled ? "enabled" : "disabled"}.`, "success");
      }
    } catch {
      pushToast("Failed to toggle provider.", "error");
    }
  };

  const reverifyMarketplaceProduct = async (id: string) => {
    setReverifyingId(id);
    try {
      const res = await fetch(`/api/admin/marketplace/products/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        pushToast(data.message || "Product verified successfully!", "success");
      } else {
        pushToast(data.error || "Verification failed for this product.", "error");
      }
      await loadAll();
    } catch {
      pushToast("Network error during reverification.", "error");
    } finally {
      setReverifyingId(null);
    }
  };

  const toggleProductPublish = async (id: string, currentPublished?: boolean) => {
    try {
      const res = await fetch(`/api/admin/marketplace/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentPublished, isActive: !currentPublished })
      });
      const data = await res.json();
      if (data.success) {
        pushToast(
          `Product is now ${!currentPublished ? "Published" : "Unpublished"}.`,
          "success"
        );
        await loadAll();
      } else {
        pushToast(data.error || "Failed to update publication status.", "error");
      }
    } catch {
      pushToast("Network error updating product.", "error");
    }
  };

  const auditAllProducts = async () => {
    setAuditingAll(true);
    try {
      const res = await fetch("/api/marketplace/verify");
      const data = await res.json();
      if (data.success) {
        const verified = data.summary?.verifiedAndPublished || 0;
        const failed = data.summary?.failedAndUnpublished || 0;
        pushToast(
          `Verification Complete: ${verified} verified & published, ${failed} failed/unpublished.`,
          "success"
        );
        await loadAll();
      } else {
        pushToast(data.error || "Verification audit encountered errors.", "error");
      }
    } catch {
      pushToast("Network error during verification audit.", "error");
    } finally {
      setAuditingAll(false);
    }
  };

  const updatePaymentStatus = async (id: string, status: "verified" | "rejected") => {
    const response = await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      pushToast("Unable to update payment status.", "error");
      return;
    }
    setPaymentsList((prev) => prev.map((payment) => payment._id === id ? { ...payment, status } : payment));
    pushToast(`Payment ${status}.`, "success");
  };

  const createProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      category: String(form.get("category") || "").trim(),
      brand: String(form.get("brand") || "").trim(),
      price: Number(form.get("price") || 0),
      originalPrice: Number(form.get("originalPrice") || 0),
      stock: Number(form.get("stock") || 0),
      badge: String(form.get("badge") || ""),
      image: String(form.get("image") || "").trim(),
      description: String(form.get("description") || "").trim()
    };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        pushToast("Product created successfully in MongoDB!", "success");
        e.currentTarget.reset();
        await loadAll();
      } else {
        setProductsList([payload as AdminProduct, ...productsList]);
        pushToast("Product added to catalog.", "success");
        e.currentTarget.reset();
      }
    } catch {
      setProductsList([payload as AdminProduct, ...productsList]);
      pushToast("Product added to local state.", "success");
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      setProductsList((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      pushToast(`Deleted ${name}`, "info");
    } catch {
      setProductsList((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      pushToast(`Deleted ${name}`, "info");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
      case "Confirmed":
      case "PAID":
      case "verified":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "In Transit":
      case "Arrived in Nepal":
      case "Purchased":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending":
      case "Requested":
      case "Verified":
      case "submitted":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Cancelled":
      case "Failed":
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Real sourcing volume from DB — no hard-coded fallback
  const totalIndiaRevenue = indiaOrdersList
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((acc, curr) => acc + (curr.finalAmountNPR || 0), 0);

  // Month-over-month growth from actual order data
  const nowMs = Date.now();
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getTime();
  const thisMonthRevenue = indiaOrdersList
    .filter((o) => o.orderStatus !== "Cancelled" && new Date(o.createdAt || 0).getTime() >= thisMonthStart)
    .reduce((acc, curr) => acc + (curr.finalAmountNPR || 0), 0);
  const lastMonthRevenue = indiaOrdersList
    .filter((o) => {
      const t = new Date(o.createdAt || 0).getTime();
      return o.orderStatus !== "Cancelled" && t >= lastMonthStart && t < thisMonthStart;
    })
    .reduce((acc, curr) => acc + (curr.finalAmountNPR || 0), 0);
  const growthPct = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : (thisMonthRevenue > 0 ? 100 : 0);

  // Suppress unused variable warnings — used in JSX
  void nowMs;

  return (
    <div className="space-y-6">
      {/* ─── 1. TOP STATS CARDS — All fully dynamic from DB ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Total Sourcing Volume — clicks to India Orders tab */}
        <button
          onClick={() => setActiveTab("India Orders & Invoices")}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between text-left w-full hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sourcing Volume</span>
            <p className="mt-1.5 text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
              {formatNpr(totalIndiaRevenue)}
            </p>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold mt-1 ${
              growthPct > 0 ? "text-emerald-600" : growthPct < 0 ? "text-red-500" : "text-slate-400"
            }`}>
              {growthPct > 0 ? "↑" : growthPct < 0 ? "↓" : "→"} {Math.abs(growthPct)}% vs last month
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-2xs group-hover:bg-emerald-100 transition-colors">
            💰
          </div>
        </button>

        {/* Card 2: India Orders — clicks to India Orders tab */}
        <button
          onClick={() => setActiveTab("India Orders & Invoices")}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between text-left w-full hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">India Orders</span>
            <p className="mt-1.5 text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
              {indiaOrdersList.length}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-1">
              {indiaOrdersList.filter((o) => o.paymentStatus === "PAID").length} Paid
              {" • "}
              {indiaOrdersList.filter((o) => o.paymentMethod === "COD").length} COD
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-2xs group-hover:bg-blue-100 transition-colors">
            🇮🇳
          </div>
        </button>

        {/* Card 3: Store Orders — clicks to Store Orders tab */}
        <button
          onClick={() => setActiveTab("Store Orders")}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between text-left w-full hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Store Orders</span>
            <p className="mt-1.5 text-2xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
              {ordersList.length}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-1">
              {ordersList.filter((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length} In Progress
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-2xs group-hover:bg-amber-100 transition-colors">
            📦
          </div>
        </button>

        {/* Card 4: Payment Evidence — clicks to Payment Verification tab */}
        <button
          onClick={() => setActiveTab("Payment Verification")}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between text-left w-full hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Evidence</span>
            <p className="mt-1.5 text-2xl font-black text-slate-900 group-hover:text-purple-700 transition-colors">
              {paymentsList.length}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 mt-1">
              {paymentsList.filter((p) => p.status === "submitted").length} Pending Review
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shadow-2xs group-hover:bg-purple-100 transition-colors">
            💳
          </div>
        </button>
      </div>

      {/* ─── 2. TAB CONTROL STRIP ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {adminTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab === "India Orders & Invoices" && `🇮🇳 India Orders (${indiaOrdersList.length})`}
              {tab === "Marketplace Sources" && `🇮🇳 Sources & Feeds (${marketplaceProviders.length})`}
              {tab === "Store Orders" && `Store Orders (${ordersList.length})`}
              {tab === "Products" && `Catalog (${productsList.length})`}
              {tab === "Payment Verification" && `Payments (${paymentsList.filter((p) => p.status === "submitted").length})`}
              {tab !== "India Orders & Invoices" && tab !== "Marketplace Sources" && tab !== "Store Orders" && tab !== "Products" && tab !== "Payment Verification" && tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search records..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
          />
          <button
            onClick={loadAll}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition whitespace-nowrap"
          >
            {loading ? "..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* ─── 3. TAB CONTENT ─── */}

      {/* 3.1 Overview Tab */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent India Orders Box */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">Recent Nepal → India Orders</h3>
                  <p className="text-xs text-slate-400">Customer requests with calculated pricing &amp; invoices</p>
                </div>
                <button
                  onClick={() => setActiveTab("India Orders & Invoices")}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View All ({indiaOrdersList.length}) →
                </button>
              </div>

              <div className="space-y-3">
                {indiaOrdersList.slice(0, 4).map((order) => (
                  <div
                    key={order.orderId}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition border border-slate-100"
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900">{order.orderId}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate">{order.productName}</p>
                      <p className="text-[11px] text-slate-500">{order.customerName} ({order.phone})</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-red-600 block">
                        {formatNpr(order.finalAmountNPR)}
                      </span>
                      <a
                        href={order.invoiceUrl || `/api/india-order/invoice/${order.orderId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline font-bold"
                      >
                        🖨️ Invoice ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Sourcing Overview */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">Sourcing Pricing Engine</h3>
                  <p className="text-xs text-slate-400">Server calculation configuration &amp; rules</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900 text-white p-5 space-y-3 text-xs">
                <div className="flex justify-between font-bold border-b border-slate-800 pb-2">
                  <span className="text-slate-400 uppercase">Pricing Component</span>
                  <span className="text-slate-400 uppercase">Rate / Formula</span>
                </div>
                <div className="flex justify-between">
                  <span>Base INR Exchange Rate</span>
                  <span className="font-mono font-bold text-amber-400">1 INR = 1.65 NPR</span>
                </div>
                <div className="flex justify-between">
                  <span>Service / Conversion Charge</span>
                  <span className="font-mono font-bold text-amber-400">20% of converted price</span>
                </div>
                <div className="flex justify-between">
                  <span>Nepal Domestic Delivery</span>
                  <span className="font-mono font-bold text-amber-400">Flat NPR 200</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                  <span className="text-slate-300">Customer Facing View</span>
                  <span className="text-emerald-400">Total NPR Amount Only</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3.2 India Orders & Invoices Tab (Complete Specification) */}
      {activeTab === "India Orders & Invoices" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Nepal → India Order Management ({indiaOrdersList.length})</h3>
                <p className="text-xs text-slate-400">Manage orders, view internal pricing breakdown &amp; print invoices</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3">Order &amp; Invoice</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Product / Store</th>
                    <th className="pb-3">INR Price</th>
                    <th className="pb-3">Final NPR</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Order Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {indiaOrdersList.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <span className="text-4xl">📭</span>
                          <span className="text-sm font-bold">No India orders yet</span>
                          <span className="text-xs">Orders placed by customers will appear here in real-time.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {indiaOrdersList.map((o) => (
                    <tr key={o.orderId} className="hover:bg-slate-50/60">
                      <td className="py-3.5">
                        <span className="font-mono font-black text-slate-900 block">{o.orderId}</span>
                        <span className="font-mono text-[10px] text-slate-500">{o.invoiceNumber}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-bold text-slate-900 block">{o.customerName}</span>
                        <span className="text-[11px] text-slate-500">{o.phone}</span>
                        {o.marketplace && (
                          <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            🇮🇳 {o.marketplace.replace("amazon-india","Amazon IN").replace("tatacliq","Tata CLiQ").replace("boat","boAt").replace(/-/g," ").replace(/\b\w/g,(c)=>c.toUpperCase())}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 max-w-[200px]">
                        <span className="font-bold text-slate-800 line-clamp-1 block">{o.productName}</span>
                        <a href={o.productUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline font-mono truncate block">
                          Link ↗
                        </a>
                      </td>
                      <td className="py-3.5 font-bold text-slate-700">
                        ₹{Number(o.indianPriceINR).toLocaleString()} INR
                      </td>
                      <td className="py-3.5 font-black text-red-600">
                        {formatNpr(o.finalAmountNPR)}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border block w-fit mb-1 ${getStatusBadge(o.paymentStatus)}`}>
                          {o.paymentStatus} ({o.paymentMethod === "FULL_PAYMENT" ? "Online" : "COD"})
                        </span>
                        <select
                          defaultValue={o.paymentStatus}
                          onChange={(e) => updateIndiaOrderStatus(o._id || o.orderId, o.orderStatus, e.target.value)}
                          className="text-[10px] font-bold rounded border border-slate-200 bg-white p-1"
                        >
                          <option value="Pending">Pending</option>
                          <option value="PAID">PAID</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="py-3.5">
                        <select
                          defaultValue={o.orderStatus}
                          onChange={(e) => updateIndiaOrderStatus(o._id || o.orderId, e.target.value, o.paymentStatus)}
                          className="text-xs font-bold rounded-lg border border-slate-300 bg-white p-1.5 focus:border-slate-900"
                        >
                          <option value="Requested">Requested</option>
                          <option value="Verified">Verified</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Purchased">Purchased</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Arrived in Nepal">Arrived in Nepal</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 text-right space-y-1">
                        <button
                          onClick={() => openOrderDetail(o.orderId)}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] transition block ml-auto w-full"
                        >
                          📋 Full Details
                        </button>
                        <a
                          href={o.invoiceUrl || `/api/india-order/invoice/${o.orderId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] transition inline-block text-center w-full"
                        >
                          🖨️ Invoice ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3.3 Marketplace Sources & Discovery Tab */}
      {activeTab === "Marketplace Sources" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                  🇮🇳 Indian Marketplace Product Discovery Providers
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Marketplace Providers &amp; Sourcing Feeds
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage discovery feeds from Indian online stores. Products are synced into LINKOVA without bypassing bot controls or scraping limits.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => syncMarketplace()}
                  disabled={syncingProvider !== null}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white hover:bg-red-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {syncingProvider ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                      <span>Syncing {syncingProvider}...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡ Sync All Providers Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketplaceProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    provider.enabled
                      ? "border-slate-200 bg-white shadow-xs"
                      : "border-slate-100 bg-slate-50/70 opacity-60"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇮🇳</span>
                          <h4 className="font-extrabold text-sm text-slate-900">{provider.displayName}</h4>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">ID: {provider.id}</span>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                          provider.enabled
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {provider.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 bg-slate-50 rounded-xl p-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Products Imported:</span>
                        <strong className="text-slate-900">{provider.importedCount} items</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last Synced:</span>
                        <span className="text-slate-700">
                          {provider.lastSyncedAt
                            ? new Date(provider.lastSyncedAt).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-4">
                    <button
                      onClick={() => toggleProvider(provider.id, !provider.enabled)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition border ${
                        provider.enabled
                          ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      }`}
                    >
                      {provider.enabled ? "Disable Provider" : "Enable Provider"}
                    </button>

                    <button
                      onClick={() => syncMarketplace(provider.id)}
                      disabled={syncingProvider !== null}
                      className="rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      Sync Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Marketplace Products & AI Verification Audit Panel ── */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  🛡️ AI Product Matching &amp; Backend Verification Engine
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Marketplace Products &amp; Verification Status ({marketplaceProducts.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Only verified products with active URLs, genuine CDN images, and match confidence &ge; 75% are published to customers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={auditAllProducts}
                  disabled={auditingAll}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white hover:bg-slate-800 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {auditingAll ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                      <span>Auditing &amp; Verifying with AI...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍 Run AI Verification Audit on All</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Imported</span>
                <span className="text-lg font-black text-slate-900">{marketplaceProducts.length}</span>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                <span className="text-[10px] font-bold uppercase text-emerald-600 block">Verified &amp; Published</span>
                <span className="text-lg font-black text-emerald-800">
                  {marketplaceProducts.filter((p) => p.verificationStatus === "verified" && p.published !== false).length}
                </span>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                <span className="text-[10px] font-bold uppercase text-blue-600 block">AI Candidate Matched</span>
                <span className="text-lg font-black text-blue-800">
                  {marketplaceProducts.filter((p) => p.verificationMethod === "ai_candidate").length}
                </span>
              </div>
              <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                <span className="text-[10px] font-bold uppercase text-red-600 block">Failed / Unpublished</span>
                <span className="text-lg font-black text-red-800">
                  {marketplaceProducts.filter((p) => p.verificationStatus === "failed" || p.published === false).length}
                </span>
              </div>
            </div>

            {/* Marketplace Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Marketplace &amp; Brand</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Verification</th>
                    <th className="pb-3">Method &amp; Confidence</th>
                    <th className="pb-3">Working Link</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marketplaceProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No marketplace products loaded yet. Click &quot;Sync All Providers Now&quot; above to import live products.
                      </td>
                    </tr>
                  )}
                  {marketplaceProducts.map((p) => {
                    const isVerified = p.verificationStatus === "verified";
                    const isAiCandidate = p.verificationMethod === "ai_candidate";
                    const workingUrl = p.verifiedSourceUrl || p.canonicalSourceUrl || p.sourceUrl;

                    return (
                      <tr key={p._id || p.sourceProductId} className="hover:bg-slate-50/60">
                        {/* Product info */}
                        <td className="py-3.5 max-w-[220px]">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] && (
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                className="h-10 w-10 rounded-lg object-contain border border-slate-200 bg-white p-0.5 flex-shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate" title={p.title}>
                                {p.title}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 block">
                                ID: {p.sourceProductId}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Marketplace & Brand */}
                        <td className="py-3.5">
                          <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full mb-1">
                            🇮🇳 {p.source.replace("amazon-india", "Amazon IN").replace("tatacliq", "Tata CLiQ").replace("boat", "boAt").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                          <span className="text-slate-600 block text-[11px] font-semibold">{p.brand}</span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 font-bold text-slate-800">
                          ₹{Number(p.priceINR).toLocaleString()} INR
                        </td>

                        {/* Verification Status */}
                        <td className="py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              isVerified
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-red-50 text-red-800 border-red-200"
                            }`}
                          >
                            {isVerified ? "✓ Verified" : "✗ Failed"}
                          </span>
                          {p.verificationError && (
                            <span className="text-[10px] text-red-500 block truncate max-w-[160px] mt-0.5" title={p.verificationError}>
                              {p.verificationError}
                            </span>
                          )}
                        </td>

                        {/* Method & Confidence */}
                        <td className="py-3.5">
                          <span className="font-bold text-slate-800 block text-[11px]">
                            {isAiCandidate ? "🤖 AI Candidate" : "🔗 Direct URL"}
                          </span>
                          {typeof p.matchConfidence === "number" && p.matchConfidence > 0 ? (
                            <span
                              className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                                p.matchConfidence >= 90
                                  ? "bg-emerald-100 text-emerald-800"
                                  : p.matchConfidence >= 75
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {p.matchConfidence}% Match
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">100% Exact</span>
                          )}
                        </td>

                        {/* Working Link */}
                        <td className="py-3.5 max-w-[160px]">
                          {workingUrl ? (
                            <a
                              href={workingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-600 hover:underline font-mono truncate block"
                              title={workingUrl}
                            >
                              🇮🇳 Open Product ↗
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => reverifyMarketplaceProduct(p._id)}
                            disabled={reverifyingId === p._id}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] transition disabled:opacity-50"
                          >
                            {reverifyingId === p._id ? "Verifying..." : "⚡ Reverify"}
                          </button>
                          <button
                            onClick={() => toggleProductPublish(p._id, p.published !== false && p.isActive !== false)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition border ${
                              p.published !== false && p.isActive !== false
                                ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {p.published !== false && p.isActive !== false ? "Unpublish" : "Publish"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3.4 Products & Catalog Tab */}
      {activeTab === "Products" && (
        <div className="space-y-6">
          {/* Add Product Form */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              ➕ Add New Product to Storefront
            </h3>
            <form onSubmit={createProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Product Title *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Category *</label>
                <select
                  name="category"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Brand</label>
                <input
                  name="brand"
                  placeholder="e.g. Sony, Apple"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Price (NPR) *</label>
                <input
                  name="price"
                  type="number"
                  required
                  placeholder="e.g. 45000"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Original Price (Strike)</label>
                <input
                  name="originalPrice"
                  type="number"
                  placeholder="e.g. 52000"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Stock Quantity *</label>
                <input
                  name="stock"
                  type="number"
                  required
                  defaultValue={15}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Highlight Badge</label>
                <select
                  name="badge"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="NEW">NEW</option>
                  <option value="TRENDING">TRENDING</option>
                  <option value="BEST SELLER">BEST SELLER</option>
                  <option value="SALE">SALE</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Image URL *</label>
                <input
                  name="image"
                  required
                  defaultValue="https://images.unsplash.com/photo-1545454675-3531b543be5d"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Description</label>
                <input
                  name="description"
                  placeholder="Short description..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 pt-2">
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-8 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>

          {/* Catalog Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Store Catalog ({productsList.length} Items)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock Status</th>
                    <th className="pb-3">Badge</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productsList.map((p) => (
                    <tr key={p._id || p.id || p.name} className="hover:bg-slate-50/60">
                      <td className="py-3.5 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3.5 text-slate-600">{p.category}</td>
                      <td className="py-3.5 font-extrabold text-slate-900">{formatNpr(p.price)}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${p.stock > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                          {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                        </span>
                      </td>
                      <td className="py-3.5">
                        {p.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px]">
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => deleteProduct(p._id || p.id || "", p.name)}
                          className="px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3.4 Store Orders Tab */}
      {activeTab === "Store Orders" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Manage Store Catalog Orders</h3>
            <div className="space-y-4">
              {ordersList.map((o) => (
                <div
                  key={o._id}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 font-mono">{o.orderId}</span>
                      <span className="text-slate-500 ml-2 font-semibold">• {o.fullName} ({o.phone})</span>
                    </div>
                    <span className="font-black text-sm text-slate-900">{formatNpr(o.total || 0)}</span>
                  </div>

                  <p className="text-slate-600"><strong>Shipping Address:</strong> {o.fullAddress}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3.5 Payment Verification Tab */}
      {activeTab === "Payment Verification" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900">Payment Evidence Review</h3>
          <div className="space-y-4">
            {paymentsList.length === 0 && <p className="text-xs text-slate-500">No payment screenshots submitted yet.</p>}
            {paymentsList.map((payment) => (
              <div key={payment._id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 text-xs space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-semibold">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Order Reference</span>
                    <span className="font-mono text-slate-900">{payment.orderId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Amount</span>
                    <span className="font-black text-slate-900">{formatNpr(payment.amount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Method</span>
                    <span className="text-slate-900">{payment.paymentMethod || payment.provider || "eSewa/Khalti"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                  <a
                    href={`/api/admin/payments/${payment._id}/screenshot`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    View Screenshot ↗
                  </a>
                  {payment.status === "submitted" && (
                    <>
                      <button
                        onClick={() => updatePaymentStatus(payment._id, "verified")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-500 transition"
                      >
                        Approve Payment
                      </button>
                      <button
                        onClick={() => updatePaymentStatus(payment._id, "rejected")}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-500 transition"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3.6 Coupons & Settings Tab */}
      {activeTab === "Coupons & Settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Active Coupons</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 py-2.5">
                <span className="font-mono font-black text-slate-900">WELCOME10</span>
                <span className="text-slate-600">10% Off (Min Rs. 1,500)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2.5">
                <span className="font-mono font-black text-slate-900">LINKOVA500</span>
                <span className="text-slate-600">Rs. 500 Flat Off (Min Rs. 3,500)</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="font-mono font-black text-slate-900">FESTIVE15</span>
                <span className="text-slate-600">15% Off (Min Rs. 5,000)</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">System Parameters</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <p>• <strong>India Base Conversion:</strong> 1 INR = 1.65 NPR</p>
              <p>• <strong>India Service Charge:</strong> 20% of converted amount</p>
              <p>• <strong>Nepal Flat Delivery:</strong> Rs. 200</p>
              <p>• <strong>Payment Methods:</strong> COD &amp; Full Online Payment</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. FULL ORDER DETAILS SLIDE-OVER PANEL ─── */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrderDetail(null)}>
          <div
            className="relative w-full sm:w-[640px] lg:w-[720px] h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto bg-white sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 text-white px-6 py-4 sm:rounded-t-3xl">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Admin — Order Details</span>
                <h2 className="text-base font-black mt-0.5">{selectedOrderDetail.orderId}</h2>
                <span className="text-xs text-slate-400 font-mono">{selectedOrderDetail.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                {detailLoading && <span className="text-xs text-slate-400 animate-pulse">Refreshing...</span>}
                <button onClick={() => setSelectedOrderDetail(null)} className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1">

              {/* ── ORDER INFO ── */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="Order ID" value={selectedOrderDetail.orderId} mono />
                  <InfoRow label="Invoice Number" value={selectedOrderDetail.invoiceNumber} mono />
                  <InfoRow label="Created At" value={selectedOrderDetail.createdAt ? new Date(selectedOrderDetail.createdAt).toLocaleString("en-NP", { dateStyle: "medium", timeStyle: "short" }) : "—"} />
                  <InfoRow label="Order Status" value={
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedOrderDetail.orderStatus)}`}>{selectedOrderDetail.orderStatus}</span>
                  } />
                </div>
              </section>

              {/* ── CUSTOMER ── */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="Full Name" value={selectedOrderDetail.customerName} />
                  <InfoRow label="Phone" value={selectedOrderDetail.phone} />
                  <InfoRow label="Email" value={selectedOrderDetail.email || "—"} />
                  <InfoRow label="Customer ID" value={selectedOrderDetail.customerId || "Guest"} mono />
                </div>
              </section>

              {/* ── DELIVERY ── */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Delivery Address (Order Snapshot)</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="Street / Area" value={selectedOrderDetail.deliveryAddress || "—"} />
                  <InfoRow label="City" value={selectedOrderDetail.city || "—"} />
                  <InfoRow label="District" value={selectedOrderDetail.district || "—"} />
                  <InfoRow label="Province" value={selectedOrderDetail.province || "—"} />
                  <InfoRow label="Postal Code" value={selectedOrderDetail.postalCode || "—"} />
                  {selectedOrderDetail.deliveryInstructions && (
                    <div className="col-span-2">
                      <InfoRow label="Delivery Instructions" value={selectedOrderDetail.deliveryInstructions} />
                    </div>
                  )}
                </div>
              </section>

              {/* ── PRODUCT & MARKETPLACE ── */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Product & Indian Marketplace</h3>
                <div className="flex gap-3 mb-3">
                  {selectedOrderDetail.productImage && (
                    <img
                      src={selectedOrderDetail.productImage}
                      alt={selectedOrderDetail.productName}
                      className="h-20 w-20 rounded-xl object-contain border border-slate-200 bg-slate-50 p-1 flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm leading-snug">{selectedOrderDetail.productName}</p>
                    {selectedOrderDetail.marketplace && (
                      <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        🇮🇳 {selectedOrderDetail.marketplace.replace("amazon-india","Amazon India").replace("tatacliq","Tata CLiQ").replace("boat","boAt").replace(/-/g," ").replace(/\b\w/g,(c: string)=>c.toUpperCase())}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="Quantity" value={String(selectedOrderDetail.quantity)} />
                  <InfoRow label="Variant" value={selectedOrderDetail.productVariant || "—"} />
                  <InfoRow label="Size" value={selectedOrderDetail.size || "—"} />
                  <InfoRow label="Color" value={selectedOrderDetail.color || "—"} />
                  {selectedOrderDetail.sourceProductId && (
                    <InfoRow label="Source Product ID" value={selectedOrderDetail.sourceProductId} mono />
                  )}
                </div>
                {selectedOrderDetail.productUrl && (
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Original Indian Product URL</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={selectedOrderDetail.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-[11px] text-blue-600 hover:underline font-mono truncate block"
                      >
                        {selectedOrderDetail.productUrl}
                      </a>
                      <a
                        href={selectedOrderDetail.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition"
                      >
                        🇮🇳 Open ↗
                      </a>
                    </div>
                  </div>
                )}
              </section>

              {/* ── PRICE BREAKDOWN (Admin Only) ── */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Price Breakdown (Admin Internal)</h3>
                <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Indian Product Price (INR ₹)</span>
                    <span className="font-bold text-white">₹{Number(selectedOrderDetail.indianPriceINR).toLocaleString("en-IN")} INR</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Base Conversion (× 1.65)</span>
                    <span>Rs. {Number(selectedOrderDetail.conversionAmountNPR).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Service Fee (+ 20%)</span>
                    <span>Rs. {Number(selectedOrderDetail.serviceChargeNPR).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Nepal Delivery</span>
                    <span>Rs. {Number(selectedOrderDetail.deliveryChargeNPR || 200).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700 font-black text-sm">
                    <span className="text-amber-400">Final Landed NPR</span>
                    <span className="text-red-400">Rs. {Number(selectedOrderDetail.finalAmountNPR).toLocaleString()}</span>
                  </div>
                </div>
              </section>

              {/* ── PAYMENT ── */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Payment Details</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="Payment Method" value={selectedOrderDetail.paymentMethod === "FULL_PAYMENT" ? "Full Payment (Online)" : "Cash on Delivery (COD)"} />
                  <InfoRow label="Payment Status" value={
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedOrderDetail.paymentStatus)}`}>{selectedOrderDetail.paymentStatus}</span>
                  } />
                  <InfoRow label="Transaction ID" value={selectedOrderDetail.paymentTransactionId || "—"} mono />
                  <InfoRow label="Paid Amount" value={selectedOrderDetail.paymentStatus === "PAID" ? formatNpr(selectedOrderDetail.finalAmountNPR) : "Pending"} />
                </div>
              </section>

              {/* ── ADMIN CONTROLS ── */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Admin Controls</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Update Payment Status</label>
                    <select
                      defaultValue={selectedOrderDetail.paymentStatus}
                      onChange={(e) => {
                        updateIndiaOrderStatus(selectedOrderDetail._id || selectedOrderDetail.orderId, selectedOrderDetail.orderStatus, e.target.value);
                        setSelectedOrderDetail((prev) => prev ? { ...prev, paymentStatus: e.target.value as any } : prev);
                      }}
                      className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white p-2 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="PAID">PAID</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Update Order Status</label>
                    <select
                      defaultValue={selectedOrderDetail.orderStatus}
                      onChange={(e) => {
                        updateIndiaOrderStatus(selectedOrderDetail._id || selectedOrderDetail.orderId, e.target.value, selectedOrderDetail.paymentStatus);
                        setSelectedOrderDetail((prev) => prev ? { ...prev, orderStatus: e.target.value as any } : prev);
                      }}
                      className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white p-2 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="Requested">Requested</option>
                      <option value="Verified">Verified</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Purchased">Purchased</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Arrived in Nepal">Arrived in Nepal</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            {/* Sticky footer actions */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-2 sm:rounded-b-3xl">
              <a
                href={selectedOrderDetail.productUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
              >
                🇮🇳 Open Original Product ↗
              </a>
              <a
                href={selectedOrderDetail.invoiceUrl || `/api/india-order/invoice/${selectedOrderDetail.orderId}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                🖨️ Print Invoice ↗
              </a>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
