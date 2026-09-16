import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('sajilomarts_session');
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

      const [statsRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { headers }),
        fetch(`${API_URL}/api/admin/india-orders`, { headers })
      ]);

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (statsRes.ok) setStats(statsData.stats);
      if (ordersRes.ok) setOrders(ordersData.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  const handleUpdateStatus = async (orderId, adminVerificationStatus) => {
    try {
      const token = localStorage.getItem('sajilomarts_session');
      const res = await fetch(`${API_URL}/api/admin/india-orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adminVerificationStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8">
      <div className="flex justify-between items-center border-b border-neutral-850 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">SAJILOMARTS Admin Panel</h1>
          <p className="text-xs text-neutral-400">Manage Indian Sourcing Orders, Prices, Verification & Deliveries</p>
        </div>
        <div className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold">
          ⚡ System Admin Active
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
            <div className="text-xs text-neutral-400 font-bold">Total Orders</div>
            <div className="text-3xl font-black text-white">{stats.totalOrdersCount}</div>
          </div>
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <div className="text-xs text-amber-400 font-bold">Pending Verification</div>
            <div className="text-3xl font-black text-amber-400">{stats.pendingVerificationCount}</div>
          </div>
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
            <div className="text-xs text-emerald-400 font-bold">Verified Orders</div>
            <div className="text-3xl font-black text-emerald-400">{stats.verifiedOrdersCount}</div>
          </div>
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
            <div className="text-xs text-neutral-400 font-bold">Total Customers</div>
            <div className="text-3xl font-black text-white">{stats.totalUsersCount}</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Live Customer Orders</h2>
        {loading ? (
          <div className="text-xs text-neutral-500">Loading live orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl text-xs text-neutral-400">
            No orders found in database.
          </div>
        ) : (
          <div className="overflow-x-auto border border-neutral-800 rounded-2xl">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900 text-neutral-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product Link</th>
                  <th className="p-4">Amount (NPR)</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 bg-neutral-950">
                {orders.map((o) => (
                  <tr key={o.orderId} className="hover:bg-neutral-900/50">
                    <td className="p-4 font-bold text-amber-400">{o.orderId}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{o.customerName}</div>
                      <div className="text-[10px] text-neutral-500">{o.phone}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      <a href={o.productUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                        {o.productName || o.productUrl}
                      </a>
                    </td>
                    <td className="p-4 font-black text-white">Rs. {o.finalAmountNPR}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        {o.adminVerificationStatus || 'Pending Verification'}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(o.orderId, 'Verified / Orderable')}
                        className="px-3 py-1.5 bg-emerald-500 text-neutral-950 font-bold rounded-lg text-[10px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(o.orderId, 'Rejected')}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-lg text-[10px]"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
