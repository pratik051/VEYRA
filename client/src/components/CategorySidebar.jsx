import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { categoriesList, supportedPlatforms } from '../data/mockData';

export function CategorySidebar() {
  return (
    <div className="w-full lg:w-64 bg-white dark:bg-[#111c44] rounded-3xl p-5 border border-neutral-200/80 dark:border-[#1b2559] shadow-xs space-y-6">
      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-[#a3aed0]">
          Top Categories
        </h3>
        <ul className="space-y-1">
          {categoriesList.map((cat) => (
            <li key={cat.id}>
              <Link
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1b254b] hover:text-neutral-950 dark:hover:text-white transition-colors group"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-amber-400 transition-colors" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-neutral-100 dark:border-[#1b2559]" />

      {/* Indian Marketplace Stores */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-[#a3aed0]">
            India Sourcing
          </h3>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
            DIRECT
          </span>
        </div>
        <ul className="space-y-1">
          {supportedPlatforms.slice(0, 6).map((plat) => (
            <li key={plat.id}>
              <Link
                to={`/shop/${plat.id}`}
                className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1b254b] hover:text-neutral-950 dark:hover:text-white transition-colors group"
              >
                <span className="truncate">{plat.name}</span>
                <span className="text-[10px] text-neutral-400 dark:text-[#a3aed0] font-medium group-hover:text-neutral-700 dark:group-hover:text-neutral-200">
                  {plat.badge}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Sourcing Banner Callout */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#1b254b] dark:to-[#111c44] p-3.5 border border-amber-200/60 dark:border-[#1b2559] text-center space-y-2">
        <p className="text-[11px] font-bold text-amber-950 dark:text-amber-300">
          Want a specific item from India?
        </p>
        <Link
          to="/request-product"
          className="inline-block w-full py-2 px-3 rounded-xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-[11px] font-black hover:bg-amber-500 hover:text-neutral-950 dark:hover:bg-amber-300 transition-colors shadow-xs"
        >
          Request Product ➔
        </Link>
      </div>
    </div>
  );
}

export function CategoryGrid() {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
            Browse By Category
          </h2>
        </div>
        <Link
          to="/shop"
          className="text-xs font-bold text-neutral-600 dark:text-[#a3aed0] hover:text-neutral-950 dark:hover:text-white underline underline-offset-4"
        >
          View All Catalog
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {categoriesList.map((cat) => (
          <Link
            key={cat.id}
            to={`/shop?category=${encodeURIComponent(cat.name)}`}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111c44] border border-neutral-200/80 dark:border-[#1b2559] hover:border-neutral-900 dark:hover:border-amber-400 hover:shadow-lg transition-all duration-200 group text-center space-y-2"
          >
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-neutral-50 dark:bg-[#0b1437] flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
              {cat.icon}
            </div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
              {cat.name}
            </h4>
            <span className="text-[10px] text-neutral-400 dark:text-[#a3aed0] font-semibold">
              {cat.count}+ Products
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
