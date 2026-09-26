import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMarketplaceMeta } from '../constants/marketplaces';
import { MarketplaceLogo } from '../components/MarketplaceLogos';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { sampleProducts } from '../data/mockData';
import { ArrowLeft, Sparkles, ExternalLink } from 'lucide-react';

export function ShopPlatform() {
  const { platform, source } = useParams();
  const slugOrId = platform || source || 'amazon';
  const meta = getMarketplaceMeta(slugOrId);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const platformProducts = useMemo(() => {
    if (!meta) return sampleProducts.slice(0, 4);
    const key = meta.id.toLowerCase();
    const short = meta.shortName.toLowerCase();

    const filtered = sampleProducts.filter(
      (p) =>
        (p.source && (p.source.toLowerCase().includes(short) || p.source.toLowerCase() === key)) ||
        (p.brand && p.brand.toLowerCase() === short) ||
        (meta.slug === 'amazon' && (p.brand === 'boAt' || p.category === 'Tech & Gadgets'))
    );

    return filtered.length > 0 ? filtered : sampleProducts.slice(0, 6);
  }, [meta]);

  if (!meta) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-black text-neutral-950 dark:text-white">Marketplace Not Found</h2>
        <Link to="/order" className="text-xs font-bold text-amber-500 hover:text-amber-400 underline">
          Go to Product Order Page
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
        <Link to="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <Link to="/order" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
          Order
        </Link>
        <span>/</span>
        <span className="text-neutral-900 dark:text-white font-bold">{meta.name}</span>
      </div>

      {/* Platform Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-6 sm:p-10 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-neutral-800">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-3.5 py-1.5 shadow-sm">
              <MarketplaceLogo marketplace={meta.id} className="h-6 w-auto" />
            </div>
            <span className="text-xs font-black tracking-widest uppercase text-amber-400">
              Verified India Partner
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">{meta.name} Nepal Store</h1>
          <p className="text-xs sm:text-sm text-neutral-300">{meta.tagline}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            {meta.popularCategories?.map((cat) => (
              <span key={cat} className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-neutral-200">
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <Link
            to={`/order?source=${meta.slug}`}
            className="rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 px-6 py-3 text-xs font-black transition text-center shadow-md active:scale-95"
          >
            Paste {meta.shortName} URL ➔
          </Link>
          <a
            href={`https://${meta.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 py-3 text-xs font-bold transition flex items-center justify-center gap-2 text-center"
          >
            <span>Visit {meta.domain}</span>
            <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
          </a>
        </div>
      </div>

      {/* Sourced Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
            Available {meta.name} Sourced Products
          </h3>
          <span className="text-xs font-semibold text-neutral-400">
            {platformProducts.length} items cataloged
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {platformProducts.map((product) => (
            <ProductCard
              key={product.id || product.slug}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default ShopPlatform;
