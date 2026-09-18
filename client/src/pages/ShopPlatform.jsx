import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMarketplaceMeta } from '../constants/marketplaces';
import { MarketplaceLogo } from '../components/MarketplaceLogos';
import { ArrowLeft, Sparkles, ExternalLink, Link2, ArrowRight, Shield, Truck, Calculator } from 'lucide-react';

export function ShopPlatform() {
  const { platform, source } = useParams();
  const slugOrId = platform || source || 'amazon';
  const meta = getMarketplaceMeta(slugOrId);
  const [productUrl, setProductUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const navigate = useNavigate();

  if (!meta) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Marketplace Not Found</h2>
        <Link to="/shop" className="text-xs font-bold text-amber-600 hover:text-amber-700 underline">
          View Supported Marketplaces
        </Link>
      </div>
    );
  }

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    setUrlError('');

    if (!productUrl.trim()) {
      setUrlError(`Please paste a product link from ${meta.name} to calculate your quote.`);
      return;
    }

    try {
      new URL(productUrl.trim());
      navigate(`/request-product?url=${encodeURIComponent(productUrl.trim())}&source=${encodeURIComponent(meta.shortName)}`);
    } catch {
      setUrlError('Please enter a valid URL starting with http:// or https://');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
        <Link to="/" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-neutral-900 transition-colors">
          Supported Stores
        </Link>
        <span>/</span>
        <span className="text-neutral-900 font-semibold">{meta.name}</span>
      </div>

      {/* Platform Banner */}
      <div className="rounded-2xl bg-neutral-900 p-6 sm:p-10 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-neutral-800">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{meta.emoji}</span>
            <span className="text-xs font-bold tracking-wider uppercase text-amber-400">
              Verified India Sourcing Partner
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Order from {meta.name} to Nepal
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {meta.tagline}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {meta.popularCategories?.map((cat) => (
              <span key={cat} className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-neutral-200">
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <a
            href={`https://${meta.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white px-5 py-3 text-xs font-semibold transition flex items-center justify-center gap-2 text-center"
          >
            <span>Visit {meta.domain}</span>
            <ExternalLink className="h-3.5 w-3.5 text-neutral-300" />
          </a>
        </div>
      </div>

      {/* URL Sourcing Box for this Store */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] space-y-4">
        <div className="space-y-1">
          <label htmlFor="store-url-input" className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Paste Any {meta.name} Product Link
          </label>
          <p className="text-xs text-neutral-500">
            Find the product you want on {meta.domain}, copy the link from your browser or app, and paste it below.
          </p>
        </div>

        <form onSubmit={handleQuoteSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Link2 className="h-4 w-4" />
              </div>
              <input
                id="store-url-input"
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder={`https://${meta.domain}/...`}
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition shadow-xs"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold px-7 py-3.5 text-sm transition shrink-0 cursor-pointer shadow-xs"
            >
              <span>Calculate NPR Rate</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {urlError && <p className="text-xs text-red-600 font-medium">{urlError}</p>}
        </form>
      </div>

      {/* Sourcing Process for this store */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
            <Shield className="h-4 w-4" />
            <span>100% Genuine {meta.shortName} Stock</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            We purchase directly from verified Indian sellers, brand flagships, and prime fulfillment hubs.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
            <Calculator className="h-4 w-4" />
            <span>Transparent Landed NPR Rate</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            All customs clearance, cross-border freight, and handling are included in your quote.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
            <Truck className="h-4 w-4" />
            <span>Doorstep Nepal Delivery</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Delivered across Kathmandu Valley and all Nepal provinces within 5 to 9 business days.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShopPlatform;
