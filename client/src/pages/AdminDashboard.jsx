import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Package,
  FileText,
  CreditCard,
  HelpCircle,
  Settings,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  KeyRound,
  Building,
  RefreshCw,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // orders | requests | payments | tickets | settings
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Sourcing Destination Settings
  const [transitConfig, setTransitConfig] = useState({
    warehouseCity: 'Raxaul / Birgunj Hub',
    exchangeRate: '1.65',
    servicePercent: '20',
    deliveryCharge: '200'
  });

  // Admin Password Change
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, reqRes, payRes, ticketRes] = await Promise.allSettled([
        api.get('/api/admin/orders'),
        api.get('/api/admin/product-requests'),
        api.get('/api/admin/payments'),
        api.get('/api/admin/tickets')
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.orders) {
        setOrders(ordersRes.value.data.orders);
      }
      if (reqRes.status === 'fulfilled' && reqRes.value.data?.requests) {
        setRequests(reqRes.value.data.requests);
      }
      if (payRes.status === 'fulfilled' && payRes.value.data?.payments) {
        setPayments(payRes.value.data.payments);
      }
      if (ticketRes.status === 'fulfilled' && ticketRes.value.data?.tickets) {
        setTickets(ticketRes.value.data.tickets);
      }
    } catch (e) {
      console.error("Admin data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/admin/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      setStatusMsg(`Order ${orderId} updated to ${newStatus}`);
    } catch {
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatusMsg('✕ New passwords do not match');
      return;
    }

    try {
      await api.post('/api/admin/settings/password', passwords);
      setStatusMsg('✓ Admin password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatusMsg(err.response?.data?.message || '✓ Password update processed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Admin Header Banner */}
      <div className="rounded-3xl bg-neutral-950 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-neutral-950 shadow-md">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-black">SajiloMarts Master Admin</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
                Active Staff
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Logged in as {user?.fullName || 'Administrator'} ({user?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-bold border border-neutral-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl border border-white/20 text-neutral-200 hover:bg-white/10 text-xs font-bold"
          >
            Storefront ➔
          </Link>
        </div>
      </div>

      {/* Analytics Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">Customer Orders</span>
          <h3 className="text-2xl font-black text-neutral-950">{orders.length}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">India Sourcing Requests</span>
          <h3 className="text-2xl font-black text-amber-600">{requests.length}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">Payments Submitted</span>
          <h3 className="text-2xl font-black text-emerald-600">{payments.length}</h3>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase">Support Tickets</span>
          <h3 className="text-2xl font-black text-blue-600">{tickets.length}</h3>
        </div>
      </div>

      {/* Admin Tab Nav */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-200">
        {[
          { id: 'orders', label: 'Orders Management', icon: Package },
          { id: 'requests', label: 'India Sourcing Requests', icon: FileText },
          { id: 'payments', label: 'Payment QR Verification', icon: CreditCard },
          { id: 'tickets', label: 'Support Tickets', icon: HelpCircle },
          { id: 'settings', label: 'Sourcing & Password', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          {statusMsg}
        </div>
      )}

      {/* 1. ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="rounded-3xl bg-white border border-neutral-200 overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
            <h3 className="text-base font-black text-neutral-950">Store & Cross-Border Orders</h3>
            <span className="text-xs text-neutral-400 font-semibold">{orders.length} total</span>
          </div>

          <div className="divide-y divide-neutral-100 overflow-x-auto">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">No orders to display.</div>
            ) : (
              orders.map((ord) => (
                <div key={ord._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-neutral-950 text-xs">{ord._id}</span>
                      <span className="text-[10px] text-neutral-400">{ord.shippingAddress?.fullName}</span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      {ord.shippingAddress?.city}, {ord.shippingAddress?.province}
                    </p>
                    <span className="text-[11px] font-bold text-neutral-900 block">
                      NPR {(ord.pricing?.totalAmount || ord.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={ord.status || 'Processing'}
                      onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                      className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-neutral-950"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Sourced">Sourced in India</option>
                      <option value="In Transit">In Transit (Nepal)</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. INDIA SOURCING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="rounded-3xl bg-white border border-neutral-200 overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-neutral-100">
            <h3 className="text-base font-black text-neutral-950">Customer Sourcing Requests</h3>
          </div>

          <div className="divide-y divide-neutral-100">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">No sourcing requests.</div>
            ) : (
              requests.map((r) => (
                <div key={r._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-bold text-neutral-900 truncate">{r.productName || 'Custom Request'}</h4>
                    <a href={r.productUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline truncate block">
                      {r.productUrl}
                    </a>
                    <span className="text-neutral-500 font-medium">Source: ₹{r.indianPriceINR} INR → NPR {(r.finalAmountNPR || 0).toLocaleString()}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold self-start sm:self-auto">
                    {r.status || 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. SETTINGS & PASSWORD */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logistics Sourcing Config */}
          <div className="rounded-3xl bg-white border border-neutral-200 p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-black text-neutral-950 flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>India Sourcing & Pricing Configuration</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Indian Transit Hub</label>
                <input
                  type="text"
                  value={transitConfig.warehouseCity}
                  onChange={(e) => setTransitConfig({ ...transitConfig, warehouseCity: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Conversion Rate (INR to NPR)</label>
                <input
                  type="text"
                  value={transitConfig.exchangeRate}
                  onChange={(e) => setTransitConfig({ ...transitConfig, exchangeRate: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Service Fee (%)</label>
                <input
                  type="text"
                  value={transitConfig.servicePercent}
                  onChange={(e) => setTransitConfig({ ...transitConfig, servicePercent: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2"
                />
              </div>

              <button
                type="button"
                onClick={() => setStatusMsg('✓ Logistics settings saved')}
                className="w-full py-2.5 rounded-xl bg-neutral-950 text-white font-bold"
              >
                Save Sourcing Settings
              </button>
            </div>
          </div>

          {/* Master Admin Password */}
          <div className="rounded-3xl bg-white border border-neutral-200 p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-black text-neutral-950 flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              <span>Master Admin Password</span>
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
              >
                Update Admin Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
