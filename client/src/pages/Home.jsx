import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Link2,
  ArrowRight,
  Search,
  ChevronDown,
  Check,
  Shield,
  Truck,
  HelpCircle,
  Package,
  Calculator,
  ExternalLink,
  Sparkles,
  DollarSign,
  Clock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { MARKETPLACE_METAS } from '../constants/marketplaces';
import { sampleReviews } from '../data/mockData';

export function Home() {
  const [productUrl, setProductUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [trackOrderId, setTrackOrderId] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const navigate = useNavigate();

  // Rate Calculator State
  const [calcInr, setCalcInr] = useState('2000');
  const [calcQty, setCalcQty] = useState(1);

  const calculateEstimate = (inrVal, qtyVal) => {
    const inr = parseFloat(inrVal) || 0;
    const qty = Math.max(1, parseInt(qtyVal, 10) || 1);
    const exchangeRate = 1.65;
    const servicePercent = 0.20;
    const deliveryFee = 200;

    const baseInrTotal = inr * qty;
    const baseNpr = Math.round(baseInrTotal * exchangeRate * 100) / 100;
    const serviceCharge = Math.round(baseNpr * servicePercent * 100) / 100;
    const totalNpr = Math.round(baseNpr + serviceCharge + deliveryFee);

    return {
      inrTotal: baseInrTotal,
      baseNpr,
      serviceCharge,
      deliveryFee,
      totalNpr
    };
  };

  const currentEstimate = calculateEstimate(calcInr, calcQty);

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    setUrlError('');

    if (!productUrl.trim()) {
      setUrlError('Please paste an Indian product link to calculate your rate and order.');
      return;
    }

    try {
      new URL(productUrl.trim());
      navigate(`/request-product?url=${encodeURIComponent(productUrl.trim())}`);
    } catch {
      setUrlError('Please enter a valid URL starting with http:// or https://');
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackOrderId.trim()) {
      navigate(`/track-order?id=${encodeURIComponent(trackOrderId.trim())}`);
    } else {
      navigate('/track-order');
    }
  };

  const steps = [
    {
      num: '01',
      title: 'Find & Copy Link',
      desc: 'Browse Amazon India, Flipkart, Myntra, AJIO, Meesho, or any Indian website and copy the product URL.'
    },
    {
      num: '02',
      title: 'Paste Link & Calculate',
      desc: 'Paste your link into SajiloMarts. Our system calculates your complete landed cost in Nepali Rupees (NPR).'
    },
    {
      num: '03',
      title: 'Submit Delivery Address',
      desc: 'Provide your delivery details anywhere across Kathmandu Valley or all 7 Provinces of Nepal.'
    },
    {
      num: '04',
      title: 'Confirm & Pay',
      desc: 'Pay easily using eSewa, Khalti, or Direct Bank Transfer with instant order verification.'
    },
    {
      num: '05',
      title: 'Doorstep Delivery',
      desc: 'We procure in India, clear Nepal customs, and deliver the package safely to your doorstep in 5–9 days.'
    }
  ];

  const faqs = [
    {
      q: 'How does link-based ordering work on SajiloMarts?',
      a: 'Simply copy any product link from an Indian online store (Amazon, Flipkart, Myntra, Nykaa, etc.) and paste it into our quote tool. We calculate the exact landed cost in NPR, purchase the product for you in India, manage cross-border shipping and customs clearance, and deliver it straight to your doorstep in Nepal.'
    },
    {
      q: 'Which Indian shopping websites are supported?',
      a: 'We support virtually all authentic Indian shopping portals including Amazon.in, Flipkart, Myntra, AJIO, Meesho, Nykaa, Tata CLiQ, Croma, boAt Lifestyle, Noise, Zara India, H&M India, and specialized brand outlets.'
    },
    {
      q: 'How is the final NPR landed cost calculated?',
      a: 'The landed cost is calculated transparently: INR price converted at standard NPR exchange rate + cross-border sourcing & handling fee (covering India warehouse processing, insurance & customs clearance) + local Nepal delivery fee (NPR 200). There are zero hidden surprises.'
    },
    {
      q: 'How long does delivery to Nepal take?',
      a: 'Standard delivery from India to Kathmandu typically takes 5 to 9 business days. Deliveries to locations outside Kathmandu Valley take an additional 2 to 3 business days.'
    },
    {
      q: 'What payment methods can I use?',
      a: 'We accept all major Nepali digital payment methods including eSewa, Khalti, and Direct Bank Transfer (via QR / Mobile Banking).'
    },
    {
      q: 'How do I track my order once placed?',
      a: 'You can track your package live at any time using your Order ID on our Track Order page or directly from your customer account dashboard.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-12">
      {/* ── 1. HERO & URL SOURCING SECTION ── */}
      <section className="pt-2 sm:pt-6">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Direct India-to-Nepal Product Sourcing & Delivery</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
            Paste Any Indian Product Link.<br />
            <span className="text-amber-600">Know Your Rate & Order to Nepal.</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Shop from Amazon India, Flipkart, Myntra, AJIO, Meesho, Nykaa, and any verified Indian store. We handle procurement, customs clearance, and doorstep delivery across Nepal.
          </p>
        </div>

        {/* URL Input Card with Elevated Shadow */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] space-y-4 transition-all hover:shadow-[0_16px_48px_-5px_rgba(0,0,0,0.16)]">
          <div className="space-y-1">
            <label htmlFor="hero-url-input" className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Paste Indian Store Product Link
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
                <span>Get Rate & Order</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {urlError && (
              <p className="text-xs text-red-600 font-medium">{urlError}</p>
            )}
          </form>

          {/* Quick Supported Store Badges */}
          <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
            <span className="font-medium text-neutral-700">Supported: Amazon • Flipkart • Myntra • AJIO • Meesho • Nykaa • Croma</span>
            <span className="text-amber-700 font-semibold">100% Guaranteed Landed Pricing</span>
          </div>
        </div>

        {/* Sourcing Highlights Strip */}
        <div className="max-w-3xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-xl p-3 border border-neutral-200 shadow-xs flex items-center justify-center gap-2 text-xs font-semibold text-neutral-800">
            <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Customs Handled Completely</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-neutral-200 shadow-xs flex items-center justify-center gap-2 text-xs font-semibold text-neutral-800">
            <Truck className="h-4 w-4 text-amber-600 shrink-0" />
            <span>5–9 Days Nepal Delivery</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-neutral-200 shadow-xs flex items-center justify-center gap-2 text-xs font-semibold text-neutral-800">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span>Pay via eSewa, Khalti, Bank</span>
          </div>
        </div>
      </section>

      {/* ── 2. INSTANT RATE / NPR ESTIMATOR CALCULATOR ── */}
      <section id="calculator" className="scroll-mt-20">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-neutral-200/90 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="bg-neutral-900 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Calculator className="h-4 w-4" />
                <span>Live Price Estimator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Calculate Your Landed NPR Product Rate
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300">
                Test any Indian price to see the exact estimated cost in Nepali Rupees before you place your order.
              </p>
            </div>
            <Link
              to="/request-product"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shrink-0 shadow-sm"
            >
              <span>Paste Link Directly</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Inputs */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                  Indian Product Price (INR ₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={calcInr}
                    onChange={(e) => setCalcInr(e.target.value)}
                    placeholder="e.g. 2499"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-neutral-50 border border-neutral-300 font-semibold text-neutral-900 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[499, 999, 1999, 4999, 9999].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCalcInr(amt.toString())}
                      className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-amber-50 hover:border-amber-300 text-neutral-700 font-medium transition cursor-pointer"
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCalcQty(Math.max(1, calcQty - 1))}
                    className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center text-lg transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-base text-neutral-900">
                    {calcQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalcQty(calcQty + 1)}
                    className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center text-lg transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Shield className="h-3.5 w-3.5" />
                  <span>All-Inclusive Landed Pricing</span>
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Includes international transit from India, customs processing, and local doorstep delivery across Nepal.
                </p>
              </div>
            </div>

            {/* Right Breakdown Card */}
            <div className="lg:col-span-6 bg-neutral-50 rounded-xl p-6 border border-neutral-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Rate Breakdown</span>
                  <span className="text-xs font-semibold text-neutral-700">INR to NPR</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Original Price ({calcQty} item{calcQty > 1 ? 's' : ''}):</span>
                    <span className="font-semibold text-neutral-900">₹{currentEstimate.inrTotal.toLocaleString()} INR</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Base Value (Exchange Rate 1.65):</span>
                    <span className="font-semibold text-neutral-900">NPR {currentEstimate.baseNpr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Sourcing, Customs & Handling (20%):</span>
                    <span className="font-semibold text-neutral-900">NPR {currentEstimate.serviceCharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Nepal Doorstep Delivery Fee:</span>
                    <span className="font-semibold text-neutral-900">NPR {currentEstimate.deliveryFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-300 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-500 font-medium block">Total Landed NPR Rate</span>
                    <span className="text-xs text-emerald-600 font-bold">No Hidden Fees</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                      NPR {currentEstimate.totalNpr.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to={`/request-product?inr=${calcInr}&qty=${calcQty}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold py-3.5 text-sm transition shadow-[0_4px_16px_0_rgba(245,158,11,0.35)] hover:shadow-[0_6px_22px_rgba(245,158,11,0.45)]"
              >
                <span>Order This Product Link</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="text-center space-y-2 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            How Link Ordering Works
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            A transparent 5-step process to get any product from Indian stores delivered across Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-2 relative"
            >
              <span className="text-xs font-bold text-amber-600 tracking-wider">
                {step.num}
              </span>
              <h3 className="text-sm font-semibold text-neutral-900">
                {step.title}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. SUPPORTED INDIAN STORES DIRECTORY ── */}
      <section id="stores" className="scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Supported Indian Marketplaces
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Copy any product link from these stores or any verified Indian retailer.
            </p>
          </div>
          <Link
            to="/request-product"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1.5"
          >
            <span>Have a link from another store? Paste here</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MARKETPLACE_METAS.map((market) => (
            <div
              key={market.id}
              className="bg-white rounded-xl border border-neutral-200/90 hover:border-neutral-300 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_14px_35px_rgba(0,0,0,0.13)] transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{market.emoji}</span>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">
                        {market.name}
                      </h3>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {market.domain}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${market.badgeBg}`}>
                    Verified
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {market.tagline}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                <a
                  href={`https://${market.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-800 inline-flex items-center gap-1"
                >
                  <span>Visit {market.shortName}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <Link
                  to={`/request-product?source=${encodeURIComponent(market.shortName)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition"
                >
                  <span>Paste {market.shortName} Link</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. WHY SAJILOMARTS ── */}
      <section>
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Why Order Through SajiloMarts?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Practical, reliable link procurement built for shoppers across Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Direct India Sourcing</span>
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We purchase products directly from verified sellers and official Indian retail distributors.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-amber-600" />
              <span>Transparent Pricing</span>
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Know your total landed NPR cost upfront before paying. Zero unexpected customs duty fees upon delivery.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-blue-600" />
              <span>All Nepal Delivery</span>
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We manage the entire cross-border freight, customs handling, and local courier delivery to your home.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-purple-600" />
              <span>Dedicated Support</span>
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Get assistance with link selection, listing verification, payment confirmation, and parcel tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. TRACK ORDER QUICK ACCESS ── */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Track Existing Sourcing Order
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Enter your SajiloMarts Order ID to view current procurement and shipping status.
          </p>
        </div>

        <form onSubmit={handleTrackSubmit} className="max-w-md mx-auto flex gap-2.5">
          <input
            type="text"
            value={trackOrderId}
            onChange={(e) => setTrackOrderId(e.target.value)}
            placeholder="Enter Order ID (e.g. ORD-1002)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 ring-1 ring-neutral-200/60 text-neutral-900 placeholder:text-neutral-400 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition shadow-xs"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition shrink-0 shadow-sm hover:shadow-md cursor-pointer"
          >
            Track Order
          </button>
        </form>

        <div className="max-w-3xl mx-auto pt-4 border-t border-neutral-100">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 shadow-2xs font-medium text-neutral-700">
              1. Order Received
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 shadow-2xs font-medium text-neutral-700">
              2. India Sourced
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 shadow-2xs font-medium text-neutral-700">
              3. Cross-Border Transit
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 shadow-2xs font-medium text-neutral-700">
              4. Nepal Warehouse
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 shadow-2xs font-medium text-neutral-700 col-span-2 sm:col-span-1">
              5. Out for Delivery
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. CUSTOMER REVIEWS ── */}
      {sampleReviews && sampleReviews.length > 0 && (
        <section>
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              What Sourcing Shoppers Say
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Real feedback from customers across Nepal who ordered Indian products via link.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleReviews.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-900">{rev.author}</span>
                    <span className="text-[11px] text-neutral-400">{rev.date}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">
                    "{rev.title}"
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {rev.content}
                  </p>
                </div>

                {rev.verified && (
                  <div className="pt-2 border-t border-neutral-100 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>Verified Link Order</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 8. FAQ ── */}
      <section id="faq" className="scroll-mt-20">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Everything you need to know about Indian product links, NPR rates, and Nepal delivery.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-neutral-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Home;
