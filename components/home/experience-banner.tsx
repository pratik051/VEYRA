"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function ExperienceBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 23,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigit = (num: number) => String(num).padStart(2, "0");

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-neutral-950 via-slate-900 to-neutral-900 text-white p-6 sm:p-12 lg:p-16 my-8 shadow-xl border border-white/10">
      {/* Neo Ambient Multi-color Glow */}
      <div className="pointer-events-none absolute right-10 top-10 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-10 bottom-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-[100px]" />

      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 relative z-10">
        {/* Left Copy */}
        <div className="lg:col-span-7 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black tracking-wider uppercase border border-emerald-500/30">
            ⚡ LIMITED EXPERIENCE DROP
          </span>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Enhance Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              Lifestyle &amp; Audio
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-md leading-relaxed">
            Flagship ANC acoustics, wearable smart tech and cross-border India marketplace ordering directly delivered anywhere in Nepal.
          </p>

          {/* 4 Neo Circular Countdown Discs */}
          <div className="flex items-center gap-2.5 sm:gap-4 pt-2">
            <div className="flex h-16 w-16 sm:h-18 sm:w-18 flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/15 shadow-sm">
              <span className="text-lg sm:text-xl font-black leading-none">{formatDigit(timeLeft.days)}</span>
              <span className="text-[10px] font-bold text-neutral-300 mt-1 uppercase">Days</span>
            </div>

            <div className="flex h-16 w-16 sm:h-18 sm:w-18 flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/15 shadow-sm">
              <span className="text-lg sm:text-xl font-black leading-none">{formatDigit(timeLeft.hours)}</span>
              <span className="text-[10px] font-bold text-neutral-300 mt-1 uppercase">Hours</span>
            </div>

            <div className="flex h-16 w-16 sm:h-18 sm:w-18 flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/15 shadow-sm">
              <span className="text-lg sm:text-xl font-black leading-none">{formatDigit(timeLeft.minutes)}</span>
              <span className="text-[10px] font-bold text-neutral-300 mt-1 uppercase">Min</span>
            </div>

            <div className="flex h-16 w-16 sm:h-18 sm:w-18 flex-col items-center justify-center rounded-2xl bg-emerald-500 text-neutral-950 font-black shadow-md">
              <span className="text-lg sm:text-xl font-black leading-none">{formatDigit(timeLeft.seconds)}</span>
              <span className="text-[10px] font-bold text-emerald-950 mt-1 uppercase">Sec</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/shop?category=Tech+%26+Gadgets"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 text-neutral-950 px-8 py-4 text-sm font-black hover:bg-emerald-300 transition-all shadow-lg hover:shadow-emerald-500/25 hover:scale-105 active:scale-95"
            >
              <span>Explore Collection</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Right Product Showcase */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
            <Image
              src="https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80"
              alt="Premium Audio Experience"
              fill
              className="object-contain drop-shadow-[0_20px_50px_rgba(16,185,129,0.35)] hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
