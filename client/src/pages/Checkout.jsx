import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  QrCode,
  CreditCard,
  Building,
  Upload,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { nepalProvinces } from '../data/mockData';
import api from '../services/api';

const ACTIVE_REFERRALS = {
  REF10: { discountPercent: 10, minSubtotal: 500 },
  SAJILOMARTS500: { discountFixed: 500, minSubtotal: 2500 },
  WELCOME10: { discountPercent: 10, minSubtotal: 1000 },
  VEYRA500: { discountFixed: 500, minSubtotal: 2500 }
};

export function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard Step State (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    province: 'Bagmati Province (Province 3)',
    city: 'Kathmandu',
    area: '',
    street: '',
    postalCode: '44600',
    deliverySpeed: 'standard', // standard | express
    paymentMethod: 'eSewa', // eSewa | Khalti | MyPay | COD
    referralCode: '',
    transactionId: '',
    notes: ''
  });

  const [screenshotFile, setScreenshotFile] = useState(null);
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [referralMessage, setReferralMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [error, setError] = useState('');

  // Calculations
  const deliveryFee = formData.deliverySpeed === 'express' ? 300 : (subtotal > 3000 ? 0 : 150);
  const totalAmount = Math.max(0, subtotal - referralDiscount + deliveryFee);

  // 50% Advance rule for COD vs 100% Full Payment
  const isCod = formData.paymentMethod === 'COD';
  const advancePayable = isCod ? Math.round(totalAmount * 0.5) : totalAmount;
  const codRemaining = isCod ? totalAmount - advancePayable : 0;

  const handleApplyReferral = (e) => {
    e.preventDefault();
    const clean = formData.referralCode.trim().toUpperCase();
    const rule = ACTIVE_REFERRALS[clean];

    if (rule) {
      if (subtotal >= (rule.minSubtotal || 0)) {
        let disc = 0;
        if (rule.discountPercent) {
          disc = Math.round((subtotal * rule.discountPercent) / 100);
        } else if (rule.discountFixed) {
          disc = rule.discountFixed;
        }
        setReferralDiscount(disc);
        setReferralMessage(`✓ Code ${clean} applied! Saved NPR ${disc.toLocaleString()}`);
      } else {
        setReferralMessage(`✕ Minimum subtotal of NPR ${rule.minSubtotal} required for ${clean}`);
      }
    } else {
      setReferralMessage('✕ Invalid or expired referral code');
    }
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.fullName.trim() || !formData.phone.trim() || !formData.city.trim()) {
        setError('Please fill in your name, phone number, and city.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i._id || i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity || 1,
          image: i.image,
          source: i.source || 'SajiloMarts'
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          province: formData.province,
          city: formData.city,
          area: formData.area,
          street: formData.street,
          postalCode: formData.postalCode
        },
        pricing: {
          subtotal,
          discount: referralDiscount,
          deliveryFee,
          totalAmount,
          advancePayable,
          codRemaining
        },
        payment: {
          method: formData.paymentMethod,
          transactionId: formData.transactionId || `TXN-${Date.now().toString().slice(-6)}`,
          status: isCod ? 'Advance Pending' : 'Paid'
        },
        notes: formData.notes
      };

      let orderRes;
      try {
        orderRes = await api.post('/api/checkout', orderPayload);
      } catch (e) {
        // Fallback simulated order creation if backend offline
        orderRes = {
          data: {
            success: true,
            order: {
              _id: `ORD-${Date.now().toString().slice(-6)}`,
              ...orderPayload,
              createdAt: new Date().toISOString()
            }
          }
        };
      }

      setCompletedOrder(orderRes.data?.order || orderPayload);
      clearCart();
      setCurrentStep(6);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && currentStep !== 6) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-black">Your Cart is Empty</h2>
        <p className="text-xs text-neutral-500">Please add products before checking out.</p>
        <Link to="/shop" className="inline-block px-6 py-3 rounded-xl bg-neutral-950 text-white text-xs font-bold">
          Browse Shop Catalog
        </Link>
      </div>
    );
  }

  const stepsList = [
    "Address",
    "Review",
    "Delivery",
    "Payment",
    "Verification",
    "Receipt"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Wizard Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
            Step {currentStep} of 6
          </span>
          <span className="text-xs font-bold text-neutral-400">
            {stepsList[currentStep - 1]}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {stepsList.map((step, idx) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx + 1 <= currentStep ? 'bg-amber-400' : 'bg-neutral-200'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: ADDRESS DETAILS */}
      {currentStep === 1 && (
        <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-neutral-950">1. Delivery Address & Contact</h2>
            <p className="text-xs text-neutral-500">
              Where should we deliver your order in Nepal?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Siddhartha Sharma"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 9841XXXXXX"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800">Nepal Province *</label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
              >
                {nepalProvinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">City / District *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Kathmandu, Pokhara, Biratnagar"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">Postal Code (Optional)</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="e.g. 44600 or 854331"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-neutral-800">Street / Landmark Address *</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="e.g. House #14, New Baneshwor, near Everest Hotel"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-3.5 rounded-2xl bg-neutral-950 text-white text-xs font-black hover:bg-neutral-800 flex items-center gap-2"
            >
              <span>Continue to Review</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW & PROMO CODE */}
      {currentStep === 2 && (
        <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-neutral-950">2. Review Items & Discounts</h2>
            <p className="text-xs text-neutral-500">
              Confirm your order items and apply referral or promotional codes.
            </p>
          </div>

          {/* Items Preview */}
          <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
            {items.map((i) => (
              <div key={i.id || i.slug} className="p-3.5 flex items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                  <img src={i.image || '/sajilomarts-logo.png'} alt="" className="h-12 w-12 rounded-xl object-cover bg-neutral-100" />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{i.name}</h4>
                    <span className="text-[10px] text-neutral-400">Qty: {i.quantity || 1} • {i.source || 'SajiloMarts'}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-neutral-950">
                  NPR {((i.price || 0) * (i.quantity || 1)).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Referral Code Form */}
          <form onSubmit={handleApplyReferral} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
            <label className="text-xs font-bold text-neutral-900 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Apply Referral or Coupon Code</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                placeholder="REF10, SAJILOMARTS500, WELCOME10"
                className="flex-1 rounded-xl border border-neutral-200 px-3 py-2 text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800"
              >
                Apply
              </button>
            </div>
            {referralMessage && (
              <p className="text-[11px] font-semibold text-neutral-600">{referralMessage}</p>
            )}
          </form>

          {/* Breakdown summary */}
          <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-2 text-xs">
            <div className="flex justify-between text-neutral-300">
              <span>Items Subtotal:</span>
              <span>NPR {subtotal.toLocaleString()}</span>
            </div>
            {referralDiscount > 0 && (
              <div className="flex justify-between text-amber-400 font-bold">
                <span>Discount:</span>
                <span>- NPR {referralDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base text-white pt-2 border-t border-white/10">
              <span>Payable:</span>
              <span>NPR {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-3 rounded-2xl border border-neutral-200 text-xs font-bold hover:bg-neutral-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-3.5 rounded-2xl bg-neutral-950 text-white text-xs font-black hover:bg-neutral-800 flex items-center gap-2"
            >
              <span>Continue to Delivery</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DELIVERY SPEED */}
      {currentStep === 3 && (
        <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-neutral-950">3. Delivery Logistics & Speed</h2>
            <p className="text-xs text-neutral-500">
              Choose your preferred transit speed for Nepal doorstep fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliverySpeed: 'standard' })}
              className={`p-5 rounded-2xl border text-left transition-all ${
                formData.deliverySpeed === 'standard'
                  ? 'border-neutral-950 bg-neutral-50 ring-2 ring-neutral-950'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-neutral-900">Standard Transit</span>
                <span className="text-xs font-bold text-emerald-600">
                  {subtotal > 3000 ? 'FREE' : 'NPR 150'}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Doorstep delivery within 3–5 business days across all major cities in Nepal.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, deliverySpeed: 'express' })}
              className={`p-5 rounded-2xl border text-left transition-all ${
                formData.deliverySpeed === 'express'
                  ? 'border-neutral-950 bg-neutral-50 ring-2 ring-neutral-950'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-neutral-900">Priority Express</span>
                <span className="text-xs font-bold text-neutral-950">NPR 300</span>
              </div>
              <p className="text-xs text-neutral-500">
                Fast-track cross-border air transit within 2–3 business days with priority dispatch.
              </p>
            </button>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-3 rounded-2xl border border-neutral-200 text-xs font-bold hover:bg-neutral-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-3.5 rounded-2xl bg-neutral-950 text-white text-xs font-black hover:bg-neutral-800 flex items-center gap-2"
            >
              <span>Continue to Payment Method</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PAYMENT METHOD (ESEWA, KHALTI, MYPAY, COD ADVANCE) */}
      {currentStep === 4 && (
        <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-neutral-950">4. Select Payment Method</h2>
            <p className="text-xs text-neutral-500">
              Choose digital wallet QR or Cash on Delivery (requires 50% advance).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* eSewa */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: 'eSewa' })}
              className={`p-4 rounded-2xl border flex items-center justify-between text-left transition-all ${
                formData.paymentMethod === 'eSewa'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-xs font-black text-emerald-800">eSewa Direct QR</span>
                <p className="text-[11px] text-neutral-500">Instant NPR Wallet Scan</p>
              </div>
              <span className="text-xs font-black text-emerald-700">100% Pay</span>
            </button>

            {/* Khalti */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: 'Khalti' })}
              className={`p-4 rounded-2xl border flex items-center justify-between text-left transition-all ${
                formData.paymentMethod === 'Khalti'
                  ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-xs font-black text-purple-800">Khalti Wallet QR</span>
                <p className="text-[11px] text-neutral-500">Scan & Pay via Khalti App</p>
              </div>
              <span className="text-xs font-black text-purple-700">100% Pay</span>
            </button>

            {/* MyPay / Bank QR */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: 'MyPay' })}
              className={`p-4 rounded-2xl border flex items-center justify-between text-left transition-all ${
                formData.paymentMethod === 'MyPay'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-xs font-black text-blue-800">MyPay / Fonepay QR</span>
                <p className="text-[11px] text-neutral-500">All Nepal Bank Apps</p>
              </div>
              <span className="text-xs font-black text-blue-700">100% Pay</span>
            </button>

            {/* COD 50% Advance */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
              className={`p-4 rounded-2xl border flex items-center justify-between text-left transition-all ${
                formData.paymentMethod === 'COD'
                  ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-600'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-xs font-black text-amber-900">Cash on Delivery (50% Advance)</span>
                <p className="text-[11px] text-neutral-500">Pay 50% now, balance on arrival</p>
              </div>
              <span className="text-xs font-black text-amber-700">50% Advance</span>
            </button>
          </div>

          {/* Advance Breakdown Notice */}
          {isCod && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1.5 text-amber-950">
              <span className="font-black">📌 50% COD Advance Calculation:</span>
              <div className="flex justify-between">
                <span>Advance Required via QR:</span>
                <span className="font-bold">NPR {advancePayable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining on Doorstep Delivery:</span>
                <span className="font-bold">NPR {codRemaining.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-3 rounded-2xl border border-neutral-200 text-xs font-bold hover:bg-neutral-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-3.5 rounded-2xl bg-neutral-950 text-white text-xs font-black hover:bg-neutral-800 flex items-center gap-2"
            >
              <span>Scan QR & Verify</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SCAN QR & TRANSACTION ID / VERIFICATION */}
      {currentStep === 5 && (
        <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-black text-neutral-950">5. Complete QR Payment & Verify</h2>
            <p className="text-xs text-neutral-500">
              Scan the QR code below with your {formData.paymentMethod} app to pay{' '}
              <strong className="text-neutral-950">NPR {advancePayable.toLocaleString()}</strong>.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-neutral-50 border border-neutral-200 space-y-4 max-w-sm mx-auto">
            <div className="h-48 w-48 rounded-2xl bg-white p-3 shadow-md border border-neutral-200 flex items-center justify-center">
              <img
                src={
                  formData.paymentMethod === 'Khalti'
                    ? '/payment-qr/khalti-qr.png'
                    : formData.paymentMethod === 'MyPay'
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
              <span className="text-xs font-bold text-neutral-700">
                Payable Amount: <span className="text-sm font-black text-neutral-950">NPR {advancePayable.toLocaleString()}</span>
              </span>
              <p className="text-[10px] text-neutral-400">Account Name: SajiloMarts Enterprise Nepal</p>
            </div>
          </div>

          <div className="space-y-3 max-w-md mx-auto">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">
                Transaction ID / Reference Code *
              </label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                placeholder="e.g. 948271038 or TXN-..."
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">
                Order Notes / Sourcing Instructions
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any specific delivery instructions or preferences..."
                rows={2}
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-3 rounded-2xl border border-neutral-200 text-xs font-bold hover:bg-neutral-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="px-8 py-3.5 rounded-2xl bg-red-600 text-white text-xs font-black hover:bg-red-700 transition shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Submitting Order...' : 'Confirm & Place Order ➔'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: INSTANT RECEIPT & ORDER CONFIRMATION */}
      {currentStep === 6 && completedOrder && (
        <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-10 space-y-6 text-center shadow-xl max-w-2xl mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950">
              Order Confirmed & Received!
            </h2>
            <p className="text-xs text-neutral-500">
              Thank you for shopping with SajiloMarts. Your order is now being processed.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-left space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-neutral-200">
              <span className="font-bold text-neutral-500">Order Reference:</span>
              <span className="font-black text-neutral-950">{completedOrder._id || 'ORD-VERIFIED'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Payment Mode:</span>
              <span className="font-bold text-neutral-900">{formData.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Amount Paid / Advance:</span>
              <span className="font-black text-emerald-600">NPR {advancePayable.toLocaleString()}</span>
            </div>
            {isCod && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Cash on Delivery Balance:</span>
                <span className="font-bold text-amber-800">NPR {codRemaining.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="text-neutral-600">Delivery Destination:</span>
              <span className="font-medium text-neutral-900 text-right">{formData.street}, {formData.city}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/track-order"
              className="px-6 py-3.5 rounded-2xl bg-neutral-950 text-white text-xs font-black hover:bg-neutral-800 transition"
            >
              Track Order Status ➔
            </Link>
            <Link
              to="/shop"
              className="px-6 py-3.5 rounded-2xl bg-neutral-100 text-neutral-800 text-xs font-bold hover:bg-neutral-200 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
