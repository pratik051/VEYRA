import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Sparkles, Building, CheckCircle2, ArrowRight } from 'lucide-react';

export function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="space-y-4 text-center">
        <span className="text-xs font-black uppercase tracking-wider text-amber-500">
          About SajiloMarts Nepal
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
          Simplifying Cross-Border Shopping Across Nepal
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          SajiloMarts is Nepal’s premier cross-border sourcing and direct e-commerce bridge, enabling shoppers to buy authentic products from India’s largest marketplaces with 100% transparent pricing and doorstep delivery.
        </p>
      </div>

      {/* Mission & Vision Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-neutral-950 text-white space-y-3 shadow-xl border border-white/10">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Our Mission</span>
          <h3 className="text-2xl font-black text-white">Zero Geographic Barriers</h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Eliminate cross-border shopping complexities by handling international payments, customs verification, and safe courier logistics so customers in Nepal can shop globally with ease.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-3 shadow-2xs">
          <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Our Promise</span>
          <h3 className="text-2xl font-black text-neutral-950 dark:text-white">100% Genuine & Transparent</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Every product is procured strictly from certified brand stores or official marketplace sellers in India, ensuring guaranteed authenticity with zero surprise fees.
          </p>
        </div>
      </div>

      {/* Core Advantages */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-neutral-950 dark:text-white">Why Choose SajiloMarts?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Verified Sourcing</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Procured from Amazon, Flipkart, Myntra & authorized brand portals.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-2">
            <Truck className="h-6 w-6 text-amber-500" />
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Doorstep Delivery</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Expedited logistics across all 7 provinces of Nepal.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Digital QR Payments</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Instant NPR payment via eSewa, Khalti, MyPay or 50% COD advance.</p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs sm:text-sm font-black hover:bg-neutral-800 dark:hover:bg-amber-300 transition shadow-md"
        >
          <span>Explore Catalog & Sourcing ➔</span>
        </Link>
      </div>
    </div>
  );
}

export default About;
