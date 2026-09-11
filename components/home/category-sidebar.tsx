"use client";

import Link from "next/link";
import { categories } from "@/lib/data";

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export function CategorySidebar() {
  const getBadge = (name: string) => {
    if (name.includes("Fashion")) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">HOT</span>;
    if (name.includes("Tech")) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">NEW</span>;
    if (name.includes("Watches")) return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">SALE</span>;
    return null;
  };

  return (
    <aside className="w-full lg:w-60 flex-shrink-0 border-r border-neutral-100 pr-6 pt-1 hidden lg:block">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
          Categories
        </span>
      </div>

      <ul className="space-y-1.5 text-sm">
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group flex items-center justify-between px-3 py-2 rounded-xl text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/80 font-medium transition-all duration-200"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="truncate">{cat.name}</span>
                {getBadge(cat.name)}
              </div>
              <ChevronRight />
            </Link>
          </li>
        ))}

        <li className="pt-2">
          <Link
            href="/request-product"
            className="group flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 hover:from-amber-500/20 hover:to-red-500/20 text-neutral-900 font-bold transition-all duration-200 border border-amber-500/20"
          >
            <span className="truncate flex items-center gap-1.5">
              <span>🇮🇳</span>
              <span>India Marketplaces</span>
            </span>
            <ChevronRight />
          </Link>
        </li>
      </ul>
    </aside>
  );
}
