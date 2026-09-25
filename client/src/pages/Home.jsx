import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, ArrowRight } from 'lucide-react';

export function Home() {
  const [productUrl, setProductUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const navigate = useNavigate();

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
    <div className="space-y-12 pb-12">
      {/* ── 1. HERO & URL QUOTE SECTION ── */}
      <section className="pt-2 sm:pt-6">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
            Shop from India. We Deliver to Nepal.
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Find products on Amazon, Flipkart, Myntra, AJIO, Meesho, Nykaa, Tata CLiQ and more. Paste the product link and get your landed NPR quote instantly.
          </p>
        </div>

        {/* URL Input Card with Enhanced Drop Shadow */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] space-y-4 transition-all hover:shadow-[0_16px_48px_-5px_rgba(0,0,0,0.16)]">
          <div className="space-y-1">
            <label htmlFor="hero-url-input" className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Paste your Indian product link
            </label>
          </div>

          <form onSubmit={handleQuoteSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Link2 className="h-4 w-4" />
                </div>
                <input
                  id="hero-url-input"
                  type="text"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://www.amazon.in/dp/... or flipkart.com/..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-300 ring-1 ring-neutral-200/70 text-neutral-900 placeholder:text-neutral-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition shadow-xs"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold px-7 py-3.5 text-sm transition-all shadow-[0_4px_16px_0_rgba(245,158,11,0.42)] hover:shadow-[0_6px_22px_rgba(245,158,11,0.52)] shrink-0 active:scale-[0.99] cursor-pointer"
              >
                <span>Verify &amp; Get Quote</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {urlError && (
              <p className="text-xs text-red-600 font-medium">{urlError}</p>
            )}
          </form>

          <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
            <span className="font-medium text-neutral-700">Amazon India • Flipkart • Myntra • AJIO • Meesho • Nykaa • Tata CLiQ • boAt</span>
            <span className="text-neutral-400">100% transparent NPR landed cost breakdown.</span>
          </div>
        </div>

        {/* Price Transparency Note */}
        <div className="max-w-3xl mx-auto mt-4 bg-amber-50/90 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 shadow-[0_4px_18px_rgba(245,158,11,0.14)]">
          <p className="font-bold text-amber-900 mb-0.5">
            Know your cost before you order.
          </p>
          <p className="text-amber-800 leading-relaxed">
            Your quote includes the original Indian store price converted from INR to NPR, service fee, customs clearance, and doorstep Nepal delivery.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;
