import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Clock, CheckCircle } from 'lucide-react';

export function PolicyTemplate({ title, lastUpdated = "September 2026", children }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
        <Link to="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-white font-bold">{title}</span>
      </div>

      {/* Header */}
      <div className="space-y-3 border-b border-neutral-100 dark:border-[#1b2559] pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-[#1b254b] text-neutral-800 dark:text-neutral-200 text-[11px] font-extrabold uppercase">
          <Shield className="h-3.5 w-3.5 text-neutral-950 dark:text-amber-400" />
          <span>Official SajiloMarts Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight">
          {title}
        </h1>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Clock className="h-3.5 w-3.5" />
          <span>Last Updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Policy Content */}
      <div className="prose prose-neutral max-w-none text-xs sm:text-sm leading-relaxed space-y-6 text-neutral-700 dark:text-neutral-300">
        {children}
      </div>

      {/* Footer Support Banner */}
      <div className="rounded-3xl bg-neutral-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 border border-white/10">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-base font-bold text-white">Have questions about this policy?</h4>
          <p className="text-xs text-neutral-300">
            Our support team and AI concierge are available 24/7 to clarify any terms.
          </p>
        </div>
        <Link
          to="/contact"
          className="rounded-full bg-amber-400 text-neutral-950 hover:bg-amber-300 px-6 py-2.5 text-xs font-bold transition shadow-xs shrink-0"
        >
          Contact Support ➔
        </Link>
      </div>
    </div>
  );
}
