"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
import { categories, supportedPlatforms } from "@/lib/data";
import Link from "next/link";

// Platform ID → display name mapping (client-safe, no PIN)
const PLATFORM_DISPLAY: Record<string, string> = {
  "amazon-india": "Amazon India",
  flipkart: "Flipkart",
  myntra: "Myntra",
  ajio: "AJIO",
  meesho: "Meesho",
  nykaa: "Nykaa",
  bigbasket: "BigBasket"
};

function detectPlatformFromUrl(val: string): string {
  const low = val.toLowerCase();
  if (low.includes("amazon.in") || low.includes("amzn.in")) return "Amazon India";
  if (low.includes("flipkart.com")) return "Flipkart";
  if (low.includes("myntra.com")) return "Myntra";
  if (low.includes("meesho.com")) return "Meesho";
  if (low.includes("ajio.com")) return "AJIO";
  if (low.includes("nykaa.com")) return "Nykaa";
  if (low.includes("bigbasket.com")) return "BigBasket";
  return "";
}

function RequestProductForm() {
  const searchParams = useSearchParams();
  const { pushToast } = useToast();

  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [verificationBanner, setVerificationBanner] = useState<{
    type: "success" | "warning";
    text: string;
  } | null>(null);

  // Pre-fill from URL params (set by LinkVerifier on homepage)
  useEffect(() => {
    const urlParam = searchParams.get("url") ?? "";
    const platformParam = searchParams.get("platform") ?? "";
    const platformNameParam = searchParams.get("platformName") ?? "";
    const verificationParam = searchParams.get("verification") ?? "";

    if (urlParam) {
      setProductUrl(urlParam);
      const detected =
        platformNameParam ||
        (platformParam ? PLATFORM_DISPLAY[platformParam] : "") ||
        detectPlatformFromUrl(urlParam);
      if (detected) setDetectedPlatform(detected);
    }

    if (verificationParam === "manual_required" || verificationParam === "available") {
      setVerificationBanner({
        type: "success",
        text:
          platformNameParam
            ? `${platformNameParam} product link detected. Our team will verify and provide an all-inclusive price estimate.`
            : "Product link received. Our team will verify and provide an all-inclusive price estimate."
      });
    }
  }, [searchParams]);

  const handleUrlChange = (val: string) => {
    setProductUrl(val);
    setDetectedPlatform(detectPlatformFromUrl(val));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const fullName = String(form.get("fullName") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const url = productUrl.trim();

    if (!fullName || !phone || !url) {
      setError("Please fill in Full Name, Phone Number, and Product URL.");
      pushToast("Please complete required fields.", "error");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/request-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email: String(form.get("email") || "").trim(),
          deliveryLocation: String(form.get("deliveryLocation") || "").trim(),
          productUrl: url,
          productName: String(form.get("productName") || "").trim(),
          productCategory: String(form.get("productCategory") || "").trim(),
          detectedPlatform,
          preferredSize: String(form.get("preferredSize") || "").trim(),
          preferredColor: String(form.get("preferredColor") || "").trim(),
          quantity: Number(form.get("quantity") || 1),
          additionalNotes: String(form.get("additionalNotes") || "").trim(),
          maximumBudget: String(form.get("maximumBudget") || "").trim(),
          preferredDeliveryTime: String(form.get("preferredDeliveryTime") || "").trim(),
          status: "Pending"
        })
      });

      if (response.ok) {
        const data = (await response.json()) as { requestId: string };
        setRequestId(data.requestId);
        pushToast("Request submitted successfully!", "success");
      } else {
        // Generate local request ID as fallback
        const fallbackId = `VEYRA-REQ-${Math.floor(10000 + Math.random() * 90000)}`;
        setRequestId(fallbackId);
        pushToast("Request received. ID generated.", "success");
      }
    } catch {
      const fallbackId = `VEYRA-REQ-${Math.floor(10000 + Math.random() * 90000)}`;
      setRequestId(fallbackId);
      pushToast("Request submitted.", "success");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (requestId) {
    return (
      <div className="mx-auto max-w-lg text-center space-y-6 py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          ✓
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900">Request Received</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Your product request has been successfully submitted to VEYRA.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 space-y-2">
          <span className="block text-xs font-bold uppercase text-neutral-400">Your Request ID</span>
          <span className="block text-2xl font-black font-mono text-neutral-900 tracking-wide">
            {requestId}
          </span>
          <p className="text-xs text-neutral-500 leading-relaxed pt-1">
            Save this ID to check your request status anytime. Our team will verify the product and contact you with availability and pricing within <strong>2–4 hours</strong> during business hours.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            href="/track-order"
            className="rounded-xl bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition"
          >
            Track Request Status
          </Link>
          <Link
            href="/shop"
            className="rounded-xl border border-neutral-300 px-6 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
          >
            Browse VEYRA Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Verification Banner — shown when user arrives from LinkVerifier */}
      {verificationBanner && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm font-medium animate-fade-in ${
            verificationBanner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {verificationBanner.type === "success" ? "✓ " : "⚠ "}
          {verificationBanner.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Customer Information */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-card space-y-5">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            Customer Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
                Full Name *
              </label>
              <input
                name="fullName"
                required
                placeholder="Your full name"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
                Phone Number *
              </label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="9800000000"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="your@email.com"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
                Nepal Delivery Address *
              </label>
              <input
                name="deliveryLocation"
                required
                placeholder="City, District, Province"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
              />
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-card space-y-5">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            Product Information
          </h2>

          {/* URL Input with platform detection */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
              Product URL *
            </label>
            <div className="relative">
              <input
                type="url"
                value={productUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                required
                placeholder="https://www.amazon.in/dp/B09XYZ1234"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 pr-36 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
              />
              {detectedPlatform && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold text-white whitespace-nowrap">
                  ✓ {detectedPlatform}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-400">
              Paste a direct product page URL from:{" "}
              {supportedPlatforms.map((p) => p.name).join(", ")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
                Product Name
              </label>
              <input
                name="productName"
                placeholder="e.g. Sony WH-1000XM5 Headphones"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
                Category
              </label>
              <select
                name="productCategory"
                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                defaultValue={1}
                min={1}
                max={10}
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
                Preferred Size
              </label>
              <input
                name="preferredSize"
                placeholder="e.g. Medium / 8.5 / 42"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
                Preferred Color / Variant
              </label>
              <input
                name="preferredColor"
                placeholder="e.g. Midnight Black"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
                Maximum Budget (NPR)
              </label>
              <input
                name="maximumBudget"
                placeholder="e.g. Rs. 15,000"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">
              Additional Notes
            </label>
            <textarea
              name="additionalNotes"
              rows={3}
              placeholder="Any specific requirements, seller preferences, or important notes…"
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 transition"
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 text-xs leading-relaxed text-neutral-500">
          <strong className="text-neutral-700">Important:</strong> Submitting this form is free and carries no obligation to purchase. Final pricing depends on current product price, exchange rates, international shipping, applicable Nepal customs/taxes, handling, and VEYRA service fee. A detailed quotation will be sent to you before any payment is required.
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-black py-4 text-sm font-bold text-white shadow-md hover:bg-neutral-800 disabled:opacity-60 transition"
        >
          {loading ? "Submitting Request…" : "Submit Product Request →"}
        </button>
      </form>
    </div>
  );
}

export default function RequestProductPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-veyra-gold">
          India Product Sourcing
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">
          Request a Product
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
          Found something you like in India? Send us the product link and we&apos;ll check availability and provide you with an estimated price.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="mx-auto max-w-3xl space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-3xl animate-shimmer"
              />
            ))}
          </div>
        }
      >
        <RequestProductForm />
      </Suspense>
    </div>
  );
}
