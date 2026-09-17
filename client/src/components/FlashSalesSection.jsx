import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

export function FlashSalesSection({ products = [], onQuickView }) {
  const scrollContainerRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 56
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

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const formatDigit = (num) => String(num).padStart(2, "0");

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-black tracking-wider uppercase">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
            Flash Deals
          </div>

          <div className="flex flex-wrap items-baseline gap-4 sm:gap-8">
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
              Today's Flash Sales
            </h2>

            {/* Neo Countdown Blocks */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex flex-col items-center justify-center bg-neutral-900 text-white rounded-xl px-2.5 py-1.5 min-w-[48px] shadow-xs">
                <span className="text-lg sm:text-xl font-black leading-none">{formatDigit(timeLeft.days)}</span>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter mt-0.5">Days</span>
              </div>
              <span className="text-neutral-400 font-bold">:</span>
              <div className="flex flex-col items-center justify-center bg-neutral-900 text-white rounded-xl px-2.5 py-1.5 min-w-[48px] shadow-xs">
                <span className="text-lg sm:text-xl font-black leading-none">{formatDigit(timeLeft.hours)}</span>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter mt-0.5">Hours</span>
              </div>
              <span className="text-neutral-400 font-bold">:</span>
              <div className="flex flex-col items-center justify-center bg-neutral-900 text-white rounded-xl px-2.5 py-1.5 min-w-[48px] shadow-xs">
                <span className="text-lg sm:text-xl font-black leading-none">{formatDigit(timeLeft.minutes)}</span>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter mt-0.5">Min</span>
              </div>
              <span className="text-neutral-400 font-bold">:</span>
              <div className="flex flex-col items-center justify-center bg-red-600 text-white rounded-xl px-2.5 py-1.5 min-w-[48px] shadow-xs animate-pulse">
                <span className="text-lg sm:text-xl font-black leading-none">{formatDigit(timeLeft.seconds)}</span>
                <span className="text-[9px] font-bold text-red-200 uppercase tracking-tighter mt-0.5">Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Navigation Controls */}
        <div className="hidden sm:flex items-center gap-2 self-end">
          <button
            onClick={() => handleScroll("left")}
            aria-label="Previous Slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-900 hover:text-white dark:hover:bg-amber-400 dark:hover:text-neutral-950 transition-all duration-200 shadow-2xs"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            aria-label="Next Slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-900 hover:text-white dark:hover:bg-amber-400 dark:hover:text-neutral-950 transition-all duration-200 shadow-2xs"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x snap-mandatory"
      >
        {products.map((product) => (
          <div key={product._id || product.id || product.slug} className="w-[240px] sm:w-[270px] shrink-0 snap-start">
            <ProductCard product={product} onQuickView={onQuickView} />
          </div>
        ))}
      </div>

      {/* Centered CTA */}
      <div className="text-center pt-2">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-950 dark:bg-amber-400 px-8 py-3.5 text-xs sm:text-sm font-black text-white dark:text-neutral-950 hover:bg-red-600 dark:hover:bg-amber-300 transition-all duration-200 shadow-md hover:scale-105"
        >
          <span>View All Flash Products</span>
          <span>→</span>
        </Link>
      </div>

      <div className="border-b border-neutral-200 dark:border-[#1b2559] pt-8" />
    </section>
  );
}
