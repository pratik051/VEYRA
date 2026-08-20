"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";

type AdminProduct = { _id: string; name: string; category: string; price: number; stock: number };
type AdminOrder = { _id: string; orderId: string; fullName: string; orderStatus: string; paymentStatus: string };
type AdminRequest = { _id: string; requestId: string; fullName: string; status: string };

const statuses = ["Pending", "Reviewing", "Quote Sent", "Customer Confirmed", "Ordered", "In Transit", "Completed", "Cancelled"];

export function AdminDashboard() {
  const { pushToast } = useToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [productRes, orderRes, requestRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/orders"),
      fetch("/api/admin/product-requests")
    ]);
    if (!productRes.ok || !orderRes.ok || !requestRes.ok) {
      pushToast("Failed to load admin data.", "error");
      setLoading(false);
      return;
    }
    const p = await productRes.json();
    const o = await orderRes.json();
    const r = await requestRes.json();
    setProducts(p.products || []);
    setOrders(o.orders || []);
    setRequests(r.requests || []);
    setLoading(false);
  }, [pushToast]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const createProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      category: String(form.get("category") || ""),
      brand: String(form.get("brand") || ""),
      price: Number(form.get("price") || 0),
      originalPrice: Number(form.get("originalPrice") || 0),
      stock: Number(form.get("stock") || 0),
      image: String(form.get("image") || ""),
      description: String(form.get("description") || "")
    };
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      pushToast(data.error || "Unable to create product.", "error");
      return;
    }
    pushToast("Product created.", "success");
    e.currentTarget.reset();
    await loadAll();
  };

  const deleteProduct = async (id: string) => {
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!response.ok) {
      pushToast("Unable to delete product.", "error");
      return;
    }
    pushToast("Product deleted.", "success");
    await loadAll();
  };

  const updateOrder = async (id: string, orderStatus: string, paymentStatus: string) => {
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus, paymentStatus })
    });
    if (!response.ok) {
      pushToast("Unable to update order.", "error");
      return;
    }
    pushToast("Order updated.", "success");
    await loadAll();
  };

  const updateRequestStatus = async (id: string, status: string) => {
    const response = await fetch(`/api/admin/product-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      pushToast("Unable to update request.", "error");
      return;
    }
    pushToast("Request status updated.", "success");
    await loadAll();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-neutral-600">Manage products, orders, product requests and quotation workflow.</p>

      <section className="mt-6 rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-xl font-semibold">Add Product</h2>
        <form onSubmit={createProduct} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Product Name" className="rounded-lg border border-neutral-300 px-3 py-2" required />
          <input name="category" placeholder="Category" className="rounded-lg border border-neutral-300 px-3 py-2" required />
          <input name="brand" placeholder="Brand" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input name="image" placeholder="Primary Image URL" className="rounded-lg border border-neutral-300 px-3 py-2" required />
          <input name="price" type="number" placeholder="Price" className="rounded-lg border border-neutral-300 px-3 py-2" required />
          <input name="originalPrice" type="number" placeholder="Original Price" className="rounded-lg border border-neutral-300 px-3 py-2" required />
          <input name="stock" type="number" placeholder="Stock" className="rounded-lg border border-neutral-300 px-3 py-2" required />
          <textarea name="description" placeholder="Description" className="min-h-20 rounded-lg border border-neutral-300 px-3 py-2 sm:col-span-2" />
          <button className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white sm:col-span-2">Create Product</button>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-xl font-semibold">Products</h2>
        {loading ? <div className="mt-4 h-24 animate-pulse rounded-xl bg-neutral-100" /> : null}
        <div className="mt-4 space-y-2">
          {products.map((p) => (
            <div key={p._id} className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 text-sm">
              <p>{p.name} · {p.category} · Rs. {p.price} · Stock {p.stock}</p>
              <button onClick={() => deleteProduct(p._id)} className="rounded-lg border border-red-200 px-3 py-1 text-red-600">Delete</button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="mt-4 space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="rounded-xl border border-neutral-200 p-3 text-sm">
              <p className="font-medium">{o.orderId} · {o.fullName}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <select defaultValue={o.orderStatus} className="rounded-lg border border-neutral-300 px-2 py-2" onChange={(e) => updateOrder(o._id, e.target.value, o.paymentStatus)}>
                  {["Order Placed", "Payment Confirmed", "Product Processing", "Product Sourced", "In Transit", "Arrived in Nepal", "Out for Delivery", "Delivered"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <select defaultValue={o.paymentStatus} className="rounded-lg border border-neutral-300 px-2 py-2" onChange={(e) => updateOrder(o._id, o.orderStatus, e.target.value)}>
                  {["Pending", "Confirmed", "Failed"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-xl font-semibold">Product Requests</h2>
        <div className="mt-4 space-y-3">
          {requests.map((r) => (
            <div key={r._id} className="rounded-xl border border-neutral-200 p-3 text-sm">
              <p className="font-medium">{r.requestId} · {r.fullName}</p>
              <select defaultValue={r.status} className="mt-2 rounded-lg border border-neutral-300 px-2 py-2" onChange={(e) => updateRequestStatus(r._id, e.target.value)}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
