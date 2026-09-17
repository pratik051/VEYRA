import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, PhoneCall } from 'lucide-react';

export function TopBanner() {
  return (
    <div className="bg-neutral-950 text-white text-[11px] sm:text-xs py-2 px-4 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-amber-400">
            <Sparkles className="h-3 w-3" />
            <span>DIRECT INDIA-TO-NEPAL SOURCING</span>
          </span>
          <span className="hidden md:inline text-neutral-400">|</span>
          <span className="hidden md:inline text-neutral-300">
            Order ANY product from Amazon, Flipkart, Myntra, Ajio & 10+ marketplaces!
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 text-neutral-300">
          <Link
            to="/request-product"
            className="font-bold text-amber-300 hover:text-white underline underline-offset-2 transition-colors"
          >
            Paste Link & Get Quote ➔
          </Link>
          <span className="text-neutral-500">|</span>
          <Link to="/track-order" className="hover:text-white transition-colors">
            Track Order
          </Link>
          <span className="text-neutral-500">|</span>
          <Link to="/contact" className="hover:text-white transition-colors flex items-center gap-1">
            <PhoneCall className="h-3 w-3" />
            <span>Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
