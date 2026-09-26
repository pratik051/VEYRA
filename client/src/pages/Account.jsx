import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  HelpCircle,
  Heart,
  LogOut,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  FileText,
  Clock,
  CheckCircle2,
  Send,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { nepalProvinces } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import api from '../services/api';

export function Account() {
  const { user, logout, loading: authLoading } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  // Sub-states
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Address Form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    province: 'Bagmati Province (Province 3)',
    city: 'Kathmandu',
    street: '',
    postalCode: '44600',
    isDefault: true
  });

  // New Support Ticket
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Order Delivery');
  const [ticketMessage, setTicketMessage] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    loadAccountData();
  }, [user, authLoading]);

  const loadAccountData = () => {
    api.get('/api/user/orders').then((ordersRes) => {
      const rawOrders = ordersRes.data?.orders || (Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setOrders(Array.isArray(rawOrders) ? rawOrders : []);
    }).catch((e) => console.error("Error loading orders:", e));

    api.get('/api/user/addresses').then((addrRes) => {
      const rawAddrs = addrRes.data?.addresses || (Array.isArray(addrRes.data) ? addrRes.data : []);
      setAddresses(Array.isArray(rawAddrs) ? rawAddrs : []);
    }).catch((e) => console.error("Error loading addresses:", e));

    api.get('/api/user/product-requests').then((reqRes) => {
      const rawReqs = reqRes.data?.requests || (Array.isArray(reqRes.data) ? reqRes.data : []);
      setProductRequests(Array.isArray(rawReqs) ? rawReqs : []);
    }).catch((e) => console.error("Error loading product requests:", e));

    api.get('/api/user/tickets').then((ticketRes) => {
      const rawTickets = ticketRes.data?.tickets || (Array.isArray(ticketRes.data) ? ticketRes.data : []);
      setTickets(Array.isArray(rawTickets) ? rawTickets : []);
    }).catch((e) => console.error("Error loading tickets:", e));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/user/addresses', newAddr);
      if (res.data?.address) {
        setAddresses([...addresses, res.data.address]);
      } else {
        setAddresses([...addresses, { _id: `addr-${Date.now()}`, ...newAddr }]);
      }
      setShowAddAddress(false);
    } catch {
      setAddresses([...addresses, { _id: `addr-${Date.now()}`, ...newAddr }]);
      setShowAddAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.delete(`/api/user/addresses/${id}`);
      setAddresses(addresses.filter((a) => a._id !== id));
    } catch {
      setAddresses(addresses.filter((a) => a._id !== id));
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    try {
      const payload = {
        subject: ticketSubject,
        category: ticketCategory,
        message: ticketMessage
      };
      const res = await api.post('/api/user/tickets', payload);
      if (res.data?.ticket) {
        setTickets([res.data.ticket, ...tickets]);
      } else {
        setTickets([
          {
            _id: `TCK-${Date.now().toString().slice(-4)}`,
            subject: ticketSubject,
            category: ticketCategory,
            status: 'Open',
            createdAt: new Date().toISOString(),
            messages: [{ sender: 'user', message: ticketMessage, createdAt: new Date().toISOString() }]
          },
          ...tickets
        ]);
      }
      setShowNewTicket(false);
      setTicketSubject('');
      setTicketMessage('');
    } catch {
      setShowNewTicket(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const setTab = (t) => {
    searchParams.set('tab', t);
    setSearchParams(searchParams);
  };

  if (authLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Profile Header */}
      <div className="rounded-3xl bg-neutral-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-neutral-950 text-xl font-black shadow-md">
            {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{user?.fullName || 'Valued Customer'}</h1>
              {user?.role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black uppercase">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">{user?.email || user?.phone || 'Account Member'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-neutral-950 text-xs font-black hover:bg-white transition"
            >
              Control Panel ➔
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/20 text-neutral-300 hover:bg-white/10 text-xs font-bold transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-200 dark:border-[#1b2559]">
        {[
          { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
          { id: 'requests', label: 'India Requests', icon: FileText, count: productRequests.length },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: addresses.length },
          { id: 'tickets', label: 'Support Tickets', icon: HelpCircle, count: tickets.length },
          { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'border-neutral-950 dark:border-amber-400 text-neutral-950 dark:text-amber-400'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="rounded-full bg-neutral-100 dark:bg-[#1b254b] px-1.5 py-0.5 text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-neutral-950 dark:text-white">Order History</h3>
            <Link to="/order" className="text-xs font-bold text-red-600 dark:text-amber-400 underline">
              Order by Link
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] p-12 text-center space-y-3">
              <Package className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mx-auto" />
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">No Orders Found</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                You haven't placed any orders yet. Paste a link from any Indian marketplace to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord._id} className="p-5 rounded-2xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-[#1b2559] text-xs">
                    <div>
                      <span className="font-bold text-neutral-400">Order ID: </span>
                      <span className="font-black text-neutral-950 dark:text-amber-400">{ord._id}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold text-[11px] self-start sm:self-auto">
                      {ord.payment?.status || 'Processing'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {ord.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-bold text-neutral-950 dark:text-white">
                          NPR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-2 border-t border-neutral-100 dark:border-[#1b2559] text-xs font-black text-neutral-950 dark:text-white">
                    <span>Total Amount:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">NPR {(ord.pricing?.totalAmount || ord.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. INDIA PRODUCT ORDERS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-neutral-950 dark:text-white">India Product Orders</h3>
            <Link
              to="/order"
              className="px-4 py-2 rounded-xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-amber-300 transition"
            >
              + New Product Link
            </Link>
          </div>

          {productRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] p-12 text-center space-y-3">
              <FileText className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mx-auto" />
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">No Sourcing Requests Yet</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Found a product on Amazon, Flipkart or Myntra? Paste its URL to request delivery!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {productRequests.map((req) => (
                <div key={req._id} className="p-5 rounded-2xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-neutral-900 dark:text-white">{req.productName || 'Sourced Item'}</span>
                    <span className="text-amber-600 dark:text-amber-400">{req.status || 'Pending Review'}</span>
                  </div>
                  <p className="text-neutral-400 truncate">{req.productUrl}</p>
                  <div className="flex justify-between pt-2 border-t border-neutral-100 dark:border-[#1b2559]">
                    <span className="text-neutral-500 dark:text-neutral-400">Source: ₹{req.indianPriceINR} INR</span>
                    <span className="font-black text-neutral-950 dark:text-amber-400">NPR {(req.finalAmountNPR || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-neutral-950 dark:text-white">Saved Delivery Addresses</h3>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="px-4 py-2 rounded-xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-amber-300 transition"
            >
              + Add Address
            </button>
          </div>

          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="p-6 rounded-3xl bg-neutral-50 dark:bg-[#0b1437] border border-neutral-200 dark:border-[#1b2559] space-y-4">
              <h4 className="text-xs font-black uppercase text-neutral-700 dark:text-neutral-200">New Address Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Recipient Name"
                  value={newAddr.fullName}
                  onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  className="rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] text-neutral-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] text-neutral-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
                <select
                  value={newAddr.province}
                  onChange={(e) => setNewAddr({ ...newAddr, province: e.target.value })}
                  className="rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] text-neutral-900 dark:text-white px-3 py-2 text-xs sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {nepalProvinces.map((p) => (
                    <option key={p} value={p} className="bg-white dark:bg-[#0b1437] text-neutral-900 dark:text-white">{p}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="City (e.g. Kathmandu)"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] text-neutral-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Street / Landmark"
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] text-neutral-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-[#1b2559] text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1b254b] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-amber-300 transition"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr._id} className="p-5 rounded-2xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-900 dark:text-white">{addr.fullName}</span>
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-neutral-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-neutral-600 dark:text-neutral-300">{addr.street}, {addr.city}</p>
                <p className="text-neutral-400">{addr.province}</p>
                <span className="text-neutral-700 dark:text-neutral-300 font-semibold block pt-1">Phone: {addr.phone}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="text-lg font-black text-neutral-950 dark:text-white">Customer Support Tickets</h3>
              <p className="text-xs text-neutral-500 dark:text-[#a3aed0]">Your official support requests and ticket communications</p>
            </div>
            <button
              onClick={() => setShowNewTicket(!showNewTicket)}
              className="px-4 py-2 rounded-xl bg-neutral-950 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-amber-300 transition"
            >
              + Open New Ticket
            </button>
          </div>

          {showNewTicket && (
            <form onSubmit={handleCreateTicket} className="p-6 rounded-3xl bg-neutral-50 dark:bg-[#0b1437] border border-neutral-200 dark:border-[#1b2559] space-y-4">
              <h4 className="text-xs font-black uppercase text-neutral-700 dark:text-neutral-200">Submit Support Inquiry</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Ticket Subject / Order ID"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] text-neutral-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] text-neutral-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="Order Delivery" className="bg-white dark:bg-[#0b1437]">Order & Delivery Status</option>
                  <option value="Payment Verification" className="bg-white dark:bg-[#0b1437]">Payment & QR Verification</option>
                  <option value="India Sourcing Quote" className="bg-white dark:bg-[#0b1437]">India Sourcing & Customs Inquiry</option>
                  <option value="Product Return / Exchange" className="bg-white dark:bg-[#0b1437]">Return / Exchange Request</option>
                </select>
                <textarea
                  placeholder="Describe your issue or query..."
                  rows={3}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] text-neutral-900 dark:text-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-[#1b2559] text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-[#1b254b] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-neutral-950 font-black hover:bg-amber-300 text-xs transition"
                >
                  Submit Ticket ➔
                </button>
              </div>
            </form>
          )}

          {tickets.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] p-12 text-center space-y-3">
              <HelpCircle className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mx-auto" />
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">No Support Tickets</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Need help with an order? Open a ticket above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t._id} className="p-5 rounded-2xl bg-white dark:bg-[#111c44] border border-neutral-200 dark:border-[#1b2559] space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-neutral-900 dark:text-white">{t.subject}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1b254b] text-neutral-700 dark:text-neutral-300 text-[10px]">
                      {t.status || 'Open'}
                    </span>
                  </div>
                  <span className="text-neutral-400 block text-[11px]">{t.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-neutral-950 dark:text-white">Saved Wishlist Items</h3>
          {wishlist.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-200 dark:border-[#1b2559] bg-white dark:bg-[#111c44] p-12 text-center space-y-3">
              <Heart className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mx-auto" />
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Your Wishlist is Empty</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Save products you love while browsing our store.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {wishlist.map((item) => (
                <ProductCard key={item._id || item.id || item.slug} product={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Account;
