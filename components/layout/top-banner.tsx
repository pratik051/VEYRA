"use client";

import Link from "next/link";
import { useState } from "react";

export function TopBanner() {
  const [lang, setLang] = useState<"en" | "ne">("en");
  const [currency, setCurrency] = useState<"NPR" | "INR">("NPR");

  return (
    <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-white text-xs font-medium py-2 px-4 border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left Live Pulse */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">Live Sale</span>
        </div>

        {/* Center Flash Sale Announcement */}
        <div className="flex-1 text-center flex items-center justify-center gap-2 flex-wrap text-[11px] sm:text-xs">
          <span className="text-neutral-200">
            Summer Fest: Up to 50% OFF on Lifestyle Essentials + Free Doorstep Delivery!
          </span>
          <Link
            href="/shop"
            className="font-extrabold text-amber-400 hover:text-amber-300 transition underline underline-offset-4"
          >
            Shop Now →
          </Link>
        </div>

        {/* Right Language & Currency Selector */}
        <div className="flex items-center gap-3 text-[11px] text-neutral-300">
          <div className="relative inline-flex items-center gap-1">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as "en" | "ne")}
              className="bg-transparent text-neutral-200 cursor-pointer pr-3 focus:outline-none text-[11px] font-medium hover:text-white transition"
              aria-label="Language"
            >
              <option value="en" className="bg-neutral-900 text-white">English</option>
              <option value="ne" className="bg-neutral-900 text-white">नेपाली</option>
            </select>
          </div>

          <span className="text-white/20">|</span>

          <div className="relative inline-flex items-center gap-1">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "NPR" | "INR")}
              className="bg-transparent text-neutral-200 cursor-pointer focus:outline-none text-[11px] font-medium hover:text-white transition"
              aria-label="Currency"
            >
              <option value="NPR" className="bg-neutral-900 text-white">NPR (Rs.)</option>
              <option value="INR" className="bg-neutral-900 text-white">INR (₹)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
