import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { orderTimeline } from '../data/mockData';
import api from '../services/api';

export function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter your Order ID or Reference Number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/api/track-order?orderId=${encodeURIComponent(orderId.trim())}`);
      if (res.data?.success && res.data.order) {
        setOrderData(res.data.order);
      } else {
        throw new Error('Not found');
      }
    } catch {
      // Mock tracking state for demonstration
      setOrderData({
        orderId: orderId.toUpperCase(),
        status: 'In Transit',
        currentStage: 4, // 0-indexed
        createdAt: 'Sep 16, 2026',
        estimatedDelivery: 'Sep 20, 2026',
        destination: 'Kathmandu, Bagmati Province',
        items: [
          { name: 'SajiloMarts Sourced Package', quantity: 1 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-2 text-center">
        <span className="text-xs font-black uppercase text-amber-500 tracking-wider">
          Real-time Nepal Fulfillment
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
          Enter your Order Reference Number to view live cross-border transit and doorstep delivery status.
        </p>
      </div>

      {/* Track Form Card */}
      <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xs space-y-4">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">Order ID *</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. ORD-10293 or IN-ORD-492"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9841XXXXXX"
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-950"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-neutral-950 text-white text-xs font-black hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Search className="h-4 w-4" />
            <span>{loading ? 'Locating Package...' : 'Track Package Status ➔'}</span>
          </button>
        </form>

        {error && (
          <p className="text-xs text-red-600 font-semibold text-center">{error}</p>
        )}
      </div>

      {/* Tracking Results Card */}
      {orderData && (
        <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">Package ID</span>
              <h3 className="text-lg font-black text-neutral-950">{orderData.orderId}</h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                {orderData.status || 'In Transit'}
              </span>
            </div>
          </div>

          {/* Details Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-neutral-50">
              <span className="text-neutral-400 block text-[10px] font-bold uppercase">Order Placed</span>
              <span className="font-bold text-neutral-900">{orderData.createdAt}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50">
              <span className="text-neutral-400 block text-[10px] font-bold uppercase">Estimated Delivery</span>
              <span className="font-bold text-emerald-600">{orderData.estimatedDelivery}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 col-span-2 sm:col-span-1">
              <span className="text-neutral-400 block text-[10px] font-bold uppercase">Destination</span>
              <span className="font-bold text-neutral-900">{orderData.destination}</span>
            </div>
          </div>

          {/* Vertical Timeline */}
          <div className="space-y-4 pt-4">
            <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider">
              Transit Progress Stages
            </h4>

            <div className="space-y-4 pl-2">
              {orderTimeline.map((stage, idx) => {
                const isPassed = idx <= (orderData.currentStage || 4);
                const isCurrent = idx === (orderData.currentStage || 4);

                return (
                  <div key={stage} className="flex items-start gap-3 relative">
                    {/* Circle Indicator */}
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        isCurrent
                          ? 'bg-amber-400 text-neutral-950 ring-4 ring-amber-100'
                          : isPassed
                          ? 'bg-neutral-950 text-white'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Stage Label */}
                    <div className="pt-0.5">
                      <span
                        className={`text-xs font-bold block ${
                          isCurrent
                            ? 'text-neutral-950 font-black'
                            : isPassed
                            ? 'text-neutral-800'
                            : 'text-neutral-400'
                        }`}
                      >
                        {stage}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-amber-600 font-semibold">
                          Active Stage — In movement
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackOrder;
