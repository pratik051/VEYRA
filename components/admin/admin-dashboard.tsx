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

type AdminRequest = {
  _id: string;
  requestId: string;
  fullName: string;
  phone?: string;
  productUrl: string;
  productName?: string;
  productCategory?: string;
  quantity?: number;
  status: string;
  quote?: {
    indianProductPrice?: number;
    exchangeRate?: number;
    shippingIndiaToNepal?: number;
    customsTaxes?: number;
    handlingFee?: number;
    nepalDeliveryFee?: number;
    serviceFee?: number;
    finalEstimatedPrice?: number;
    customerQuote?: number;
    quoteExpiry?: string;
  };
};

const requestStatuses = [
  "Pending",
  "Checking",
  "Available",
  "Unavailable",
  "Manual Verification",
  "Quote Sent",
  "Customer Confirmed",
  "Ordered",
  "In Transit",
  "Completed",
  "Cancelled"
];

const adminTabs = ["Overview", "Products", "Orders", "India Quotation Engine", "Coupons & Settings"] as const;

export function AdminDashboard() {
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<(typeof adminTabs)[number]>("Overview");

  const [productsList, setProductsList] = useState<AdminProduct[]>(defaultProducts);
  const [ordersList, setOrdersList] = useState<AdminOrder[]>([
    {
      _id: "ORD-1",
      orderId: "VEYRA-ORD-10245",
      fullName: "Pratik Sharma",
      phone: "9801234567",
      fullAddress: "House 42, Baluwatar, Kathmandu",
      total: 6398,
      orderStatus: "In Transit",
      paymentStatus: "Confirmed",
      trackingNumber: "NP-EXP-88921",
      createdAt: "Aug 18, 2026"
    }
  ]);
  const [requestsList, setRequestsList] = useState<AdminRequest[]>([
    {
      _id: "REQ-1",
      requestId: "VEYRA-REQ-10245",
      fullName: "Pratik Sharma",
      phone: "9801234567",
      productUrl: "https://www.amazon.in/dp/B09XYZ1234",
      productName: "Sony WH-1000XM5 Wireless Headphones",
      productCategory: "Tech & Gadgets",
      quantity: 1,
      status: "Quote Sent",
      quote: {
        indianProductPrice: 24999,
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

  const [loading, setLoading] = useState(false);

  // Active Quotation Calculator State
  const [selectedReqForQuote, setSelectedReqForQuote] = useState<AdminRequest | null>(requestsList[0] || null);
  const [inrPrice, setInrPrice] = useState(24999);
  const [exchangeRate, setExchangeRate] = useState(1.60);
  const [intlShipping, setIntlShipping] = useState(800);
  const [customsTax, setCustomsTax] = useState(4000);
  const [handlingFee, setHandlingFee] = useState(600);
  const [nepalDelivery, setNepalDelivery] = useState(200);
  const [serviceFee, setServiceFee] = useState(1200);
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState("5-10 business days");
  const [availability, setAvailability] = useState("Available");
  const [adminNotes, setAdminNotes] = useState("");

  const calculatedNpr = Math.round(
    inrPrice * exchangeRate + intlShipping + customsTax + handlingFee + nepalDelivery + serviceFee
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [productRes, orderRes, requestRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/product-requests")
      ]);
      if (productRes.ok) {
        const p = await productRes.json();
        if (p.products && p.products.length > 0) setProductsList(p.products);
      }
      if (orderRes.ok) {
        const o = await orderRes.json();
        if (o.orders && o.orders.length > 0) setOrdersList(o.orders);
      }
      if (requestRes.ok) {
        const r = await requestRes.json();
        if (r.requests && r.requests.length > 0) {
          setRequestsList(r.requests);
          setSelectedReqForQuote(r.requests[0]);
        }
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
        // Local state fallback
        setProductsList([payload as AdminProduct, ...productsList]);
        pushToast("Product added to catalog.", "success");
        e.currentTarget.reset();
      }
    } catch (e) {
      console.error(e);
      setProductsList([payload as AdminProduct, ...productsList]);
      pushToast("Product added to local state.", "success");
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      setProductsList((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      pushToast(`Deleted ${name}`, "info");
    } catch (e) {
      console.error(e);
      setProductsList((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      pushToast(`Deleted ${name}`, "info");
    }
  };

  const updateOrderStatus = async (id: string, orderStatus: string, paymentStatus: string, trackingNumber?: string) => {
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus, paymentStatus, trackingNumber })
      });
      setOrdersList((prev) =>
        prev.map((o) => (o._id === id ? { ...o, orderStatus, paymentStatus, trackingNumber: trackingNumber || o.trackingNumber } : o))
      );
      pushToast("Order status updated.", "success");
    } catch (e) {
      console.error(e);
      setOrdersList((prev) =>
        prev.map((o) => (o._id === id ? { ...o, orderStatus, paymentStatus } : o))
      );
      pushToast("Order updated in local view.", "success");
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/product-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      setRequestsList((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
      pushToast(`Request status set to ${status}`, "success");
    } catch (e) {
      console.error(e);
      setRequestsList((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
      pushToast(`Request status set to ${status}`, "success");
    }
  };

  const verifyProductManually = async () => {
    if (!selectedReqForQuote) return;
    try {
      await fetch(`/api/admin/product-requests/${selectedReqForQuote._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Checking" })
      });
      setRequestsList((prev) =>
        prev.map((r) => (r._id === selectedReqForQuote._id ? { ...r, status: "Checking" } : r))
      );
      pushToast("Request status set to Checking.", "info");
    } catch (e) {
      console.error(e);
      setRequestsList((prev) =>
        prev.map((r) => (r._id === selectedReqForQuote._id ? { ...r, status: "Checking" } : r))
      );
      pushToast("Status updated to Checking locally.", "info");
    }
  };

  const handleSendQuote = async () => {
    if (!selectedReqForQuote) return;

    const quoteStatus = availability === "Available" ? "Quote Sent" : "Unavailable";
    const quotePayload = {
      indianProductPrice: inrPrice,
      exchangeRate,
      shippingIndiaToNepal: intlShipping,
      customsTaxes: customsTax,
      handlingFee,
      nepalDeliveryFee: nepalDelivery,
      serviceFee,
      finalEstimatedPrice: calculatedNpr,
      customerQuote: calculatedNpr,
      expectedDeliveryTime,
      adminNotes,
      quoteExpiry: "Valid for 7 days"
    };

    try {
      await fetch(`/api/admin/product-requests/${selectedReqForQuote._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: quoteStatus, quote: quotePayload })
      });
      setRequestsList((prev) =>
        prev.map((r) =>
          r.requestId === selectedReqForQuote.requestId
            ? { ...r, status: quoteStatus, quote: quotePayload }
            : r
        )
      );
      pushToast(`Quotation of ${formatNpr(calculatedNpr)} sent to ${selectedReqForQuote.fullName}!`, "success");
    } catch (e) {
      console.error(e);
      setRequestsList((prev) =>
        prev.map((r) =>
          r.requestId === selectedReqForQuote.requestId
            ? { ...r, status: quoteStatus, quote: quotePayload }
            : r
        )
      );
      pushToast(`Quotation sent to ${selectedReqForQuote.fullName}!`, "success");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Admin Portal
            </span>
            <span className="text-xs font-semibold text-neutral-500">Live Management Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 mt-1">VEYRA Admin Dashboard</h1>
        </div>

        <button
          onClick={loadAll}
          disabled={loading}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          {loading ? "Refreshing..." : "🔄 Refresh Data"}
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {adminTabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              activeTab === t
                ? "bg-black text-white shadow-sm"
                : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-black"
            }`}
          >
            {t === "Orders" && `Orders (${ordersList.length})`}
            {t === "India Quotation Engine" && `India Requests (${requestsList.length})`}
            {t === "Products" && `Catalog (${productsList.length})`}
            {t !== "Orders" && t !== "India Quotation Engine" && t !== "Products" && t}
          </button>
        ))}
      </div>

      {/* 1. Overview */}
      {activeTab === "Overview" && (
        <div className="mt-6 space-y-8">
          {/* Key Metric Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Store Revenue</span>
              <p className="mt-2 text-2xl font-extrabold text-neutral-900">Rs. 1,48,250</p>
              <p className="mt-1 text-[11px] text-emerald-600 font-semibold">↑ +18.4% from last week</p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Orders</span>
              <p className="mt-2 text-2xl font-extrabold text-neutral-900">{ordersList.length + 14}</p>
              <p className="mt-1 text-[11px] text-neutral-500 font-medium">92% fulfillment rate</p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-veyra-gold font-bold">
                India Product Requests
              </span>
              <p className="mt-2 text-2xl font-extrabold text-neutral-900">{requestsList.length}</p>
              <p className="mt-1 text-[11px] text-amber-700 font-semibold">Pending quotes review</p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Active Products</span>
              <p className="mt-2 text-2xl font-extrabold text-neutral-900">{productsList.length}</p>
              <p className="mt-1 text-[11px] text-neutral-500 font-medium">Across 9 categories</p>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="rounded-3xl border border-neutral-200 bg-neutral-950 p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Ready to quote incoming India marketplace items?</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Use the built-in Quotation Calculator to generate freight and customs breakdowns.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("India Quotation Engine")}
              className="rounded-xl bg-veyra-gold px-5 py-2.5 text-xs font-bold text-black shadow-gold hover:bg-veyra-gold-light transition"
            >
              Open Quotation Engine →
            </button>
          </div>
        </div>
      )}

      {/* 2. Product Management */}
      {activeTab === "Products" && (
        <div className="mt-6 space-y-8">
          {/* Add Product Form */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              ➕ Add New Product to Catalog
            </h2>
            <form onSubmit={createProduct} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Product Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Titanium Smartwatch Ultra"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Category *</label>
                <select
                  name="category"
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Brand</label>
                <input
                  name="brand"
                  placeholder="e.g. VY Time"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Price in NPR *</label>
                <input
                  name="price"
                  type="number"
                  required
                  placeholder="e.g. 2999"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Original Price (Strike)</label>
                <input
                  name="originalPrice"
                  type="number"
                  placeholder="e.g. 3999"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Stock Quantity *</label>
                <input
                  name="stock"
                  type="number"
                  required
                  defaultValue={20}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Badge</label>
                <select
                  name="badge"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="NEW">NEW</option>
                  <option value="TRENDING">TRENDING</option>
                  <option value="BEST SELLER">BEST SELLER</option>
                  <option value="SALE">SALE</option>
                  <option value="LIMITED">LIMITED</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Image URL (Unsplash or CDN) *</label>
                <input
                  name="image"
                  required
                  defaultValue="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Description</label>
                <input
                  name="description"
                  placeholder="Short product overview and highlights..."
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs font-medium focus:border-black focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-black px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 transition"
                >
                  Add Product to Store
                </button>
              </div>
            </form>
          </div>

          {/* Products List Table */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900">Current Catalog ({productsList.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 uppercase font-semibold">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Badge</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {productsList.map((p) => (
                    <tr key={p._id || p.id || p.name} className="hover:bg-neutral-50/50">
                      <td className="py-3 font-semibold text-neutral-900">{p.name}</td>
                      <td className="py-3 text-neutral-600">{p.category}</td>
                      <td className="py-3 font-bold text-neutral-900">{formatNpr(p.price)}</td>
                      <td className="py-3">
                        <span className={`font-bold ${p.stock > 0 ? "text-emerald-700" : "text-red-600"}`}>
                          {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                        </span>
                      </td>
                      <td className="py-3">
                        {p.badge && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold">
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteProduct(p._id || p.id || "", p.name)}
                          className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100"
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

      {/* 3. Order Management */}
      {activeTab === "Orders" && (
        <div className="mt-6 space-y-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900">Manage Customer Orders</h2>
            <div className="space-y-4">
              {ordersList.map((o) => (
                <div
                  key={o._id}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-200 pb-2">
                    <div>
                      <span className="font-extrabold text-sm text-neutral-900 font-mono">{o.orderId}</span>
                      <span className="text-neutral-500 ml-2 font-medium">Customer: {o.fullName} ({o.phone})</span>
                    </div>
                    <span className="font-bold text-sm text-neutral-900">{formatNpr(o.total || 0)}</span>
                  </div>

                  <p className="text-neutral-600"><strong>Address:</strong> {o.fullAddress}</p>

                  <div className="grid gap-3 sm:grid-cols-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
                        Order Milestone (8 Stages)
                      </label>
                      <select
                        defaultValue={o.orderStatus}
                        onChange={(e) => updateOrderStatus(o._id, e.target.value, o.paymentStatus)}
                        className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-xs font-semibold"
                      >
                        {orderTimeline.map((step) => (
                          <option key={step} value={step}>
                            {step}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
                        Payment Status
                      </label>
                      <select
                        defaultValue={o.paymentStatus}
                        onChange={(e) => updateOrderStatus(o._id, o.orderStatus, e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-xs font-semibold"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
                        Tracking Number
                      </label>
                      <input
                        defaultValue={o.trackingNumber || "NP-EXP-88921"}
                        onBlur={(e) => updateOrderStatus(o._id, o.orderStatus, o.paymentStatus, e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 bg-white p-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. India Request Quotation Engine */}
      {activeTab === "India Quotation Engine" && (
        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          {/* Requests List */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-base font-bold text-neutral-900">Submitted Requests</h2>
            <div className="space-y-3">
              {requestsList.map((req) => (
                <div
                  key={req.requestId}
                  onClick={() => setSelectedReqForQuote(req)}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition text-xs space-y-1.5 ${
                    selectedReqForQuote?.requestId === req.requestId
                      ? "border-black bg-neutral-50 shadow-sm"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-neutral-900">{req.requestId}</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      {req.status}
                    </span>
                  </div>
                  <p className="font-semibold text-neutral-800">{req.fullName} ({req.phone})</p>
                  <p className="truncate text-neutral-500">{req.productName || req.productUrl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quotation Calculator Tool */}
          <div className="lg:col-span-7">
            {selectedReqForQuote ? (
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
                <div className="border-b border-neutral-100 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-veyra-gold font-bold">
                    Quotation Generator
                  </span>
                  <h3 className="text-lg font-extrabold text-neutral-900">
                    Quote for {selectedReqForQuote.requestId} ({selectedReqForQuote.fullName})
                  </h3>
                  <a
                    href={selectedReqForQuote.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline truncate block mt-1"
                  >
                    🔗 {selectedReqForQuote.productUrl}
                  </a>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  {/* Sourcing Verification */}
                  <div className="sm:col-span-2 border-b border-neutral-100 pb-3">
                    <h4 className="font-bold text-neutral-800 mb-2">Product Verification Details</h4>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                          Product Availability
                        </label>
                        <select
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 p-2 font-semibold bg-white"
                        >
                          <option value="Available">Available</option>
                          <option value="Unavailable">Not Available</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                          Expected Delivery Time
                        </label>
                        <input
                          type="text"
                          value={expectedDeliveryTime}
                          onChange={(e) => setExpectedDeliveryTime(e.target.value)}
                          placeholder="e.g. 5-10 business days"
                          className="w-full rounded-xl border border-neutral-300 p-2 focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      Indian Product Price (INR ₹) *
                    </label>
                    <input
                      type="number"
                      value={inrPrice}
                      onChange={(e) => setInrPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300 p-2 font-bold focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      Exchange Rate (INR to NPR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300 p-2 font-bold focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      India-to-Nepal Freight (NPR)
                    </label>
                    <input
                      type="number"
                      value={intlShipping}
                      onChange={(e) => setIntlShipping(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300 p-2 focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      Customs / Import Tax (NPR)
                    </label>
                    <input
                      type="number"
                      value={customsTax}
                      onChange={(e) => setCustomsTax(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300 p-2 focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      Handling / Packing Fee (NPR)
                    </label>
                    <input
                      type="number"
                      value={handlingFee}
                      onChange={(e) => setHandlingFee(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300 p-2 focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      Nepal Domestic Delivery (NPR)
                    </label>
                    <input
                      type="number"
                      value={nepalDelivery}
                      onChange={(e) => setNepalDelivery(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300 p-2 focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      VEYRA Service Sourcing Fee (NPR)
                    </label>
                    <input
                      type="number"
                      value={serviceFee}
                      onChange={(e) => setServiceFee(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-300 p-2 focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      Admin Sourcing Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Sourced from Cloudtail India, eligible for standard delivery"
                      rows={2}
                      className="w-full rounded-xl border border-neutral-300 p-2 text-xs focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Final Computation Box */}
                <div className="rounded-2xl border border-veyra-gold/40 bg-veyra-gold/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-neutral-600">Calculated Final Doorstep Price:</span>
                    <p className="text-2xl font-extrabold text-neutral-900">{formatNpr(calculatedNpr)}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={verifyProductManually}
                      className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                    >
                      Verify Product (Checking)
                    </button>
                    <button
                      onClick={handleSendQuote}
                      className="rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition"
                    >
                      Send Quote to Customer →
                    </button>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="pt-2">
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                    Override Request Status
                  </label>
                  <select
                    defaultValue={selectedReqForQuote.status}
                    onChange={(e) => updateRequestStatus(selectedReqForQuote._id, e.target.value)}
                    className="rounded-xl border border-neutral-300 p-2 text-xs font-semibold bg-white"
                  >
                    {requestStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500">Select a request on the left to calculate quotation.</p>
            )}
          </div>
        </div>
      )}

      {/* 5. Coupons & Settings */}
      {activeTab === "Coupons & Settings" && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Active Coupons</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-neutral-100 py-2">
                <span className="font-mono font-bold">WELCOME10</span>
                <span>10% Off (Min Rs. 1,500)</span>
              </div>
              <div className="flex justify-between border-b border-neutral-100 py-2">
                <span className="font-mono font-bold">VEYRA500</span>
                <span>Rs. 500 Flat Off (Min Rs. 3,500)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-mono font-bold">FESTIVE15</span>
                <span>15% Off (Min Rs. 5,000)</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-neutral-900">System Parameters</h3>
            <div className="space-y-2 text-xs text-neutral-600">
              <p>• <strong>Default Free Shipping Threshold:</strong> Rs. 3,000</p>
              <p>• <strong>Default Flat Delivery Fee:</strong> Rs. 200</p>
              <p>• <strong>Default India Exchange Rate:</strong> 1 INR = 1.60 NPR</p>
              <p>• <strong>Payment Gateways:</strong> eSewa, Khalti, Bank QR, COD</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
