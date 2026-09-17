import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    brand: "Apple & Next-Gen Audio",
    badge: "🔥 SUMMER PROMO",
    title: "Up to 15% Off Flagship Tech & Wearables",
    desc: "iPhone 15 series, AirPods Pro, Smart Watches & audio essentials with verified Nepal warranty.",
    buttonText: "Shop Electronics",
    buttonLink: "/shop?category=Tech+%26+Gadgets",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-neutral-950 via-purple-950/80 to-neutral-950"
  },
  {
    id: 3,
    brand: "Streetwear & Footwear",
    badge: "⚡ NEW COLLECTION",
    title: "Fresh Sneakers & Daily Street Apparel",
    desc: "Elevate your rotation with breathable performance sneakers, premium cotton drops and accessories.",
    buttonText: "Explore Fashion",
    buttonLink: "/shop?category=Fashion",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80",
    gradient: "from-neutral-950 via-rose-950/70 to-neutral-950"
  }
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = slides[current];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-neutral-950 text-white min-h-[380px] sm:min-h-[440px] lg:min-h-[460px] flex items-center shadow-xl border border-white/10">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={slide.image}
          alt={slide.title}
          className="h-full w-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-all duration-700"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`} />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-5 sm:p-10 lg:p-14 max-w-xl space-y-3.5 sm:space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-extrabold text-amber-300 border border-white/10">
            {slide.badge}
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-neutral-300">
            {slide.brand}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md">
          {slide.title}
        </h1>

        <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 max-w-md leading-relaxed">
          {slide.desc}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-4">
          <Link
            to={slide.buttonLink}
            className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-amber-400 text-neutral-950 dark:text-neutral-950 px-5 py-2.5 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-extrabold shadow-lg hover:bg-amber-300 dark:hover:bg-amber-300 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span>{slide.buttonText}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Slide Navigation Dots */}
      <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              current === idx
                ? "w-8 bg-amber-400 shadow-sm"
                : "w-2.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * IndiaSourcingHero — Static hero section shown after URL Verification.
 * This is the dedicated "Found It On Amazon or Flipkart? We Deliver." section
 * displayed as a permanent section in the main content area.
 */
export function IndiaSourcingHero() {
  return (
    <div className="relative flex-1 overflow-hidden rounded-3xl bg-neutral-950 text-white min-h-[380px] sm:min-h-[440px] lg:min-h-[460px] flex items-center shadow-xl border border-white/10">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80"
          alt="India Sourcing"
          className="h-full w-full object-cover object-center opacity-40 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-amber-950/70 to-neutral-950 opacity-90" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-10 lg:p-14 max-w-xl space-y-3.5 sm:space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-[11px] font-extrabold text-amber-300 border border-white/10">
            🇮🇳 SEAMLESS SOURCING
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-neutral-300">
            Direct Marketplace Concierge
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md">
          Found It On Amazon or Flipkart? We Deliver.
        </h2>

        <p className="text-xs sm:text-sm text-neutral-300 max-w-md leading-relaxed">
          Order direct from verified sellers in India with clear NPR pricing, transparent customs and doorstep delivery.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-4">
          <Link
            to="/request-product"
            className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-amber-400 text-neutral-950 dark:text-neutral-950 px-5 py-2.5 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-extrabold shadow-lg hover:bg-amber-300 dark:hover:bg-amber-300 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span>Request Any Product</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/request-product"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm font-bold border border-white/15 transition-all duration-200"
          >
            <span>🇮🇳 Sourcing Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HeroCarousel;
