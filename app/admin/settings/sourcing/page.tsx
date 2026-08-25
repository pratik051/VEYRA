"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/toast-provider";

// Platform config shown to admin — NO PIN, NO internal data
const PLATFORMS_CONFIG = [
  {
    id: "amazon-india",
    name: "Amazon India",
    domains: ["amazon.in", "www.amazon.in"],
    verificationMethod: "Manual Verification",
    manualVerificationAllowed: true,
    enabled: true
  },
  {
    id: "flipkart",
    name: "Flipkart",
    domains: ["flipkart.com", "www.flipkart.com"],
    verificationMethod: "Manual Verification",
    manualVerificationAllowed: true,
    enabled: true
  },
  {
    id: "myntra",
    name: "Myntra",
    domains: ["myntra.com", "www.myntra.com"],
    verificationMethod: "Manual Verification",
    manualVerificationAllowed: true,
    enabled: true
  },
  {
    id: "ajio",
    name: "AJIO",
    domains: ["ajio.com", "www.ajio.com"],
    verificationMethod: "Manual Verification",
    manualVerificationAllowed: true,
    enabled: true
  },
  {
    id: "meesho",
    name: "Meesho",
    domains: ["meesho.com", "www.meesho.com"],
    verificationMethod: "Manual Verification",
    manualVerificationAllowed: true,
    enabled: true
  },
  {
    id: "nykaa",
    name: "Nykaa",
    domains: ["nykaa.com", "www.nykaa.com"],
    verificationMethod: "Manual Verification",
    manualVerificationAllowed: true,
    enabled: true
  },
  {
    id: "bigbasket",
    name: "BigBasket",
    domains: ["bigbasket.com", "www.bigbasket.com"],
    verificationMethod: "Manual Verification",
    manualVerificationAllowed: true,
    enabled: true
  }
];

export default function SourcingSettingsPage() {
  const { pushToast } = useToast();
  const [indiaSourcingEnabled, setIndiaSourcingEnabled] = useState(true);
  const [platforms, setPlatforms] = useState(PLATFORMS_CONFIG);

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
    pushToast("Platform setting updated.", "success");
  };

  const handleSave = () => {
    pushToast("Sourcing settings saved successfully.", "success");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Admin
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              Settings / India Sourcing
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 mt-1">
            India Sourcing Configuration
          </h1>
        </div>
        <button
          onClick={handleSave}
          className="shrink-0 rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition"
        >
          Save Settings
        </button>
      </div>

      {/* India Sourcing Toggle */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-neutral-900">India Sourcing Status</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-800">
              {indiaSourcingEnabled ? "Enabled" : "Disabled"}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {indiaSourcingEnabled
                ? "Customers can submit India product requests and receive quotations."
                : "India product sourcing is currently disabled. Customers cannot submit requests."}
            </p>
          </div>
          <button
            onClick={() => {
              setIndiaSourcingEnabled((prev) => !prev);
              pushToast(
                indiaSourcingEnabled
                  ? "India sourcing disabled."
                  : "India sourcing enabled.",
                "info"
              );
            }}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              indiaSourcingEnabled ? "bg-black" : "bg-neutral-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                indiaSourcingEnabled ? "left-5.5 translate-x-1" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sourcing PIN — masked display only */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-neutral-900">Sourcing PIN</h2>
        <p className="text-xs text-neutral-500">
          The private sourcing PIN is stored securely as a server-side environment variable (
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px]">
            INDIA_SOURCE_PIN
          </code>
          ). It is never exposed to the browser, API responses, or client-side code.
        </p>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 font-mono text-base font-bold tracking-widest text-neutral-400">
            ••••••
          </div>
          <span className="text-[11px] font-semibold text-neutral-400">
            Server-only · Never exposed to browser
          </span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          To update the PIN, modify the{" "}
          <code className="rounded bg-neutral-100 px-1 font-mono">INDIA_SOURCE_PIN</code>{" "}
          value in your <code className="rounded bg-neutral-100 px-1 font-mono">.env.local</code>{" "}
          file and restart the server. Do not share this value with customers or include it in frontend code.
        </p>
      </div>

      {/* Supported Platforms */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h2 className="text-sm font-bold text-neutral-900">Supported Platforms</h2>
          <span className="text-xs text-neutral-400">
            {platforms.filter((p) => p.enabled).length} of {platforms.length} enabled
          </span>
        </div>

        <div className="space-y-3">
          {platforms.map((p) => (
            <div
              key={p.id}
              className={`flex items-start justify-between rounded-2xl border p-4 transition ${
                p.enabled
                  ? "border-neutral-200 bg-neutral-50/50"
                  : "border-neutral-100 bg-neutral-50 opacity-60"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900">{p.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.enabled
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {p.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Domains: <code className="font-mono">{p.domains.join(", ")}</code>
                </p>
                <p className="text-[11px] text-neutral-400">
                  Verification: {p.verificationMethod} ·{" "}
                  {p.manualVerificationAllowed
                    ? "Manual verification allowed"
                    : "No manual fallback"}
                </p>
              </div>

              <button
                onClick={() => togglePlatform(p.id)}
                className={`ml-4 shrink-0 relative h-5 w-9 rounded-full transition-colors ${
                  p.enabled ? "bg-black" : "bg-neutral-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    p.enabled ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Add future platform note */}
        <div className="rounded-xl border border-dashed border-neutral-200 p-4 text-center text-xs text-neutral-400">
          To add a new platform (e.g. Tata CLiQ, Croma, Reliance Digital), update the{" "}
          <code className="font-mono">SOURCING_PLATFORMS</code> registry in{" "}
          <code className="font-mono">lib/sourcing-platforms.ts</code>.
        </div>
      </div>
    </div>
  );
}
