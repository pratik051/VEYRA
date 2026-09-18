import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Link2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Truck,
  Sparkles,
  Calculator,
  Search
} from 'lucide-react';
import { MARKETPLACE_METAS } from '../constants/marketplaces';

export function Shop() {
  const [filterQuery, setFilterQuery] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const navigate = useNavigate();

  const filteredMarketplaces = MARKETPLACE_METAS.filter((m) =>
    m.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.tagline.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.domain.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    setUrlError('');

    if (!productUrl.trim()) {
      setUrlError('Please paste an Indian product link to calculate your quote.');
      return;
    }

    try {
      new URL(productUrl.trim());
      navigate(`/request-product?url=${encodeURIComponent(productUrl.trim())}`);
    } catch {
      setUrlError('Please enter a valid URL starting with http:// or https://');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Top Banner / Hero */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-neutral-200/90 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] space-y-6">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Order Any Indian Product by Link</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Supported Indian Marketplaces & Stores
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            SajiloMarts procures and delivers items from all major Indian e-commerce platforms. Copy any product link, paste it below, and we will handle purchasing in India, customs processing, and local doorstep delivery in Nepal.
          </p>
        </div>

        {/* Quick URL Paste Box */}
        <form onSubmit={handleQuoteSubmit} className="space-y-2 max-w-2xl">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Link2 className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="Paste product link (Amazon, Flipkart, Myntra, etc.)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold px-6 py-3 text-xs sm:text-sm transition shrink-0 cursor-pointer shadow-xs"
            >
              <span>Get Rate & Order</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {urlError && <p className="text-xs text-red-600 font-medium">{urlError}</p>}
        </form>
      </div>

      {/* Store Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Browse Supported Stores ({filteredMarketplaces.length})
          </h2>
          <p className="text-xs text-neutral-500">
            Click any store to get started or browse their website directly.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search stores..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Marketplaces Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMarketplaces.map((market) => (
          <div
            key={market.id}
            className="bg-white rounded-2xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_14px_35px_rgba(0,0,0,0.13)] transition-all p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{market.emoji}</span>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">
                      {market.name}
                    </h3>
                    <span className="text-xs text-neutral-400 font-mono">
                      {market.domain}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${market.badgeBg}`}>
                  Verified
                </span>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {market.tagline}
              </p>

              {market.popularCategories && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {market.popularCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 text-[10px] font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
              <a
                href={`https://${market.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 transition"
              >
                <span>Browse {market.shortName}</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <Link
                to={`/request-product?source=${encodeURIComponent(market.shortName)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-500 px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
              >
                <span>Paste Link & Order</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Sourcing Guarantee Footer Box */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Have a product link from a store not listed here?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            We can source from virtually any verified Indian website. Simply paste the URL and our team will verify the listing and calculate your landed quote.
          </p>
        </div>
        <Link
          to="/request-product"
          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition shrink-0 shadow-md"
        >
          <span>Request Custom Link Quote</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default Shop;
