import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

export function NewArrivalBento() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Featured Drops
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
          New Arrivals & Trending Collections
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 min-h-[500px]">
        {/* Large Featured Card 1 */}
        <div className="md:col-span-2 lg:col-span-2 relative rounded-3xl overflow-hidden bg-neutral-950 text-white p-8 flex flex-col justify-end min-h-[320px] group border border-neutral-800 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab"
            alt="Flagship Tech"
            className="absolute inset-0 h-full w-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
          <div className="relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black uppercase">
              <Sparkles className="h-3 w-3" /> Flagship Tech
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Direct Indian Tech Drops
            </h3>
            <p className="text-xs text-neutral-300 max-w-md">
              Get genuine electronic accessories and audio gear from trusted Indian retail giants directly to your door in Nepal.
            </p>
            <Link
              to="/shop?category=Tech+%26+Gadgets"
              className="inline-flex items-center gap-2 rounded-full bg-white text-neutral-950 px-5 py-2.5 text-xs font-bold hover:bg-amber-300 transition-colors"
            >
              <span>Explore Tech Drops</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-6 flex flex-col justify-end min-h-[260px] group border border-neutral-800 shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3"
            alt="Streetwear & Sneakers"
            className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase">
              Streetwear
            </span>
            <h4 className="text-lg font-black text-white">Minimal Footwear</h4>
            <Link
              to="/shop?category=Fashion"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition-colors"
            >
              <span>Shop Shoes</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-6 flex flex-col justify-end min-h-[260px] group border border-neutral-800 shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
            alt="Wearables"
            className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase">
              Smart Wearables
            </span>
            <h4 className="text-lg font-black text-white">AMOLED Watches</h4>
            <Link
              to="/shop?category=Tech+%26+Gadgets"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition-colors"
            >
              <span>Browse Watches</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ExperienceBanner() {
  return (
    <section className="rounded-3xl bg-neutral-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-neutral-800">
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 text-xs font-black uppercase">
            ⚡ Zero Hassle Cross-Border
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Order Any Product Across India in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Copy any product URL from Amazon, Flipkart, Myntra, or any Indian website, paste it into SajiloMarts, pay easily in NPR via eSewa, Khalti or COD advance, and receive it at your doorstep.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <Link
            to="/order"
            className="rounded-full bg-amber-400 text-neutral-950 hover:bg-white px-8 py-4 text-xs sm:text-sm font-black shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Order by Product Link ➔
          </Link>
          <Link
            to="/how-it-works"
            className="rounded-full border border-white/20 hover:bg-white/10 text-white px-7 py-4 text-xs sm:text-sm font-bold transition-colors"
          >
            Learn How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ServicesHighlight() {
  const perks = [
    {
      icon: <Truck className="h-6 w-6 text-red-600" />,
      title: "Doorstep Nepal Delivery",
      desc: "Fast dispatch across all 7 provinces with live tracking updates."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
      title: "100% Authentic Products",
      desc: "Direct verified sourcing from certified Indian marketplace retailers."
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-amber-600" />,
      title: "Transparent NPR Pricing",
      desc: "Zero hidden customs fees or unexpected surprise charges."
    },
    {
      icon: <Headphones className="h-6 w-6 text-blue-600" />,
      title: "24/7 AI Concierge & Support",
      desc: "Live order assistance and personalized product recommendations."
    }
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-6 border-y border-neutral-200 dark:border-[#1b2559]">
      {perks.map((perk, i) => (
        <div key={i} className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#111c44] border border-neutral-200/80 dark:border-[#1b2559] shadow-2xs">
          <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0b1437] shadow-2xs shrink-0 border border-neutral-200 dark:border-[#1b2559]">
            {perk.icon}
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">{perk.title}</h4>
            <p className="text-[11px] text-neutral-500 dark:text-[#a3aed0] leading-snug">{perk.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
