"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const PLATFORM_DISPLAY_NAMES = [
  "Amazon India",
  "Flipkart",
  "Myntra",
  "AJIO",
  "Meesho",
  "Nykaa",
  "Tata CLiQ",
  "Croma",
  "boAt"
];

type VerifyState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "result"; data: any; url: string }
  | { phase: "error"; message: string };

export function LinkVerifier({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [state, setState] = useState<VerifyState>({ phase: "idle" });

  const handleVerify = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setState({ phase: "loading" });

    try {
      const res = await fetch("/api/products/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed })
      });
      const data = await res.json();
      setState({ phase: "result", data, url: trimmed });
    } catch {
      setState({
        phase: "error",
        message: "Network error. Please check your connection and try again."
      });
    }
  };

  const handleContinueOrder = (result: any, productUrl: string) => {
    const params = new URLSearchParams({
      url: productUrl,
      ...(result.product?.source ? { platform: result.product.source } : {}),
      ...(result.product?.name ? { name: encodeURIComponent(result.product.name) } : {}),
      ...(result.product?.priceINR ? { inr: String(result.product.priceINR) } : {}),
      ...(result.product?.sourceProductId ? { sid: result.product.sourceProductId } : {})
    });
    router.push(`/request-product?${params.toString()}`);
  };

  const handleRequestProduct = (result: any, productUrl: string) => {
    const params = new URLSearchParams({
      url: productUrl,
      requestMode: "alternative",
      ...(result.product?.name ? { name: encodeURIComponent(result.product.name) } : {}),
      ...(result.product?.priceINR ? { inr: String(result.product.priceINR) } : {})
    });
    router.push(`/request-product?${params.toString()}`);
  };

  const handleReset = () => {
    setState({ phase: "idle" });
    setUrl("");
  };

  return (
    <div className={compact ? "" : "mx-auto w-full max-w-2xl"}>
      {/* Input form */}
      {(state.phase === "idle" || state.phase === "loading") && (
        <form onSubmit={handleVerify} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste Indian product link from Amazon India, Flipkart, Myntra, boAt…"
              className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition"
              required
              autoFocus={!compact}
            />
            <button
              type="submit"
              disabled={state.phase === "loading" || !url.trim()}
              className="shrink-0 rounded-2xl bg-black px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50 transition cursor-pointer"
            >
              {state.phase === "loading" ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Checking…
                </span>
              ) : (
                "Check Product"
              )}
            </button>
          </div>

          {!compact && (
            <p className="text-center text-[11px] text-neutral-400 leading-relaxed">
              Supported:{" "}
              <span className="font-medium text-neutral-500">
                {PLATFORM_DISPLAY_NAMES.join(" • ")}
              </span>
              . Product availability and live pricing are verified in real-time.
            </p>
          )}
        </form>
      )}

      {/* Network error */}
      {state.phase === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 animate-fade-in space-y-2">
          <p className="text-sm font-semibold text-red-700">{state.message}</p>
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-red-600 underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {/* Result states */}
      {state.phase === "result" && (
        <div className="animate-fade-in space-y-3">
          {/* STATE 1 — Verified & Orderable */}
          {state.data.orderable && state.data.inStock && state.data.deliveryAvailable ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950">
                      Product Verified &amp; Orderable
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5 font-medium line-clamp-1">
                      {state.data.product?.name || "Verified Indian Marketplace Product"}
                    </p>
                  </div>
                </div>

                {state.data.product?.priceINR ? (
                  <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-black text-emerald-900 border border-emerald-200 shadow-2xs">
                    ₹{state.data.product.priceINR.toLocaleString()} INR
                  </span>
                ) : null}
              </div>

              {/* Status Badges Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 border border-emerald-200/80">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span className="font-semibold text-neutral-800">Product Verified</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 border border-emerald-200/80">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span className="font-semibold text-neutral-800">In Stock</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 border border-emerald-200/80">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span className="font-semibold text-neutral-800">Delivery Available</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => handleContinueOrder(state.data, state.url)}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white hover:bg-red-700 shadow-sm transition cursor-pointer"
                >
                  ⚡ Order Now (Doorstep Nepal Delivery) →
                </button>
                <a
                  href={state.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
                >
                  View Source ↗
                </a>
                <button
                  onClick={handleReset}
                  className="ml-auto text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  Check another link
                </button>
              </div>
            </div>
          ) : state.data.stockStatus === "OUT_OF_STOCK" ? (
            /* STATE 2 — Confirmed Out of Stock */
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold shadow-xs">
                  ✕
                </div>
                <div>
                  <h3 className="text-sm font-black text-red-950">
                    Product Confirmed Out of Stock
                  </h3>
                  <p className="mt-1 text-xs text-red-800 leading-relaxed font-medium">
                    {state.data.message || "This product or selected variant is confirmed out of stock on the marketplace."}
                  </p>
                </div>
              </div>

              {/* Status Badges Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-red-200">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span className="font-semibold text-neutral-800">Product Verified</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-red-200">
                  <span className="text-red-600 font-bold">❌</span>
                  <span className="font-semibold text-neutral-800">Out of Stock</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleRequestProduct(state.data, state.url)}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-black shadow-sm transition cursor-pointer"
                >
                  📋 Request Product (Get Alternative Link) →
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Check Another Link
                </button>
              </div>
            </div>
          ) : state.data.productFound ? (
            /* STATE 3 — Product Found but Availability Cannot Be Confirmed */
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold shadow-xs">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-950">
                    Product Found — Availability Could Not Be Confirmed
                  </h3>
                  <p className="mt-1 text-xs text-amber-800 leading-relaxed font-medium">
                    {state.data.message || "We found the product, but live stock or delivery confirmation is temporarily unconfirmed. You can request this item and our team will verify it for you."}
                  </p>
                </div>
              </div>

              {/* Status Badges Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-amber-200">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span className="font-semibold text-neutral-800">Product Found</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-amber-200">
                  <span className="text-amber-600 font-bold">⚠️</span>
                  <span className="font-semibold text-neutral-800">Stock Unconfirmed</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 border border-amber-200">
                  <span className="text-amber-600 font-bold">⚠️</span>
                  <span className="font-semibold text-neutral-800">Delivery Unconfirmed</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleRequestProduct(state.data, state.url)}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-black shadow-sm transition cursor-pointer"
                >
                  📋 Request Product (Get Alternative Link) →
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                >
                  Check Another Link
                </button>
              </div>
            </div>
          ) : (
            /* STATE 4 — Invalid Product / URL */
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-600 text-white text-xs font-bold shadow-xs">
                  ✕
                </div>
                <div>
                  <h3 className="text-sm font-black text-neutral-950">
                    ✕ Product Could Not Be Verified
                  </h3>
                  <p className="mt-1 text-xs text-neutral-600 leading-relaxed font-medium">
                    {state.data.message || "We could not verify this product link. Please make sure the link is from a supported Indian marketplace and points directly to an active product page."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={handleReset}
                  className="rounded-xl bg-neutral-950 text-white px-5 py-2.5 text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
                >
                  Check Another Link
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
