import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
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
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Clock
} from 'lucide-react';
import { MARKETPLACE_METAS, getMarketplaceMeta } from '../constants/marketplaces';
import { MarketplaceLogo } from '../components/MarketplaceLogos';
import { nepalProvinces } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function RequestProduct() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialUrl = searchParams.get('url') || '';
  const initialSource = searchParams.get('source') || '';
  const { user } = useAuth();

  // Wizard Steps: 1: Link & Quote -> 2: Address -> 3: Payment & QR -> 4: Receipt
  const [step, setStep] = useState(1);

  // Form State
  const [productUrl, setProductUrl] = useState(initialUrl);
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState('');
  const [indianPriceINR, setIndianPriceINR] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [detectedPlatform, setDetectedPlatform] = useState(initialSource);

  // Live Auto-fetch state
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [fetchNotice, setFetchNotice] = useState('');

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

  // Hydrate pending sourcing quote from sessionStorage
  useEffect(() => {
    try {
      const savedPending = sessionStorage.getItem('pending_sourcing_quote');
      if (savedPending) {
        const parsed = JSON.parse(savedPending);
        if (parsed) {
          if (parsed.productUrl) setProductUrl(parsed.productUrl);
          if (parsed.productName) setProductName(parsed.productName);
          if (parsed.productImage) setProductImage(parsed.productImage);
          if (parsed.indianPriceINR) setIndianPriceINR(parsed.indianPriceINR);
          if (parsed.quantity) setQuantity(parsed.quantity);
          if (parsed.detectedPlatform) setDetectedPlatform(parsed.detectedPlatform);
          if (parsed.quote) setQuote(parsed.quote);
          if (parsed.step) {
            setStep(parsed.step);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to restore pending sourcing quote', e);
    }
  }, []);

  // Sync shipping info with user
  useEffect(() => {
    if (user) {
      setShipping((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState('eSewa');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

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

  const calculateLandedQuote = (inrVal, qtyVal) => {
    const inr = parseFloat(inrVal);
    const qty = Math.max(1, parseInt(qtyVal, 10) || 1);

    if (isNaN(inr) || inr <= 0) {
      setQuote(null);
      return null;
    }

    // Internal calculation (never exposed in UI)
    const exchangeRate = 1.65;
    const servicePercent = 0.20;
    const deliveryFee = 200;

    const baseInrTotal = inr * qty;
    const conversionAmount = Math.round(baseInrTotal * exchangeRate * 100) / 100;
    const serviceCharge = Math.round(conversionAmount * servicePercent * 100) / 100;
    const deliveryCharge = deliveryFee;
    const finalAmount = Math.round(conversionAmount + serviceCharge + deliveryCharge);

    // Only store customer-facing fields in quote state
    const calculatedQuote = {
      unitPriceINR: inr,
      indianPriceINR: baseInrTotal,
      quantity: qty,
      finalAmountNPR: finalAmount
    };

    setQuote(calculatedQuote);
    return calculatedQuote;
  };

  const handleAutoFetchDetails = async (urlToFetch) => {
    const targetUrl = (urlToFetch || productUrl).trim();
    if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
      return;
    }
    setFetchingDetails(true);
    setFetchNotice('');
    setError('');

    const platform = detectPlatformFromUrl(targetUrl);
    setDetectedPlatform(platform);

    try {
      const res = await api.post('/api/verify-product-link', { url: targetUrl });
      const data = res.data;
      if (data) {
        if (data.title && (!productName || productName === 'Sourced Indian Product')) {
          setProductName(data.title);
        }
        if (data.image) {
          setProductImage(data.image);
        }
        if (data.priceINR && Number(data.priceINR) > 0) {
          const inr = Number(data.priceINR);
          setIndianPriceINR(inr);
          calculateLandedQuote(inr, quantity);
          setFetchNotice(`Live price fetched from ${data.platform || platform}: ₹${inr.toLocaleString()} INR`);
        } else {
          setFetchNotice(`Identified ${data.platform || platform} product link. Live price extraction was restricted by the store — please enter the listed ₹ INR price manually.`);
        }
      }
    } catch {
      setFetchNotice(`Connected to ${platform}. Please enter the listed ₹ INR price from the website.`);
    } finally {
      setFetchingDetails(false);
    }
  };

  useEffect(() => {
    if (initialUrl) {
      handleAutoFetchDetails(initialUrl);
    }
  }, [initialUrl]);

  const handleCalculateQuote = async () => {
    setError('');
    const targetUrl = productUrl.trim();
    if (!targetUrl) {
      setError('Please enter an Indian product URL.');
      return;
    }

    const numericInr = parseFloat(indianPriceINR);
    if (isNaN(numericInr) || numericInr <= 0) {
      setError('Please enter a valid listed price in ₹ INR from the product website (e.g. 1499).');
      return;
    }

    setQuoteLoading(true);
    try {
      const res = await api.post('/api/india-order/calculate-price', {
        indianPriceINR: numericInr,
        quantity
      });
      if (res.data?.success && res.data?.finalAmountNPR > 0) {
        // Only store customer-facing fields — internal breakdown not exposed
        setQuote({
          unitPriceINR: numericInr,
          indianPriceINR: numericInr * quantity,
          quantity,
          finalAmountNPR: res.data.finalAmountNPR
        });
      } else {
        calculateLandedQuote(numericInr, quantity);
      }
    } catch {
      calculateLandedQuote(numericInr, quantity);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit. Please upload a smaller screenshot.');
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const isCod = paymentMethod === 'COD';
  const finalPayable = quote ? quote.finalAmountNPR : 0;
  const advanceAmount = isCod ? Math.round(finalPayable * 0.5) : finalPayable;
  const codBalance = isCod ? finalPayable - advanceAmount : 0;

  const handleProceedToDelivery = () => {
    if (!quote || quote.finalAmountNPR <= 0) {
      setError('Please calculate the Nepal price before proceeding.');
      return;
    }

    if (!user) {
      const pendingData = {
        productUrl,
        productName: productName || `${detectedPlatform} Sourced Item`,
        productImage: productImage || '',
        indianPriceINR,
        quantity,
        detectedPlatform,
        quote,
        step: 2
      };
      sessionStorage.setItem('pending_sourcing_quote', JSON.stringify(pendingData));
      navigate(`/login?redirect=${encodeURIComponent('/request-product')}&msg=${encodeURIComponent('Please login or create an account before placing your order.')}`);
      return;
    }

    setStep(2);
  };

  const handleSubmitOrder = async () => {
    if (!quote || quote.finalAmountNPR <= 0) {
      setError('Please calculate the Nepal price before submitting.');
      return;
    }

    if (!user) {
      const pendingData = {
        productUrl,
        productName: productName || `${detectedPlatform} Sourced Item`,
        productImage: productImage || '',
        indianPriceINR,
        quantity,
        detectedPlatform,
        quote,
        step: 2
      };
      sessionStorage.setItem('pending_sourcing_quote', JSON.stringify(pendingData));
      navigate(`/login?redirect=${encodeURIComponent('/request-product')}&msg=${encodeURIComponent('Please login or create an account before placing your order.')}`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        productUrl,
        productName: productName || `${detectedPlatform} Sourced Item`,
        productImage: productImage || '',
        indianPriceINR: quote.indianPriceINR,
        quantity,
        finalAmountNPR: quote.finalAmountNPR,
        shippingAddress: shipping,
        customerName: shipping.fullName,
        phone: shipping.phone,
        email: shipping.email,
        deliveryAddress: shipping.street,
        city: shipping.city,
        province: shipping.province,
        postalCode: shipping.postalCode,
        deliveryInstructions: shipping.notes,
        paymentMethod: isCod ? 'COD' : 'FULL_PAYMENT',
        paymentProvider: paymentMethod,
        paymentTransactionId: transactionId || `TXN-${Date.now().toString().slice(-6)}`,
        paymentScreenshot: screenshotPreview || '',
        userId: user?.id || user?._id || '',
        customerId: user?.id || user?._id || ''
      };

      const res = await api.post('/api/india-order/create', payload);
      const createdOrder = res.data?.order;
      if (!createdOrder) {
        throw new Error(res.data?.error || 'Failed to place India order on server.');
      }

      // Also register payment proof with payment-controller
      if (screenshotPreview || transactionId) {
        try {
          await api.post('/api/payments/submit-proof', {
            orderId: createdOrder.orderId || createdOrder._id,
            paymentMethod,
            transactionId: transactionId || payload.paymentTransactionId,
            screenshot: screenshotPreview || ''
          });
        } catch (proofErr) {
          console.warn('Payment proof submission notice:', proofErr.message);
        }
      }

      sessionStorage.removeItem('pending_sourcing_quote');
      setConfirmedOrder(createdOrder);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit India order request.');
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
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    value={productUrl}
                    onChange={(e) => {
                      setProductUrl(e.target.value);
                      const p = detectPlatformFromUrl(e.target.value);
                      setDetectedPlatform(p);
                    }}
                    placeholder="https://www.amazon.in/dp/... or flipkart.com/..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAutoFetchDetails(productUrl)}
                  disabled={fetchingDetails || !productUrl.trim()}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {fetchingDetails ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Auto-Fetch Details</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {fetchNotice && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{fetchNotice}</span>
              </div>
            )}

            {/* Product image thumbnail & preview */}
            {productImage && (
              <div className="p-3 rounded-2xl border border-neutral-200 dark:border-[#1b2559] bg-neutral-50 dark:bg-[#0b1437] flex items-center gap-3">
                <img
                  src={productImage}
                  alt="Product preview"
                  className="h-16 w-16 object-contain rounded-xl bg-white border border-neutral-200 dark:border-[#1b2559] p-1 shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="overflow-hidden space-y-0.5">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-black uppercase rounded bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950">
                    {detectedPlatform}
                  </span>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                    {productName || 'Verified Marketplace Product'}
                  </p>
                </div>
              </div>
            )}

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
                  onChange={(e) => {
                    setIndianPriceINR(e.target.value);
                    if (parseFloat(e.target.value) > 0) {
                      calculateLandedQuote(e.target.value, quantity);
                    } else {
                      setQuote(null);
                    }
                  }}
                  placeholder="e.g. 1999"
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => {
                    const newQty = parseInt(e.target.value, 10);
                    setQuantity(newQty);
                    if (parseFloat(indianPriceINR) > 0) {
                      calculateLandedQuote(indianPriceINR, newQty);
                    }
                  }}
                  className="rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {[1, 2, 3, 4, 5, 10].map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleCalculateQuote}
                disabled={quoteLoading || !indianPriceINR}
                className="px-6 py-2.5 rounded-2xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-black hover:bg-neutral-800 dark:hover:bg-amber-300 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 text-amber-400 dark:text-neutral-950" />
                <span>{quoteLoading ? 'Calculating NPR Quote...' : 'Calculate Exact Nepal Price ➔'}</span>
              </button>
            </div>
          </div>

          {/* Transparent Quote Preview with Clear Separation */}
          {quote && quote.finalAmountNPR > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#1b254b] dark:to-[#0b1437] border border-amber-200 dark:border-[#1b2559] space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-amber-200/60 dark:border-white/10">
                {/* Original Indian Marketplace Price */}
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase text-amber-800 dark:text-amber-400">
                    Original Marketplace Price (INR)
                  </span>
                  <div className="text-2xl font-black text-neutral-900 dark:text-white">
                    ₹{quote.indianPriceINR.toLocaleString()}{' '}
                    <span className="text-xs font-semibold text-neutral-500">INR</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Listed retail on {detectedPlatform}
                  </p>
                </div>

                {/* Final SajiloMarts Landed Price */}
                <div className="space-y-1 sm:text-right">
                  <span className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                    Final Landed Price (NPR)
                  </span>
                  <div className="text-3xl font-black text-neutral-950 dark:text-amber-400">
                    NPR {quote.finalAmountNPR.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Includes customs, clearance & doorstep delivery
                  </p>
                </div>
              </div>

              {/* Internal cost breakdown intentionally omitted from customer view */}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleProceedToDelivery}
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
                if (!shipping.fullName || !shipping.phone || !shipping.city || !shipping.street) {
                  setError('Please fill in recipient name, phone, city, and street address.');
                  return;
                }
                setError('');
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

      {/* STEP 3: PAYMENT QR & PROOF SUBMISSION */}
      {step === 3 && (
        <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white">
              3. Payment Verification & Confirmation
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Pay 100% online or 50% advance for Cash on Delivery. Upload transfer screenshot for finance verification.
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
                  {method === 'COD' ? 'Pay 50% advance now, rest upon delivery' : 'Instant 100% online transfer'}
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
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Amount to Scan & Pay:{' '}
                <strong className="text-sm text-neutral-950 dark:text-amber-400">
                  NPR {advanceAmount.toLocaleString()}
                </strong>
              </span>
              <p className="text-[10px] text-neutral-400">Account Name: SajiloMarts Enterprise Nepal</p>
            </div>
          </div>

          {/* Payment Proof Inputs */}
          <div className="space-y-4 max-w-md mx-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Transaction ID / Reference Code *
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TXN-89472610 or Wallet ID"
                className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Payment Screenshot Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Upload Payment Screenshot Proof</span>
                <span className="text-[10px] text-amber-500 font-semibold">(Fast finance review)</span>
              </label>

              {screenshotPreview ? (
                <div className="p-3 rounded-2xl border border-neutral-200 dark:border-[#1b2559] bg-neutral-50 dark:bg-[#0b1437] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={screenshotPreview}
                      alt="Proof Preview"
                      className="h-12 w-12 object-cover rounded-xl border border-neutral-200 dark:border-[#1b2559]"
                    />
                    <div className="truncate text-xs">
                      <p className="font-bold text-neutral-900 dark:text-white truncate">
                        {screenshotFile?.name || 'payment-proof.png'}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Ready to attach • {(screenshotFile?.size ? (screenshotFile.size / 1024).toFixed(0) + ' KB' : 'Image attached')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[11px] font-bold hover:bg-rose-200 transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-[#1b2559] hover:border-amber-400 dark:hover:border-amber-400 transition cursor-pointer bg-neutral-50/50 dark:bg-[#0b1437]">
                  <Upload className="h-5 w-5 text-neutral-400 mb-1" />
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Click to select payment transfer screenshot
                  </span>
                  <span className="text-[10px] text-neutral-400">PNG, JPG or WebP (max 5MB)</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleScreenshotChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-[#0b1437] text-[11px] text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                Payment status will remain <strong>Pending Verification</strong> until our finance desk verifies your screenshot.
              </span>
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
              className="px-8 py-3.5 rounded-2xl bg-amber-400 text-neutral-950 text-xs font-black hover:bg-amber-300 transition shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Sourcing Request...</span>
                </>
              ) : (
                <span>Confirm Sourcing Order ➔</span>
              )}
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
              Our sourcing team has received your order and payment verification details.
            </p>
          </div>

          {/* Payment Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Payment Status: Pending Verification</span>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#0b1437] border border-neutral-200 dark:border-[#1b2559] text-left space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-neutral-200 dark:border-[#1b2559]">
              <span className="font-bold text-neutral-500 dark:text-neutral-400">Order ID:</span>
              <span className="font-mono font-black text-neutral-950 dark:text-amber-400">
                {confirmedOrder.orderId || confirmedOrder._id || 'LNK-IN'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-300">Product:</span>
              <span className="font-bold text-neutral-900 dark:text-white truncate max-w-xs">
                {productName || 'Indian Sourced Product'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-300">Original Listed INR:</span>
              <span className="font-bold text-neutral-900 dark:text-white">
                ₹{quote ? quote.indianPriceINR.toLocaleString() : '—'} INR
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-300">Total Landed NPR:</span>
              <span className="font-black text-neutral-950 dark:text-white">
                NPR {finalPayable.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-300">
                {isCod ? 'Advance Submitted (50%):' : 'Amount Transferred:'}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                NPR {advanceAmount.toLocaleString()}
              </span>
            </div>
            {screenshotPreview && (
              <div className="pt-2 border-t border-neutral-200 dark:border-[#1b2559] flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-300">Transfer Screenshot:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded for Review
                </span>
              </div>
            )}
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
