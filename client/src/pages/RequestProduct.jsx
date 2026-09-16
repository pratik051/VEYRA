import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequestProduct() {
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get('url') || '';

  const [productUrl, setProductUrl] = useState(initialUrl);
  const [indianPriceINR, setIndianPriceINR] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    if (user) {
      if (user.fullName) setCustomerName(user.fullName);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleCalculatePrice = async () => {
    if (!indianPriceINR || Number(indianPriceINR) <= 0) {
      setError('Please enter a valid positive INR price.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/india-order/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indianPriceINR: Number(indianPriceINR) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed.');
      setQuote(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!productUrl || !indianPriceINR || !customerName || !phone || !deliveryAddress) {
      setError('Please fill out all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('sajilomarts_session');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/india-order/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productUrl,
          indianPriceINR: Number(indianPriceINR),
          customerName,
          phone,
          deliveryAddress,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order.');
      setSuccessMsg(data.message || 'Order placed successfully!');
      setTimeout(() => {
        navigate('/account');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-white">India Product Link Sourcing</h1>
        <p className="text-sm text-neutral-400">
          Paste product URL from Amazon India, Flipkart, Myntra, AJIO or any Indian store.
        </p>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}
      {successMsg && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">{successMsg}</div>}

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="space-y-4">
          <label className="block text-xs font-bold text-neutral-300">1. Product Link (URL)</label>
          <input
            type="url"
            required
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="https://www.amazon.in/dp/B08N5XSG8Z"
            className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-300">2. Indian Product Price (INR ₹)</label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                value={indianPriceINR}
                onChange={(e) => setIndianPriceINR(e.target.value)}
                placeholder="e.g. 1999"
                className="flex-1 px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
              />
              <button
                type="button"
                onClick={handleCalculatePrice}
                className="px-4 py-3 bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs"
              >
                Calculate
              </button>
            </div>
          </div>

          {quote && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
              <div className="text-amber-400 font-bold">Total Payable Landed Amount:</div>
              <div className="text-2xl font-black text-white">NPR Rs. {quote.finalAmountNPR}</div>
              <div className="text-[10px] text-neutral-400">Includes 1.65 exchange, 20% service fee & flat Rs. 200 delivery</div>
            </div>
          )}
        </div>

        <form onSubmit={handleCreateOrder} className="space-y-4 pt-4 border-t border-neutral-800">
          <h3 className="text-sm font-bold text-white">3. Customer Delivery Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Full Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
            />
            <input
              type="tel"
              required
              placeholder="Phone Number (e.g. 9800000000)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
            />
          </div>

          <textarea
            required
            rows={2}
            placeholder="Full Delivery Address in Nepal (City, District, Landmark)"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs"
          />

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-300">Payment Option</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-neutral-300">
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                Cash on Delivery (COD)
              </label>
              <label className="flex items-center gap-2 text-xs text-neutral-300">
                <input
                  type="radio"
                  name="payment"
                  value="FULL_PAYMENT"
                  checked={paymentMethod === 'FULL_PAYMENT'}
                  onChange={() => setPaymentMethod('FULL_PAYMENT')}
                />
                Full Online Payment (eSewa / Khalti)
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-neutral-950 font-black text-sm hover:opacity-95 transition"
          >
            {loading ? 'Processing Order...' : 'Confirm & Place Sourcing Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
