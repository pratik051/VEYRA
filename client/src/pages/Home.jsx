import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, ArrowRight, ChevronDown, Check } from 'lucide-react';
import { sampleReviews } from '../data/mockData';

export function Home() {
  const [productUrl, setProductUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [trackOrderId, setTrackOrderId] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
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

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackOrderId.trim()) {
      navigate(`/track-order?id=${encodeURIComponent(trackOrderId.trim())}`);
    } else {
      navigate('/track-order');
    }
  };


  const steps = [
    { num: '01', title: 'Find your product', desc: 'Browse your favorite Indian online stores like Amazon, Flipkart, Myntra, etc.' },
    { num: '02', title: 'Paste the link', desc: 'Paste the product URL into our quote tool to check availability.' },
    { num: '03', title: 'Get your NPR quote', desc: 'See your estimated landed cost in Nepali Rupees before placing an order.' },
    { num: '04', title: 'Confirm your order', desc: 'Review the cost breakdown and place your order using eSewa, Khalti, Bank or COD.' },
    { num: '05', title: 'Receive it in Nepal', desc: 'We handle cross-border procurement, customs clearance, and doorstep delivery.' },
  ];

  const faqs = [
    {
      q: 'How does SajiloMarts work?',
      a: 'SajiloMarts enables customers in Nepal to purchase products from Indian online marketplaces. You paste the product URL, we calculate the landed cost in Nepali Rupees (NPR), handle procurement in India, customs processing, and deliver the package directly to your doorstep in Nepal.'
    },
    {
      q: 'Which Indian stores are supported?',
      a: 'We support sourcing from Amazon India, Flipkart, Myntra, AJIO, Meesho, Nykaa, boAt Lifestyle, Noise, Tata CLiQ, Croma, and most verified Indian e-commerce stores.'
    },
    {
      q: 'How is the NPR price calculated?',
      a: 'The landed price includes the original INR price converted at standard exchange rates, our sourcing service charge, applicable India shipping and Nepal customs clearance, plus domestic delivery across Nepal.'
    },
    {
      q: 'How long does delivery take?',
      a: 'Standard cross-border delivery from Indian warehouses to Kathmandu typically takes 5 to 9 business days. Deliveries outside Kathmandu Valley take an additional 2 to 4 business days.'
    },
    {
      q: 'What happens after I place an order?',
      a: 'Once your order is submitted, our procurement team inspects the listing, verifies the stock in India, purchases the item, and dispatches it toward Nepal. You receive live status updates at every stage.'
    },
    {
      q: 'How can I track my order?',
      a: 'You can track your package anytime by entering your Order ID on our Track Order page or directly in your customer account dashboard.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-12">
      {/* ── 1. HERO & URL QUOTE SECTION ── */}
      <section className="pt-2 sm:pt-6">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
            Shop from India. We Deliver to Nepal.
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Find products on Amazon, Flipkart, Myntra, AJIO and more. Paste the product link and get your NPR quote.
          </p>
        </div>

        {/* URL Input Card with Enhanced Drop Shadow */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] space-y-4 transition-all hover:shadow-[0_16px_48px_-5px_rgba(0,0,0,0.16)]">
          <div className="space-y-1">
            <label htmlFor="hero-url-input" className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Paste your product link
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
                  placeholder="Paste your Indian store product link..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-neutral-50 border border-neutral-300 ring-1 ring-neutral-200/70 text-neutral-900 placeholder:text-neutral-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition shadow-xs"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold px-7 py-3.5 text-sm transition-all shadow-[0_4px_16px_0_rgba(245,158,11,0.42)] hover:shadow-[0_6px_22px_rgba(245,158,11,0.52)] shrink-0 active:scale-[0.99] cursor-pointer"
              >
                <span>Get My Quote</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {urlError && (
              <p className="text-xs text-red-600 font-medium">{urlError}</p>
            )}
          </form>

          <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
            <span className="font-medium text-neutral-700">Amazon India • Flipkart • Myntra • AJIO • Meesho • Nykaa • +10 more</span>
            <span className="text-neutral-400">See your estimated NPR cost before placing your order.</span>
          </div>
        </div>

        {/* Price Transparency Note */}
        <div className="max-w-3xl mx-auto mt-4 bg-amber-50/90 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 shadow-[0_4px_18px_rgba(245,158,11,0.14)]">
          <p className="font-bold text-amber-900 mb-0.5">
            Know your cost before you order.
          </p>
          <p className="text-amber-800 leading-relaxed">
            Your quote may include the product price, applicable India shipping, service charges, customs/taxes where applicable, and Nepal delivery.
          </p>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ── */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="text-center space-y-2 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            How SajiloMarts Works
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            A simple, transparent 5-step process to get products from Indian stores delivered across Nepal.
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



      {/* ── 6. WHY SAJILOMARTS ── */}
      <section>
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Why SajiloMarts?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Practical, reliable e-commerce sourcing built for shoppers in Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900">
              Direct India Sourcing
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Products sourced directly from verified Indian marketplace stores and official brand outlets.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900">
              Transparent Pricing
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Understand your estimated cost breakdown clearly in Nepali Rupees before confirming your order.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900">
              Nepal Delivery
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We manage the entire international shipping, customs handling, and local delivery process to your doorstep.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-[0_6px_22px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900">
              Order Support
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Get direct assistance, link verification help, and status updates throughout your sourcing request.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. TRACK ORDER ── */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200/90 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Track Your Order
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Enter your order ID to check your latest status.
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

        {/* Tracking Stages Visual */}
        <div className="max-w-3xl mx-auto pt-4 border-t border-neutral-100">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 shadow-2xs font-medium text-neutral-700">
              1. Order Confirmed
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 shadow-2xs font-medium text-neutral-700">
              2. Sourcing
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 shadow-2xs font-medium text-neutral-700">
              3. In Transit
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 shadow-2xs font-medium text-neutral-700">
              4. Nepal Hub
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 shadow-2xs font-medium text-neutral-700 col-span-2 sm:col-span-1">
              5. Delivered
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. CUSTOMER REVIEWS ── */}
      {sampleReviews && sampleReviews.length > 0 && (
        <section>
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Real feedback from shoppers across Nepal who sourced products from India.
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
                    <span>Verified Order</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 9. FAQ ── */}
      <section id="faq" className="scroll-mt-20">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            Everything you need to know about Indian product sourcing and Nepal delivery.
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
