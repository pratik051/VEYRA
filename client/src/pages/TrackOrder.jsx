import React, { useState } from 'react';

export function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`${API_URL}/api/india-order/${orderId.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order not found.');
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white">Track Your Sourcing Order</h1>
        <p className="text-xs text-neutral-400">Enter your order ID (e.g. LNK-IN-12345) to view live status.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          required
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="LNK-IN-XXXXX"
          className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs"
        />
        <button type="submit" className="px-6 py-3 bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs">
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}

      {order && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <div>
              <div className="text-xs text-neutral-500">Order ID</div>
              <div className="font-bold text-white text-sm">{order.orderId}</div>
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
              {order.orderStatus || 'Requested'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-neutral-500 block">Customer Name</span>
              <span className="text-white font-bold">{order.customerName}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Phone</span>
              <span className="text-white font-bold">{order.phone}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Marketplace</span>
              <span className="text-white font-bold">{order.marketplace}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Final Amount</span>
              <span className="text-amber-400 font-bold">NPR Rs. {order.finalAmountNPR}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
