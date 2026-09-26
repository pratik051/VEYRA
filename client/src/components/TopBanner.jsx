import React from 'react';
import { Link } from 'react-router-dom';

export function TopBanner() {
  return (
    <div className="bg-neutral-900 text-white text-[11px] sm:text-xs py-1.5 px-4 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-neutral-200 font-medium">
            🇮🇳 Shop from India. Delivered to Nepal.
          </span>
        </div>

        <div>
          <Link
            to="/order"
            className="font-semibold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
          >
            <span>Paste Link &amp; Get Quote</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TopBanner;

