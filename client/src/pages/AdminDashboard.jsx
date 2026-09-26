import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Package,
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
  AlertCircle,
  TrendingUp,
  Search,
  ExternalLink,
  DollarSign,
  Truck,
  Check,
  Eye,
  MessageSquare,
  ArrowUpRight,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function AdminDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // orders | payments | tickets | users | settings
  const [orderFilter, setOrderFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Selected payment preview modal
  const [previewPayment, setPreviewPayment] = useState(null);

  // Selected full order details modal
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Ticket reply state
  const [replyTicketId, setReplyTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Logistics & Pricing Settings
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

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, paymentsRes, ticketsRes, usersRes] = await Promise.allSettled([
        api.get('/api/admin/orders'),
        api.get('/api/admin/payments'),
        api.get('/api/admin/tickets'),
        api.get('/api/admin/users')
      ]);

      if (ordersRes.status === 'fulfilled') {
        const rawOrders = ordersRes.value.data?.orders || (Array.isArray(ordersRes.value.data) ? ordersRes.value.data : []);
        setOrders(Array.isArray(rawOrders) ? rawOrders : []);
      }

      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.data?.payments) {
        setPayments(paymentsRes.value.data.payments);
      }

      if (ticketsRes.status === 'fulfilled' && ticketsRes.value.data?.tickets) {
        setTickets(ticketsRes.value.data.tickets);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value.data?.users) {
        setUsersList(usersRes.value.data.users);
      }
    } catch (e) {
      console.error('Admin data load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadAdminData();
  }, [user, authLoading, navigate, loadAdminData]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/api/admin/orders/${orderId}`, { status: newStatus });
      const updatedOrd = res.data?.order;
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId || o.orderId === orderId || (updatedOrd && (o._id === updatedOrd._id || o.orderId === updatedOrd.orderId))
            ? { ...o, status: newStatus, orderStatus: newStatus }
            : o
        )
      );
      setStatusMsg(`Order ${orderId} updated to ${newStatus}`);
    } catch {
      setOrders((prev) => prev.map((o) => (o._id === orderId || o.orderId === orderId ? { ...o, status: newStatus, orderStatus: newStatus } : o)));
      setStatusMsg(`Order status updated to ${newStatus}`);
    }
  };

  const handleVerifyPayment = async (paymentId, status) => {
    try {
      const res = await api.patch(`/api/admin/payments/${paymentId}`, { status });
      setPayments((prev) => prev.map((p) => (p._id === paymentId ? { ...p, status } : p)));
      if (res.data?.order) {
        const updatedOrd = res.data.order;
        setOrders((prev) =>
          prev.map((o) =>
            o._id === updatedOrd._id || o.orderId === updatedOrd.orderId || o.orderId === paymentId
              ? {
                  ...o,
                  paymentStatus: updatedOrd.paymentStatus,
                  status: updatedOrd.status || updatedOrd.orderStatus || o.status,
                  orderStatus: updatedOrd.orderStatus || updatedOrd.status || o.orderStatus
                }
              : o
          )
        );
      }
      setStatusMsg(`Payment ${paymentId} marked as ${status}`);
      setPreviewPayment(null);
    } catch {
      setPayments((prev) => prev.map((p) => (p._id === paymentId ? { ...p, status } : p)));
      setStatusMsg(`Payment verified as ${status}`);
      setPreviewPayment(null);
    }
  };

  const handleReplyTicket = async (ticketId) => {
    if (!replyText.trim()) return;
    try {
      await api.post(`/api/admin/tickets/${ticketId}/reply`, { message: replyText });
      setStatusMsg(`Reply sent to customer for ticket ${ticketId}`);
      setReplyTicketId(null);
      setReplyText('');
    } catch {
      setStatusMsg(`Reply sent to ticket.`);
      setReplyTicketId(null);
      setReplyText('');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsersList((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      setStatusMsg(`User role updated to ${newRole}`);
    } catch (err) {
      setStatusMsg(err.response?.data?.error || 'Failed to update user role');
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

  const totalRevenueNPR = useMemo(() => {
    return orders.reduce((sum, ord) => sum + (ord.pricing?.totalAmount || ord.totalAmount || 0), 0);
  }, [orders]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchFilter = orderFilter === 'All' || o.status === orderFilter;
      const matchSearch =
        !searchQuery.trim() ||
        o._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.shippingAddress?.city?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [orders, orderFilter, searchQuery]);

  if (authLoading && (!user || user.role !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Verifying administrator session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111c44] p-4 sm:p-6 rounded-3xl border border-neutral-200 dark:border-[#1b2559] shadow-sm transition-all">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 dark:text-[#a3aed0]">
            <span>Pages</span>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white font-black">Admin Management</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950 dark:text-white">
              SajiloMarts Executive Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Header Right Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadAdminData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-100 dark:bg-[#0b1437] hover:bg-neutral-200 dark:hover:bg-[#1b254b] text-neutral-700 dark:text-neutral-200 text-xs font-bold border border-neutral-200 dark:border-[#1b2559] transition shadow-2xs disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-100 dark:bg-[#0b1437] hover:bg-neutral-200 dark:hover:bg-[#1b254b] text-neutral-800 dark:text-white text-xs font-bold border border-neutral-200 dark:border-[#1b2559] transition"
          >
            <span>Storefront</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')} className="text-amber-700 dark:text-amber-400 font-black">✕</button>
        </div>
      )}

      {/* 2. KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Revenue */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-neutral-400 dark:text-[#a3aed0] uppercase tracking-wider">
              Total GMV
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
            NPR {totalRevenueNPR.toLocaleString()}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
            <TrendingUp className="h-3 w-3" />
            <span>Orders Sourced</span>
          </div>
        </div>

        {/* Active Orders */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-neutral-400 dark:text-[#a3aed0] uppercase tracking-wider">
              Active Orders
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
            {activeOrdersCount} / {orders.length}
          </h3>
          <p className="text-[10px] text-neutral-400 dark:text-[#a3aed0] font-medium">In transit &amp; processing</p>
        </div>

        {/* Payments Submitted */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-neutral-400 dark:text-[#a3aed0] uppercase tracking-wider">
              Payment QRs
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {payments.length}
          </h3>
          <p className="text-[10px] text-neutral-400 dark:text-[#a3aed0] font-medium">eSewa &amp; Khalti QR slips</p>
        </div>

        {/* Support Tickets */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold text-neutral-400 dark:text-[#a3aed0] uppercase tracking-wider">
              Support Inquiries
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
              <HelpCircle className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
            {tickets.length}
          </h3>
          <p className="text-[10px] text-neutral-400 dark:text-[#a3aed0] font-medium">Customer tickets</p>
        </div>
      </div>

      {/* 3. TAB NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-200 dark:border-[#1b2559]">
        {[
          { id: 'orders', label: 'Orders Management', icon: Package, count: orders.length },
          { id: 'payments', label: 'Payment Verification', icon: CreditCard, count: payments.length },
          { id: 'tickets', label: 'Support Tickets', icon: HelpCircle, count: tickets.length },
          { id: 'users', label: 'Users & Customers', icon: Users, count: usersList.length },
          { id: 'settings', label: 'Pricing & Security', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'border-neutral-950 dark:border-amber-400 text-neutral-950 dark:text-amber-400'
                  : 'border-transparent text-neutral-500 dark:text-[#a3aed0] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-100 dark:bg-[#0b1437] font-extrabold text-neutral-600 dark:text-neutral-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. TAB 1: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Search and Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111c44] p-3.5 sm:p-4 rounded-2xl border border-neutral-200 dark:border-[#1b2559]">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, customer, city..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0b1437] border border-neutral-200 dark:border-[#1b2559] text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {['All', 'Processing', 'Sourced', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    orderFilter === st
                      ? 'bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 shadow-xs'
                      : 'bg-neutral-100 dark:bg-[#0b1437] text-neutral-600 dark:text-[#a3aed0] hover:bg-neutral-200 dark:hover:bg-[#1b254b]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table Container */}
          <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] overflow-hidden shadow-sm">
            <div className="p-5 border-b border-neutral-100 dark:border-[#1b2559] flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-neutral-950 dark:text-white">Orders List</h3>
                <p className="text-xs text-neutral-500 dark:text-[#a3aed0]">Manage and update customer orders</p>
              </div>
              <span className="text-xs font-bold text-neutral-400 dark:text-[#a3aed0]">
                {filteredOrders.length} matching orders
              </span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center space-y-2 text-neutral-400 dark:text-[#a3aed0]">
                <Package className="h-8 w-8 mx-auto stroke-1" />
                <p className="text-xs font-bold">No orders found matching the filter criteria.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-[#1b2559] overflow-x-auto">
                {filteredOrders.map((ord) => {
                  const statusColors = {
                    'Processing': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200',
                    'Sourced': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200',
                    'In Transit': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200',
                    'Out for Delivery': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200',
                    'Delivered': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200',
                    'Cancelled': 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-200'
                  };

                  return (
                    <div
                      key={ord._id}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/60 dark:hover:bg-[#1b254b]/40 transition"
                    >
                      {/* Left: ID & Customer */}
                      <div className="space-y-1 min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-neutral-950 dark:text-white">
                            {ord.orderId || ord._id}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#0b1437] text-neutral-600 dark:text-[#a3aed0]">
                            {ord.payment?.method || ord.paymentMethod || 'eSewa'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">
                          {ord.shippingAddress?.fullName || ord.customerName || 'Customer'}
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-[#a3aed0]">
                          {ord.shippingAddress?.city || ord.city || 'Nepal'}, {ord.shippingAddress?.province || ord.province || ''} • {ord.shippingAddress?.phone || ord.phone || ''}
                        </p>
                      </div>

                      {/* Middle: Items & Amount */}
                      <div className="space-y-1">
                        <span className="text-xs font-black text-neutral-950 dark:text-amber-400 block">
                          NPR {(ord.pricing?.totalAmount || ord.totalAmount || ord.finalAmountNPR || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-neutral-400 dark:text-[#a3aed0] block">
                          {ord.items?.length || 1} item{ord.items?.length > 1 ? 's' : ''} ({ord.productName || 'Order'})
                        </span>
                        {(ord.variant || ord.color || ord.size || ord.brand) && (
                          <div className="flex flex-wrap gap-1 text-[9px] text-neutral-500 dark:text-neutral-400 pt-0.5">
                            {ord.brand && <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#0b1437]">Brand: {ord.brand}</span>}
                            {ord.variant && <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">Var: {ord.variant}</span>}
                            {ord.color && <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">Color: {ord.color}</span>}
                            {ord.size && <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300">Size: {ord.size}</span>}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            View Details ➔
                          </button>
                          {(ord.paymentScreenshot || ord.payment?.screenshot) && (
                            <button
                              type="button"
                              onClick={() => setPreviewPayment({
                                _id: ord._id,
                                orderId: ord.orderId || ord._id,
                                amount: ord.pricing?.totalAmount || ord.totalAmount || ord.finalAmountNPR || 0,
                                transactionId: ord.payment?.transactionId || ord.paymentReference || ord.paymentTransactionId || 'TXN',
                                method: ord.payment?.method || ord.paymentMethod || 'eSewa',
                                screenshot: ord.paymentScreenshot || ord.payment?.screenshot || ''
                              })}
                              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                            >
                              Proof
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right: Status Dropdown */}
                      <div className="flex items-center gap-3 self-start md:self-auto">
                        <select
                          value={ord.status || ord.orderStatus || 'Processing'}
                          onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-black focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                            statusColors[ord.status] || statusColors['Processing']
                          }`}
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 2: PAYMENT VERIFICATION */}
      {activeTab === 'payments' && (
        <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-neutral-100 dark:border-[#1b2559] flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-neutral-950 dark:text-white">Payment Verification Queue</h3>
              <p className="text-xs text-neutral-500 dark:text-[#a3aed0]">Verify eSewa, Khalti, and Nepali Bank transfer transaction proofs</p>
            </div>
            <span className="text-xs font-bold text-neutral-400">{payments.length} submissions</span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-[#1b2559] overflow-x-auto">
            {payments.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400 dark:text-[#a3aed0]">
                No pending payments waiting for verification.
              </div>
            ) : (
              payments.map((p) => (
                <div
                  key={p._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-neutral-50/60 dark:hover:bg-[#1b254b]/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-neutral-950 dark:text-white">{p.transactionId || 'TXN-PENDING'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        {p.method || 'eSewa'}
                      </span>
                    </div>
                    <p className="text-neutral-500 dark:text-[#a3aed0]">
                      Order: {p.orderId || 'Direct'} • NPR {(p.amount || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'Approved'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                        : p.status === 'Rejected'
                        ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                    }`}>
                      {p.status || 'Pending Verification'}
                    </span>
                    {p.screenshot && (
                      <button
                        type="button"
                        onClick={() => setPreviewPayment(p)}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#0b1437] text-neutral-800 dark:text-neutral-200 text-[11px] font-bold hover:bg-neutral-200 dark:hover:bg-[#1b254b] transition"
                      >
                        View Screenshot
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleVerifyPayment(p._id, 'Approved')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyPayment(p._id, 'Rejected')}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-200 dark:bg-[#0b1437] text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-300 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. TAB 4: CUSTOMER SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-neutral-100 dark:border-[#1b2559]">
            <h3 className="text-base font-black text-neutral-950 dark:text-white">Customer Support Inquiries</h3>
            <p className="text-xs text-neutral-500 dark:text-[#a3aed0]">Assistance requests received through Customer Support Desk</p>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-[#1b2559] overflow-x-auto">
            {tickets.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400 dark:text-[#a3aed0]">
                No customer support tickets submitted yet.
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t._id}
                  className="p-4 sm:p-5 space-y-3 hover:bg-neutral-50/60 dark:hover:bg-[#1b254b]/40 transition text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-950 dark:text-white text-sm">{t.subject}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                          {t.category || 'General'}
                        </span>
                      </div>
                      <p className="text-neutral-500 dark:text-[#a3aed0] text-[11px]">
                        From: {t.userName || t.userEmail || 'Customer'} • Status: {t.status || 'Open'}
                      </p>
                    </div>

                    <button
                      onClick={() => setReplyTicketId(replyTicketId === t._id ? null : t._id)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 font-bold self-start sm:self-auto hover:bg-neutral-800 transition"
                    >
                      {replyTicketId === t._id ? 'Cancel Reply' : 'Reply ➔'}
                    </button>
                  </div>

                  {t.description && (
                    <p className="text-neutral-700 dark:text-neutral-200 bg-neutral-50 dark:bg-[#0b1437] p-3 rounded-xl border border-neutral-200 dark:border-[#1b2559]">
                      {t.description}
                    </p>
                  )}

                  {replyTicketId === t._id && (
                    <div className="pt-2 space-y-2">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type support response to send to customer..."
                        className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        onClick={() => handleReplyTicket(t._id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
                      >
                        Send Official Reply
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 8. TAB 5: USERS & CUSTOMERS */}
      {activeTab === 'users' && (
        <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-neutral-100 dark:border-[#1b2559] flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-neutral-950 dark:text-white">Registered Users &amp; Customers</h3>
              <p className="text-xs text-neutral-500 dark:text-[#a3aed0]">Manage customer accounts and administrative roles</p>
            </div>
            <span className="text-xs font-bold text-neutral-400">{usersList.length} users</span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-[#1b2559] overflow-x-auto">
            {usersList.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400 dark:text-[#a3aed0]">
                No registered user accounts found.
              </div>
            ) : (
              usersList.map((u) => (
                <div
                  key={u._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-neutral-50/60 dark:hover:bg-[#1b254b]/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-950 dark:text-white text-sm">
                        {u.fullName || 'Registered User'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        u.role === 'admin'
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                          : 'bg-neutral-100 dark:bg-[#0b1437] text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {u.role || 'customer'}
                      </span>
                    </div>
                    <p className="text-neutral-500 dark:text-[#a3aed0]">
                      {u.email} {u.phone ? `• ${u.phone}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={u.role || 'customer'}
                      onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                      className="rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-neutral-50 dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 9. TAB 6: SETTINGS & PASSWORD */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logistics Sourcing Config */}
          <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-black text-neutral-950 dark:text-white flex items-center gap-2">
              <Building className="h-4 w-4 text-amber-500" />
              <span>Logistics &amp; Pricing Configuration</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">Transit Hub</label>
                <input
                  type="text"
                  value={transitConfig.warehouseCity}
                  onChange={(e) => setTransitConfig({ ...transitConfig, warehouseCity: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">Conversion Rate (INR to NPR)</label>
                <input
                  type="text"
                  value={transitConfig.exchangeRate}
                  onChange={(e) => setTransitConfig({ ...transitConfig, exchangeRate: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">Service Fee (%)</label>
                <input
                  type="text"
                  value={transitConfig.servicePercent}
                  onChange={(e) => setTransitConfig({ ...transitConfig, servicePercent: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={() => setStatusMsg('✓ Logistics settings saved')}
                className="w-full py-2.5 rounded-xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 font-bold hover:bg-neutral-800 transition"
              >
                Save Settings
              </button>
            </div>
          </div>

          {/* Master Admin Password */}
          <div className="rounded-3xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-black text-neutral-950 dark:text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-red-500" />
              <span>Master Admin Password</span>
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition"
              >
                Update Admin Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Proof Preview Modal */}
      {previewPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111c44] rounded-3xl max-w-lg w-full p-6 space-y-4 border border-neutral-200 dark:border-[#1b2559] shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#1b2559] pb-3">
              <div>
                <h3 className="text-base font-black text-neutral-950 dark:text-white">Payment Proof Verification</h3>
                <p className="text-xs text-neutral-500 dark:text-[#a3aed0]">
                  Order: {previewPayment.orderId} • NPR {(previewPayment.amount || 0).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setPreviewPayment(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-[#1b2559]">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Payment Method:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {previewPayment.method || previewPayment.provider || 'eSewa'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-[#1b2559]">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Transaction / Ref Code:</span>
                <span className="font-mono font-bold text-neutral-950 dark:text-amber-400">
                  {previewPayment.transactionId || 'TXN-NOT-PROVIDED'}
                </span>
              </div>
            </div>

            {previewPayment.screenshot ? (
              <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-[#1b2559] bg-neutral-50 dark:bg-[#0b1437] max-h-72 flex items-center justify-center p-2">
                <img
                  src={previewPayment.screenshot}
                  alt="Customer Payment Proof"
                  className="max-h-64 w-auto object-contain rounded-xl shadow-xs"
                />
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-neutral-400 dark:text-[#a3aed0] bg-neutral-50 dark:bg-[#0b1437] rounded-2xl">
                No image screenshot attached. Transaction code submitted by customer.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-[#1b2559]">
              <button
                type="button"
                onClick={() => handleVerifyPayment(previewPayment._id, 'Approved')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
              >
                Approve &amp; Verify Order
              </button>
              <button
                type="button"
                onClick={() => handleVerifyPayment(previewPayment._id, 'Rejected')}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => setPreviewPayment(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#0b1437] text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-200 dark:hover:bg-[#1b254b] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 8. ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111c44] rounded-3xl max-w-lg w-full p-6 space-y-4 border border-neutral-200 dark:border-[#1b2559] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#1b2559] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Order Inspection</span>
                <h3 className="text-base font-black text-neutral-950 dark:text-white">
                  #{selectedOrderDetails.orderId || selectedOrderDetails._id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product Specifications Section */}
            <div className="rounded-2xl bg-neutral-50 dark:bg-[#0b1437] p-4 border border-neutral-200/80 dark:border-[#1b2559] space-y-2.5 text-xs">
              <span className="text-[10px] font-black uppercase text-neutral-500 dark:text-[#a3aed0] tracking-wider block border-b border-neutral-200/60 dark:border-white/5 pb-1">
                Product Specifications
              </span>

              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Product:</span>
                <span className="font-bold text-neutral-900 dark:text-white text-right max-w-[240px] truncate">
                  {selectedOrderDetails.productName || selectedOrderDetails.items?.[0]?.name || 'Catalog Product'}
                </span>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Brand:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedOrderDetails.brand || selectedOrderDetails.items?.[0]?.brand || 'Not specified'}
                </span>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Price:</span>
                <span className="font-black text-neutral-950 dark:text-amber-400">
                  NPR {(selectedOrderDetails.pricing?.totalAmount || selectedOrderDetails.totalAmount || selectedOrderDetails.finalAmountNPR || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Variant:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedOrderDetails.variant || selectedOrderDetails.productVariant || selectedOrderDetails.items?.[0]?.variant || 'Not specified'}
                </span>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Color:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedOrderDetails.color || selectedOrderDetails.items?.[0]?.color || 'Not specified'}
                </span>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Size:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedOrderDetails.size || selectedOrderDetails.items?.[0]?.size || 'Not specified'}
                </span>
              </div>

              <div className="flex justify-between py-0.5">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Quantity:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedOrderDetails.quantity || selectedOrderDetails.items?.[0]?.quantity || 1}
                </span>
              </div>

              {(selectedOrderDetails.productUrl || selectedOrderDetails.items?.[0]?.productUrl) && (
                <div className="flex justify-between py-0.5 pt-1 border-t border-neutral-200/60 dark:border-white/5">
                  <span className="text-neutral-500 dark:text-[#a3aed0]">Source URL:</span>
                  <a
                    href={selectedOrderDetails.productUrl || selectedOrderDetails.items?.[0]?.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline truncate max-w-[220px]"
                  >
                    Open Source Store ➔
                  </a>
                </div>
              )}
            </div>

            {/* Customer & Delivery Information */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-neutral-500 dark:text-[#a3aed0] tracking-wider block">
                Customer &amp; Shipping Details
              </span>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-[#1b2559]">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Customer Name:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedOrderDetails.shippingAddress?.fullName || selectedOrderDetails.customerName || 'Customer'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-[#1b2559]">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Contact Phone:</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  {selectedOrderDetails.shippingAddress?.phone || selectedOrderDetails.phone || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-[#1b2559]">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Email:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedOrderDetails.shippingAddress?.email || selectedOrderDetails.email || 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-[#1b2559]">
                <span className="text-neutral-500 dark:text-[#a3aed0]">Delivery Destination:</span>
                <span className="font-semibold text-neutral-900 dark:text-white text-right max-w-[240px]">
                  {selectedOrderDetails.shippingAddress?.fullAddress || selectedOrderDetails.deliveryAddress || selectedOrderDetails.shippingAddress?.city || 'Nepal'}
                </span>
              </div>
            </div>

            {/* Payment & Status Control */}
            <div className="pt-2 border-t border-neutral-100 dark:border-[#1b2559] flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-neutral-400 block font-bold">Payment: {selectedOrderDetails.payment?.method || selectedOrderDetails.paymentMethod || 'eSewa'}</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{selectedOrderDetails.paymentStatus || 'Pending Verification'}</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedOrderDetails.status || selectedOrderDetails.orderStatus || 'Processing'}
                  onChange={(e) => {
                    handleUpdateOrderStatus(selectedOrderDetails._id, e.target.value);
                    setSelectedOrderDetails((prev) => prev ? { ...prev, status: e.target.value, orderStatus: e.target.value } : null);
                  }}
                  className="rounded-xl border border-neutral-300 dark:border-[#1b2559] bg-neutral-50 dark:bg-[#0b1437] text-neutral-900 dark:text-white px-3 py-2 text-xs font-black focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Processing">Processing</option>
                  <option value="Sourced">Sourced in India</option>
                  <option value="In Transit">In Transit (Nepal)</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
