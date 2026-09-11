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
      // In case of any network issue, still allow customer to continue
      setState({
        phase: "result",
        data: {
          product: { name: "Requested Indian Marketplace Product" },
          canOrder: true,
          orderable: true
        },
        url: trimmed
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
                  Processing…
                </span>
              ) : (
                "Check / Continue →"
              )}
            </button>
          </div>

          {!compact && (
            <p className="text-center text-[11px] text-neutral-400 leading-relaxed">
              Supported:{" "}
              <span className="font-medium text-neutral-500">
                {PLATFORM_DISPLAY_NAMES.join(" • ")}
              </span>
              . Submit any Indian product link for instant manual review and Nepal delivery.
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

      {/* Result Card: Informative & Unblocked */}
      {state.phase === "result" && (
        <div className="animate-fade-in space-y-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold shadow-xs">
                  📦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-800 border border-blue-200">
                      {state.data.product?.source || "Marketplace Link"}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                      ⏳ Awaiting Admin Verification
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">
                    {state.data.product?.name || "Marketplace Product Link Captured"}
                  </h3>
                </div>
              </div>

              {state.data.product?.priceINR ? (
                <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-900 border border-slate-200 shadow-2xs">
                  ₹{state.data.product.priceINR.toLocaleString()} INR
                </span>
              ) : null}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Your link is captured. You can submit your order request now. Our operations team will verify stock, variant, and delivery before final purchasing.
            </p>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                onClick={() => handleContinueOrder(state.data, state.url)}
                className="rounded-2xl bg-black px-6 py-3 text-xs font-black text-white hover:bg-neutral-800 shadow-sm transition cursor-pointer flex items-center gap-2"
              >
                <span>Continue to Order / Request →</span>
              </button>
              <button
                onClick={handleReset}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                ← Check Another Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
