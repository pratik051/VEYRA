import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Home() {
  const [productUrl, setProductUrl] = useState('');
  const navigate = useNavigate();

  const handleVerifyLink = (e) => {
    e.preventDefault();
    if (!productUrl.trim()) return;
    navigate(`/request-product?url=${encodeURIComponent(productUrl.trim())}`);
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-neutral-800 p-8 md:p-14 shadow-2xl">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <span>🇮🇳 Direct Sourcing from India to Nepal 🇳🇵</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
            Order Any Product from <span className="bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">Amazon, Flipkart & Myntra</span>
          </h1>
          <p className="text-base text-neutral-300 leading-relaxed">
            Paste any Indian marketplace product link. Get instant landing price in NPR with 100% genuine product verification & doorstep delivery across Nepal.
          </p>

          <form onSubmit={handleVerifyLink} className="flex flex-col sm:flex-row gap-3 pt-4">
            <input
              type="url"
              required
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="Paste Indian link (Amazon, Flipkart, Myntra, AJIO...)"
              className="flex-1 px-5 py-3.5 rounded-2xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 text-sm"
            />
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-red-500 text-neutral-950 font-extrabold text-sm hover:opacity-95 transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>Calculate NPR Price</span> ➔
            </button>
          </form>

          <div className="flex flex-wrap gap-4 pt-4 text-xs font-semibold text-neutral-400">
            <span>✓ 1 INR = 1.65 NPR Exchange</span>
            <span>✓ Flat Rs. 200 Nepal Delivery</span>
            <span>✓ eSewa & Khalti Supported</span>
          </div>
        </div>
      </section>

      {/* Popular Sourcing Channels */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Popular Sourcing Marketplaces</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Amazon India', logo: '📦', url: 'https://amazon.in' },
            { name: 'Flipkart', logo: '🛍️', url: 'https://flipkart.com' },
            { name: 'Myntra', logo: '👗', url: 'https://myntra.com' },
            { name: 'AJIO', logo: '👠', url: 'https://ajio.com' }
          ].map((m) => (
            <Link
              key={m.name}
              to={`/request-product`}
              className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 transition text-center space-y-2 group"
            >
              <div className="text-4xl">{m.logo}</div>
              <div className="font-bold text-white group-hover:text-amber-400">{m.name}</div>
              <div className="text-xs text-neutral-500">Instant Order Sourcing</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
