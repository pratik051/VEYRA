"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { VerifyProductResponse } from "@/app/api/verify-product-link/route";

const PLATFORM_DISPLAY_NAMES = [
  "Amazon India",
  "Flipkart",
  "Myntra",
  "AJIO",
  "Meesho",
  "Nykaa",
  "BigBasket"
];

type VerifyState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "result"; data: VerifyProductResponse; url: string }
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
      const res = await fetch("/api/verify-product-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed })
      });
      const data = (await res.json()) as VerifyProductResponse;
      setState({ phase: "result", data, url: trimmed });
    } catch {
      setState({
        phase: "error",
        message: "Network error. Please check your connection and try again."
      });
    }
  };

  const handleContinueOrder = (result: VerifyProductResponse, productUrl: string) => {
    const params = new URLSearchParams({
      url: productUrl,
      ...(result.platform ? { platform: result.platform } : {}),
      ...(result.platformDisplayName
        ? { platformName: result.platformDisplayName }
        : {}),
      verification: result.status
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
              placeholder="Paste product link from Amazon India, Flipkart, Myntra, AJIO…"
              className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition"
              required
              autoFocus={!compact}
            />
            <button
              type="submit"
              disabled={state.phase === "loading" || !url.trim()}
              className="shrink-0 rounded-2xl bg-black px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50 transition"
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
              . Product availability and final pricing are subject to
              verification.
            </p>
          )}
        </form>
      )}

      {/* Network error */}
      {state.phase === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 animate-fade-in">
          <p className="text-sm font-semibold text-red-700">{state.message}</p>
          <button
            onClick={handleReset}
            className="mt-3 text-xs font-semibold text-red-600 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Result states */}
      {state.phase === "result" && (
        <div className="animate-fade-in space-y-3">
          {/* Result A — manual_required / available */}
          {(state.data.status === "manual_required" ||
            state.data.status === "available") && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    Product Can Be Processed
                  </h3>
                  {state.data.platformDisplayName && (
                    <span className="inline-block mt-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      Detected: {state.data.platformDisplayName}
                    </span>
                  )}
                  <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                    {state.data.message}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleContinueOrder(state.data, state.url)}
                  className="rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
                >
                  Continue Order →
                </button>
                <a
                  href={state.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition"
                >
                  View Product ↗
                </a>
                <button
                  onClick={handleReset}
                  className="ml-auto text-xs text-neutral-400 hover:text-neutral-600"
                >
                  Check another
                </button>
              </div>
            </div>
          )}

          {/* Result B — unavailable */}
          {state.data.status === "unavailable" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold">
                  ✕
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-900">
                    Currently Not Available
                  </h3>
                  <p className="mt-1.5 text-xs text-red-800 leading-relaxed">
                    This product cannot currently be processed through our
                    available sourcing route.
                  </p>
                </div>
              </div>
              {state.data.canRequestManual && (
                <button
                  onClick={() => handleContinueOrder(state.data, state.url)}
                  className="rounded-xl border border-red-300 bg-white px-5 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50 transition"
                >
                  Request Manual Verification
                </button>
              )}
              <button
                onClick={handleReset}
                className="ml-2 text-xs text-neutral-400 hover:text-neutral-600"
              >
                Try another link
              </button>
            </div>
          )}

          {/* Result C — unsupported / invalid / blocked */}
          {(state.data.status === "unsupported_platform" ||
            state.data.status === "invalid_url" ||
            state.data.status === "blocked") && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                  !
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    {state.data.status === "unsupported_platform"
                      ? "Platform Not Supported"
                      : "Invalid Product Link"}
                  </h3>
                  <p className="mt-1.5 text-xs text-amber-800 leading-relaxed">
                    {state.data.message}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {state.data.canRequestManual && (
                  <button
                    onClick={() => handleContinueOrder(state.data, state.url)}
                    className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                  >
                    Send Verification Request
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition"
                >
                  Try Another Link
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
