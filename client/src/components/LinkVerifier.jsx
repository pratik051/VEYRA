import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { MARKETPLACE_METAS } from '../constants/marketplaces';

export function LinkVerifier() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter or paste a valid product link');
      return;
    }

    try {
      const parsed = new URL(url.trim());
      const hostname = parsed.hostname.toLowerCase();

      const matched = MARKETPLACE_METAS.find((m) => hostname.includes(m.domain.toLowerCase()) || hostname.includes(m.shortName.toLowerCase()));

      // Navigate to order with the prefilled URL
      navigate(`/order?url=${encodeURIComponent(url.trim())}`);
    } catch (err) {
      setError('Please enter a valid URL starting with http:// or https://');
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white p-6 sm:p-8 border border-white/10 shadow-xl space-y-4">
      <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
        <Sparkles className="h-4 w-4" />
        <span>Instant Indian URL Verification & Quote</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-black text-white">
          Have an Amazon, Flipkart, or Myntra link?
        </h3>
        <p className="text-xs text-neutral-300">
          Paste the product URL below to check authenticity, calculate exact NPR pricing, and place your order.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Link2 className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.amazon.in/dp/... or flipkart.com/..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder:text-neutral-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 text-neutral-950 px-6 py-3 text-xs font-black hover:bg-white transition-colors shrink-0 shadow-md active:scale-95"
          >
            <span>Verify & Calculate</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{error}</span>
          </div>
        )}
      </form>

      <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-neutral-400">
        <span className="font-semibold text-neutral-300">Supported:</span>
        {MARKETPLACE_METAS.slice(0, 7).map((m) => (
          <span key={m.id} className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>{m.shortName}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
