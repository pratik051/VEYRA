import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, PhoneCall } from 'lucide-react';

export function TopBanner() {
  return (
    <div className="bg-neutral-950 dark:bg-[#070c27] text-white text-[11px] sm:text-xs py-2 px-3 sm:px-4 border-b border-white/10 dark:border-[#1b2559] transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-amber-400">
            <Sparkles className="h-3 w-3 shrink-0" />
            <span>DIRECT INDIA SOURCING</span>
          </span>
          <span className="hidden md:inline text-neutral-500">|</span>
          <span className="hidden md:inline text-neutral-300">
            Amazon India, Flipkart, Myntra, Ajio &amp; 10+ stores delivered to Nepal!
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-neutral-300 text-[10px] sm:text-xs">
          <Link
            to="/request-product"
            className="font-bold text-amber-300 hover:text-white underline underline-offset-2 transition-colors whitespace-nowrap"
          >
            Paste Link &amp; Quote ➔
          </Link>
          <span className="text-neutral-600">|</span>
          <Link to="/track-order" className="hover:text-white transition-colors whitespace-nowrap">
            Track Order
          </Link>
          <span className="text-neutral-600">|</span>
          <Link to="/support" className="hover:text-white transition-colors flex items-center gap-1 whitespace-nowrap">
            <PhoneCall className="h-3 w-3" />
            <span>Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TopBanner;
