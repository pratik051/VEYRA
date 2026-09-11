"use client";

import Link from "next/link";
import { useState } from "react";

const categoryIcons = [
  {
    id: "phones",
    name: "Phones & Mobile",
    query: "Mobile Accessories",
    color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200/60",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
        <rect width="14" height="20" x="5" y="2" rx="3" ry="3" />
        <path d="M12 18h.01" />
      </svg>
    )
  },
  {
    id: "computers",
    name: "Computers & Tech",
    query: "Tech & Gadgets",
    color: "from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200/60",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    )
  },
  {
    id: "smartwatch",
    name: "SmartWatches",
    query: "Watches",
    color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200/60",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
        <path d="M12 6h.01M12 18h.01" />
        <rect width="14" height="14" x="5" y="5" rx="3" />
        <path d="M9 5V2h6v3M9 19v3h6v-3" />
      </svg>
    )
  },
  {
    id: "headphones",
    name: "HeadPhones & Audio",
    query: "Tech & Gadgets",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200/60",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
        <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
      </svg>
    )
  },
  {
    id: "fashion",
    name: "Fashion Apparel",
    query: "Fashion",
    color: "from-rose-500/10 to-red-500/10 text-rose-600 border-rose-200/60",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>
    )
  },
  {
    id: "footwear",
    name: "Footwear & Shoes",
    query: "Footwear",
    color: "from-cyan-500/10 to-blue-500/10 text-cyan-600 border-cyan-200/60",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
        <path d="M4 16v-3a4 4 0 0 1 4-4h4l4 4v3H4z" />
        <path d="M4 16h16a2 2 0 0 1 2 2v1H2v-1a2 2 0 0 1 2-2z" />
      </svg>
    )
  }
];

export function CategoryGrid() {
  const [selected, setSelected] = useState<string>("smartwatch");

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-black tracking-wider uppercase">
          Explore by Department
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
          Browse Categories
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {categoryIcons.map((cat) => {
          const isSelected = selected === cat.id;
          return (
            <Link
              key={cat.id}
              href={`/shop?category=${encodeURIComponent(cat.query)}`}
              onClick={() => setSelected(cat.id)}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 group ${
                isSelected
                  ? "bg-neutral-950 text-white border-neutral-950 shadow-md scale-105"
                  : "bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200/80 hover:border-neutral-300 hover:shadow-sm"
              }`}
            >
              <div
                className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${
                  isSelected ? "bg-white/20 text-white" : cat.color
                } transition-transform duration-300 group-hover:scale-110`}
              >
                {cat.icon}
              </div>
              <span className="text-xs sm:text-sm font-bold text-center truncate w-full">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="border-b border-neutral-100 pt-8" />
    </section>
  );
}
