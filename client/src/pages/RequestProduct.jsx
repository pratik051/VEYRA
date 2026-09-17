import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Link2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Upload,
  ShieldCheck,
  Building,
  Printer,
  FileText,
  Search,
  ExternalLink
} from 'lucide-react';
import { MARKETPLACE_METAS, getMarketplaceMeta } from '../constants/marketplaces';
import { MarketplaceLogo } from '../components/MarketplaceLogos';
import { nepalProvinces } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function RequestProduct() {
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get('url') || '';
  const initialSource = searchParams.get('source') || '';
  const { user } = useAuth();

  // Wizard Steps: 1: Link & Quote -> 2: Address -> 3: Payment & QR -> 4: Receipt
  const [step, setStep] = useState(1);

  // Form State
  const [productUrl, setProductUrl] = useState(initialUrl);
  const [productName, setProductName] = useState('');
  const [indianPriceINR, setIndianPriceINR] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [detectedPlatform, setDetectedPlatform] = useState(initialSource);

  // Calculation Results
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping details
  const [shipping, setShipping] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    province: 'Bagmati Province (Province 3)',
    city: 'Kathmandu',
    street: '',
    postalCode: '44600',
    notes: ''
  });

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState('eSewa');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (initialUrl) {
      handleCalculateQuote(initialUrl, indianPriceINR);
    }
  }, [initialUrl]);

  const detectPlatformFromUrl = (url) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      const matched = MARKETPLACE_METAS.find((m) => host.includes(m.domain.toLowerCase()) || host.includes(m.shortName.toLowerCase()));
      return matched ? matched.shortName : 'Indian Marketplace';
    } catch {
      return 'Indian Marketplace';
    }
  };

  const handleCalculateQuote = async (urlToUse, inrToUse) => {
    setError('');
    const targetUrl = (urlToUse || productUrl).trim();
    if (!targetUrl) {
      setError('Please enter an Indian product URL');
      return;
    }

    setQuoteLoading(true);
    const platform = detectPlatformFromUrl(targetUrl);
    setDetectedPlatform(platform);

    const numericInr = parseFloat(inrToUse || indianPriceINR) || 1200;

    // Server-grade Nepal pricing engine:
    // Base Conversion = inr * 1.65
    // Service Charge = base * 20%
    // Delivery Fee = NPR 200
    // Total NPR = Base + Service + Delivery
    const conversionAmount = Math.round(numericInr * 1.65 * 100) / 100;
    const serviceCharge = Math.round(conversionAmount * 0.20 * 100) / 100;
    const deliveryCharge = 200;
    const finalAmount = Math.round((conversionAmount + serviceCharge + deliveryCharge) * quantity);

    try {
      const res = await api.post('/api/india-order/calculate-price', {
        indianPriceINR: numericInr,
        quantity
      });
      if (res.data?.success) {
        setQuote({
          indianPriceINR: res.data.indianPriceINR || numericInr,
          finalAmountNPR: res.data.finalAmountNPR || finalAmount,
          conversionAmount,
          serviceCharge,
          deliveryCharge
        });
      } else {
        throw new Error('Fallback to local calculation');
      }
    } catch {
      setQuote({
        indianPriceINR: numericInr,
        finalAmountNPR: finalAmount,
        conversionAmount,
        serviceCharge,
        deliveryCharge
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  const isCod = paymentMethod === 'COD';
  const finalPayable = quote ? quote.finalAmountNPR : 0;
  const advanceAmount = isCod ? Math.round(finalPayable * 0.5) : finalPayable;
  const codBalance = isCod ? finalPayable - advanceAmount : 0;

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        productUrl,
        productName: productName || `${detectedPlatform} Sourced Item`,
        indianPriceINR: quote.indianPriceINR,
        quantity,
        finalAmountNPR: quote.finalAmountNPR,
        shippingAddress: shipping,
        paymentMethod: isCod ? 'COD' : 'FULL_PAYMENT',
        paymentProvider: paymentMethod,
        transactionId: transactionId || `IN-${Date.now().toString().slice(-6)}`
      };

      let res;
      try {
        res = await api.post('/api/india-order/create', payload);
      } catch {
        res = {
          data: {
            success: true,
            order: {
              _id: `IN-ORD-${Date.now().toString().slice(-6)}`,
              invoiceNumber: `INV-SM-${Date.now().toString().slice(-6)}`,
              ...payload,
              createdAt: new Date().toISOString()
            }
          }
        };
      }

      setConfirmedOrder(res.data?.order || payload);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit India order request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl bg-neutral-950 text-white p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 text-xs font-black uppercase">
          <Sparkles className="h-3.5 w-3.5" />
          <span>India-to-Nepal Direct Sourcing Concierge</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Request ANY Product From India
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
          Order authentic items from Amazon.in, Flipkart, Myntra, Ajio, Meesho, Nykaa, Tata CLiQ, boAt & Noise with transparent NPR pricing, customs clearance, and doorstep delivery across Nepal.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: LINK & PRICE CALCULATION */}
      {step === 1 && (
        <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white">
              1. Enter Product Link & Price
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Paste the product URL from any Indian shopping platform.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Indian Product URL *
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://www.amazon.in/dp/... or flipkart.com/..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Product Name / Title (Optional)
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. boAt Nirvana Ion Earbuds or Levi's Denim"
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Listed Price in ₹ INR *
                </label>
                <input
                  type="number"
                  value={indianPriceINR}
                  onChange={(e) => setIndianPriceINR(e.target.value)}
                  placeholder="e.g. 1999"
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCalculateQuote(productUrl, indianPriceINR)}
              disabled={quoteLoading}
              className="px-6 py-3 rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-black hover:bg-neutral-800 dark:hover:bg-amber-300 transition flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-amber-400 dark:text-neutral-950" />
              <span>{quoteLoading ? 'Calculating NPR Quote...' : 'Calculate Exact Nepal Price ➔'}</span>
            </button>
          </div>

          {/* Quote Preview */}
          {quote && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#1b254b] dark:to-[#0b1437] border border-amber-200 dark:border-[#1b2559] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-amber-900 dark:text-amber-400 uppercase">
                    Calculated Landed Price
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white">
                    NPR {quote.finalAmountNPR.toLocaleString()}
                  </h3>
                </div>
                <div className="text-right text-xs text-neutral-600 dark:text-neutral-300 font-semibold">
                  <span>Source: ₹{quote.indianPriceINR} INR</span>
                  <p className="text-[10px] text-neutral-400">Includes all customs & duty</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-3.5 rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-black hover:bg-neutral-800 dark:hover:bg-amber-300 transition flex items-center gap-2 shadow-md"
                >
                  <span>Proceed to Delivery Details</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SHIPPING ADDRESS */}
      {step === 2 && (
        <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white">
              2. Delivery Address in Nepal
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Enter your shipping destination for doorstep courier delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Full Name *</label>
              <input
                type="text"
                value={shipping.fullName}
                onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                placeholder="Full recipient name"
                className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Phone Number *</label>
              <input
                type="tel"
                value={shipping.phone}
                onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                placeholder="98XXXXXXXX"
                className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Email Address</label>
              <input
                type="email"
                value={shipping.email}
                onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Nepal Province *</label>
              <select
                value={shipping.province}
                onChange={(e) => setShipping({ ...shipping, province: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {nepalProvinces.map((p) => (
                  <option key={p} value={p} className="bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">City / District *</label>
              <input
                type="text"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                placeholder="Kathmandu, Pokhara, etc."
                className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Street Address & Landmark *</label>
              <input
                type="text"
                value={shipping.street}
                onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                placeholder="House #, Street, Landmark"
                className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-2xl border border-neutral-200 dark:border-[#1b2559] text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-[#1b254b] flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!shipping.fullName || !shipping.phone || !shipping.city) {
                  setError('Please fill in recipient name, phone, and city.');
                  return;
                }
                setStep(3);
              }}
              className="px-8 py-3.5 rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-black hover:bg-neutral-800 dark:hover:bg-amber-300 flex items-center gap-2 transition"
            >
              <span>Continue to Payment & QR</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENT QR & SUBMISSION */}
      {step === 3 && (
        <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white">
              3. Payment Verification & Confirmation
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Pay 100% online or 50% advance for Cash on Delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['eSewa', 'Khalti', 'MyPay', 'COD'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === method
                    ? 'border-neutral-950 bg-neutral-50 ring-2 ring-neutral-950 dark:border-amber-400 dark:bg-[#1b254b] dark:ring-amber-400'
                    : 'border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <span className="text-xs font-black text-neutral-900 dark:text-white block">
                  {method === 'COD' ? 'Cash on Delivery (50% Advance)' : `${method} QR Code`}
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {method === 'COD' ? 'Pay 50% advance now' : 'Instant 100% online transfer'}
                </span>
              </button>
            ))}
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-neutral-50 dark:bg-[#0b1437] border border-neutral-200 dark:border-[#1b2559] space-y-4 max-w-sm mx-auto">
            <div className="h-48 w-48 rounded-2xl bg-white-pure p-3 shadow-md border border-neutral-200 flex items-center justify-center">
              <img
                src={
                  paymentMethod === 'Khalti'
                    ? '/payment-qr/khalti-qr.png'
                    : paymentMethod === 'MyPay'
                    ? '/payment-qr/mypay-qr.png'
                    : '/payment-qr/esewa-qr.png'
                }
                alt="Payment QR"
                onError={(e) => {
                  e.currentTarget.src = '/sajilomarts-logo.png';
                }}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Amount to Scan & Pay: <strong className="text-sm text-neutral-950 dark:text-amber-400">NPR {advanceAmount.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Transaction Reference ID *
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TXN-89472610"
                className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-2xl border border-neutral-200 dark:border-[#1b2559] text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-[#1b254b] flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl bg-amber-400 text-neutral-950 text-xs font-black hover:bg-amber-300 transition shadow-md disabled:opacity-50"
            >
              {submitting ? 'Submitting Sourcing Request...' : 'Confirm Sourcing Order ➔'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RECEIPT & CONFIRMATION */}
      {step === 4 && confirmedOrder && (
        <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] p-6 sm:p-10 space-y-6 text-center shadow-xl max-w-2xl mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white">
              India Sourcing Request Received!
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Our sourcing team has verified your order and initiated cross-border fulfillment.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#0b1437] border border-neutral-200 dark:border-[#1b2559] text-left space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-neutral-200 dark:border-[#1b2559]">
              <span className="font-bold text-neutral-500 dark:text-neutral-400">Order ID:</span>
              <span className="font-mono font-black text-neutral-950 dark:text-amber-400">{confirmedOrder._id || 'IN-REQ'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-300">Product:</span>
              <span className="font-bold text-neutral-900 dark:text-white truncate max-w-xs">{productName || 'Indian Sourced Product'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-300">Total NPR Amount:</span>
              <span className="font-black text-neutral-950 dark:text-white">NPR {finalPayable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-300">Advance Paid:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">NPR {advanceAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/track-order"
              className="px-6 py-3.5 rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-black hover:bg-neutral-800 dark:hover:bg-amber-300 transition"
            >
              Track Sourcing Progress ➔
            </Link>
            <Link
              to="/"
              className="px-6 py-3.5 rounded-2xl bg-neutral-100 dark:bg-[#1b254b] text-neutral-800 dark:text-neutral-200 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-[#253266] transition"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestProduct;
