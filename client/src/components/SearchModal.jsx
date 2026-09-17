import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { sampleProducts } from '../data/mockData';
import { MARKETPLACE_METAS } from '../constants/marketplaces';

export function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return sampleProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#111c44] shadow-2xl overflow-hidden border border-neutral-200 dark:border-[#1b2559]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 sm:px-5 py-3.5 sm:py-4 border-b border-neutral-100 dark:border-[#1b2559] gap-3">
          <Search className="h-5 w-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands (boAt, Apple, Noise), or categories..."
            className="w-full text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-[#a3aed0] focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-bold text-neutral-500 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#0b1437]"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim() === '' ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-[11px] font-bold text-neutral-400 dark:text-[#a3aed0] uppercase tracking-wider mb-2">
                  Popular Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["Wireless Earbuds", "Smart Watch", "Sneakers", "Charger 65W", "Cargo Pants", "Amazon India"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-[#1b254b] text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-900 hover:text-white dark:hover:bg-amber-400 dark:hover:text-neutral-950 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-neutral-400 dark:text-[#a3aed0] uppercase tracking-wider mb-2">
                  Indian Marketplace Portals
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MARKETPLACE_METAS.slice(0, 6).map((m) => (
                    <Link
                      key={m.id}
                      to={`/shop/${m.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 dark:border-[#1b2559] bg-neutral-50 dark:bg-[#0b1437] hover:bg-white dark:hover:bg-[#1b254b] hover:shadow-2xs text-xs font-bold text-neutral-800 dark:text-neutral-200 transition"
                    >
                      <span>{m.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 dark:text-[#a3aed0] uppercase tracking-wider">
                {filteredProducts.length} Matching Products
              </span>
              <div className="divide-y divide-neutral-100 dark:divide-[#1b2559]">
                {filteredProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug || p.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3.5 py-3 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-[#1b254b] transition-colors group"
                  >
                    <img
                      src={p.image || (p.images && p.images[0])}
                      alt={p.name}
                      className="h-12 w-12 rounded-xl object-cover bg-neutral-100 dark:bg-[#0b1437] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                        {p.name}
                      </h5>
                      <span className="text-[11px] text-neutral-400 dark:text-[#a3aed0]">
                        {p.brand} • {p.category}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-neutral-950 dark:text-amber-400 block">
                        NPR {(p.price || 0).toLocaleString()}
                      </span>
                      {p.originalPrice && (
                        <span className="text-[10px] text-neutral-400 line-through">
                          NPR {p.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                No catalog items found for "{query}"
              </p>
              <p className="text-xs text-neutral-500 dark:text-[#a3aed0] max-w-sm mx-auto">
                Found this item on Amazon or Flipkart? Paste its URL into our Request Product tool!
              </p>
              <Link
                to="/request-product"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-bold hover:bg-red-600 transition-colors"
              >
                <span>Request Indian Product ➔</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
