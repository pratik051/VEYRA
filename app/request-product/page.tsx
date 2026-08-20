"use client";

import { FormEvent, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";

const categories = ["Fashion", "Footwear", "Watches", "Bags", "Accessories", "Beauty & Lifestyle", "Mobile Accessories", "Tech & Gadgets", "Everyday Essentials"];

export default function RequestProductPage() {
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fullName = String(form.get("fullName") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const productUrl = String(form.get("productUrl") || "").trim();
    if (!fullName || !phone || !productUrl) {
      setError("Please fill in Full Name, Phone Number and Product URL.");
      pushToast("Please fill required request details.", "error");
      return;
    }
    setLoading(true);
    setError("");
    const payload = {
      fullName,
      phone,
      email: String(form.get("email") || ""),
      deliveryLocation: String(form.get("location") || ""),
      productUrl,
      productName: String(form.get("productName") || ""),
      productCategory: String(form.get("productCategory") || ""),
      preferredSize: String(form.get("size") || ""),
      preferredColor: String(form.get("color") || ""),
      quantity: Number(form.get("quantity") || 1),
      additionalNotes: String(form.get("notes") || ""),
      maximumBudget: String(form.get("budget") || ""),
      preferredDeliveryTime: String(form.get("deliveryTime") || "")
    };
    const response = await fetch("/api/request-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Request failed.");
      pushToast(data.error || "Request submission failed.", "error");
      setLoading(false);
      return;
    }
    setRequestId(data.requestId);
    pushToast("Product request submitted successfully.", "success");
    e.currentTarget.reset();
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold">Request From India</h1>
      <p className="mt-2 text-sm text-neutral-600">Found something you like in India? Send us the product link and we&apos;ll check availability and provide you with an estimated price.</p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-lg font-medium">Customer Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="fullName" placeholder="Full Name" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input name="phone" placeholder="Phone Number" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input name="email" placeholder="Email" type="email" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input name="location" placeholder="Delivery Location" className="rounded-lg border border-neutral-300 px-3 py-2" />
        </div>
        <h2 className="text-lg font-medium">Product Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="productUrl" placeholder="Product URL" className="rounded-lg border border-neutral-300 px-3 py-2 sm:col-span-2" />
          <input name="productName" placeholder="Product Name" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <select name="productCategory" className="rounded-lg border border-neutral-300 px-3 py-2">
            <option value="">Product Category</option>
            {categories.map((cat) => <option key={cat}>{cat}</option>)}
          </select>
          <input name="size" placeholder="Preferred Size" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input name="color" placeholder="Preferred Color" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input name="quantity" type="number" min={1} defaultValue={1} placeholder="Quantity" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input name="budget" placeholder="Maximum Budget (Optional)" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input name="deliveryTime" placeholder="Preferred Delivery Time (Optional)" className="rounded-lg border border-neutral-300 px-3 py-2" />
          <input name="screenshot" type="file" className="rounded-lg border border-neutral-300 px-3 py-2 sm:col-span-2" />
          <textarea name="notes" placeholder="Additional Notes" className="min-h-28 rounded-lg border border-neutral-300 px-3 py-2 sm:col-span-2" />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Submitting..." : "Submit Request"}</button>
      </form>
      {requestId ? (
        <div className="mt-6 rounded-2xl border border-veyra-gold/40 bg-veyra-gold/10 p-5">
          <p className="font-medium">Your request has been received. VEYRA will review the product and contact you with availability and estimated pricing.</p>
          <p className="mt-2 text-sm">Request ID: <strong>{requestId}</strong></p>
        </div>
      ) : null}
    </div>
  );
}
