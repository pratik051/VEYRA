"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { products, nepalProvinces } from "@/lib/data";
import { ProductCard } from "@/components/ui/product-card";
import { formatNpr } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import { ProductRequestItem } from "@/lib/types";
import { MarketplaceLogo } from "@/components/ui/marketplace-logos";
import { LinkovaHeaderBrand } from "@/components/ui/linkova-brand-logo";

export type CustomerOrder = {
  _id: string;
  orderId: string;
  invoiceNumber: string;
  invoiceUrl?: string;
  isIndiaOrder: boolean;
  productName: string;
  productImage?: string;
  productUrl?: string;
  marketplace?: string;
  quantity: number;
  variant?: string;
  size?: string;
  color?: string;
  indianPriceINR?: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress?: {
    customerName: string;
    phone: string;
    deliveryAddress: string;
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
    deliveryInstructions?: string;
  };
  createdAt: string;
};

type NavTab = "dashboard" | "orders" | "requests" | "wishlist" | "settings";

type AccountUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  province?: string;
  district?: string;
  city?: string;
  ward?: string;
  fullAddress?: string;
  landmark?: string;
};

// BankDash Icon Components
function DashboardIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function OrdersIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function RequestsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function WishlistIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function SettingsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function BellIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function AccountContent() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab")?.toLowerCase();

  const [activeTab, setActiveTab] = useState<NavTab>(
    rawTab === "orders"
      ? "orders"
      : rawTab === "requests" || rawTab === "product-requests"
      ? "requests"
      : rawTab === "wishlist"
      ? "wishlist"
      : rawTab === "settings" || rawTab === "profile"
      ? "settings"
      : "dashboard"
  );

  const [user, setUser] = useState<AccountUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [requests, setRequests] = useState<ProductRequestItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search & Filter within Dashboard / Orders
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Settings Subtab
  const [settingsTab, setSettingsTab] = useState<"profile" | "shipping" | "security">("profile");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    city: "",
    ward: "",
    fullAddress: "",
    landmark: ""
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address Management State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: "",
    phone: "",
    province: "Bagmati",
    district: "",
    city: "",
    ward: "",
    fullAddress: "",
    landmark: "",
    label: "Home",
    isDefault: false
  });

  // Quick Sourcing Input inside Dashboard (BankDash Quick Transfer Style)
  const [quickSourcingUrl, setQuickSourcingUrl] = useState("");
  const [quickInrPrice, setQuickInrPrice] = useState("");

  const { ids, clear: clearWishlist } = useWishlist();
  const { pushToast } = useToast();

  const loadAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/user/addresses", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.addresses)) {
          setSavedAddresses(data.addresses);
        }
      }
    } catch (err) {
      console.error("Failed to load saved addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  const loadMe = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "same-origin",
        cache: "no-store"
      });
      if (!response.ok) throw new Error("Unauthenticated");
      const data = await response.json();
      const dataUser = data.user || null;
      setUser(dataUser);
      if (dataUser) {
        setProfileForm({
          fullName: dataUser.fullName || "",
          phone: dataUser.phone || "",
          province: dataUser.province || "",
          district: dataUser.district || "",
          city: dataUser.city || "",
          ward: dataUser.ward || "",
          fullAddress: dataUser.fullAddress || "",
          landmark: dataUser.landmark || ""
        });
        setNewAddressForm((prev) => ({
          ...prev,
          fullName: dataUser.fullName || "",
          phone: dataUser.phone || ""
        }));
      }
    } catch {
      setUser(null);
    } finally {
      setAuthChecking(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/user/orders", {
        credentials: "same-origin",
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.error("Failed to load customer orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user, loadAddresses]);

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}/default`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast("Default address updated.", "success");
        loadAddresses();
      } else {
        pushToast(data.error || "Failed to set default address.", "error");
      }
    } catch {
      pushToast("Network error setting default address.", "error");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery address?")) return;
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast("Address deleted successfully.", "success");
        loadAddresses();
      } else {
        pushToast(data.error || "Failed to delete address.", "error");
      }
    } catch {
      pushToast("Network error deleting address.", "error");
    }
  };

  const handleAddAddress = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddressSubmitting(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddressForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast("New delivery address saved!", "success");
        setShowAddAddressForm(false);
        setNewAddressForm({
          fullName: user?.fullName || "",
          phone: user?.phone || "",
          province: "Bagmati",
          district: "",
          city: "",
          ward: "",
          fullAddress: "",
          landmark: "",
          label: "Home",
          isDefault: false
        });
        loadAddresses();
      } else {
        pushToast(data.error || "Failed to add address.", "error");
      }
    } catch {
      pushToast("Network error adding address.", "error");
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    pushToast("Signed out successfully.", "info");
    window.location.href = "/login";
  };

  const saveProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const response = await fetch("/api/auth/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      });
      const data = await response.json();
      if (!response.ok) {
        pushToast(data.error || "Failed to update profile.", "error");
        return;
      }
      setUser(data.user || null);
      pushToast("Profile updated successfully!", "success");
    } catch {
      pushToast("Network error updating profile.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Derived Metrics (BankDash style KPI Cards)
  const totalSpentNPR = useMemo(() => {
    return orders
      .filter((o) => o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  const activeInTransitCount = useMemo(() => {
    return orders.filter(
      (o) =>
        o.orderStatus === "Confirmed" ||
        o.orderStatus === "Processing" ||
        o.orderStatus === "Shipped" ||
        o.orderStatus === "In Transit"
    ).length;
  }, [orders]);

  const deliveredCount = useMemo(() => {
    return orders.filter((o) => o.orderStatus === "Delivered").length;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (orderStatusFilter !== "all") {
      list = list.filter(
        (o) => o.orderStatus.toLowerCase() === orderStatusFilter.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          (o.marketplace && o.marketplace.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, orderStatusFilter, searchQuery]);

  const wishedProducts = useMemo(() => {
    return products.filter((p) => ids.includes(p.id));
  }, [ids]);

  if (authChecking) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center gap-3 bg-[#F5F7FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        <span className="text-xs font-semibold text-slate-500">Loading BankDash Customer Workspace...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[650px] flex items-center justify-center p-4 sm:p-8 bg-[#F5F7FA]">
        <div className="max-w-md w-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-3xl">
            🔒
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Portal Access</h2>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Sign in to manage your India sourcing orders, access live delivery tracking, view billing invoices, and update delivery addresses.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/login?redirect=/account"
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              Sign In to Your Workspace ➔
            </Link>
            <Link
              href="/signup?redirect=/account"
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold text-xs transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex text-slate-800">
      {/* ─── 1. BANKDASH SLEEK LEFT SIDEBAR ─── */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 space-y-8">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2">
              <LinkovaHeaderBrand theme="light" />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links (BankDash Style) */}
          <nav className="space-y-1.5">
            {[
              { id: "dashboard" as NavTab, label: "Dashboard", icon: <DashboardIcon /> },
              { id: "orders" as NavTab, label: "My Orders", icon: <OrdersIcon />, count: orders.length },
              { id: "requests" as NavTab, label: "Sourcing Quotes", icon: <RequestsIcon />, count: requests.length },
              { id: "wishlist" as NavTab, label: "Saved Wishlist", icon: <WishlistIcon />, count: ids.length },
              { id: "settings" as NavTab, label: "Settings & Profile", icon: <SettingsIcon /> }
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {typeof item.count === "number" && item.count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Mini Card & Logout at Bottom */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
              {user.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200/80"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2">
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold text-center transition"
              >
                Admin Panel ➔
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-[11px] font-bold text-center transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ─── 2. MAIN DASHBOARD CONTENT AREA ─── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar (BankDash Style) */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 cursor-pointer"
            >
              ☰
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 capitalize tracking-tight">
                {activeTab === "dashboard" && "Overview"}
                {activeTab === "orders" && "My Orders & Shipments"}
                {activeTab === "requests" && "Live Sourcing Quotes"}
                {activeTab === "wishlist" && "Saved Wishlist"}
                {activeTab === "settings" && "Account Settings"}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Welcome back, <strong>{user.fullName}</strong> • Direct India ➔ Nepal Portal
              </p>
            </div>
          </div>

          {/* Search, Back to Home, Notifications, Profile Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200"
            >
              <span>←</span>
              <span className="hidden xs:inline">Back to Home</span>
              <span className="xs:hidden">Home</span>
            </Link>

            <div className="relative hidden lg:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, products..."
                className="w-44 lg:w-56 rounded-full bg-[#F5F7FA] border border-transparent focus:border-blue-500 focus:bg-white pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              aria-label="Settings"
              className="h-9 w-9 rounded-full bg-[#F5F7FA] hover:bg-slate-100 flex items-center justify-center text-slate-600 transition cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            <Link
              href="/request-product"
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-blue-600/20 transition hidden sm:inline-flex items-center gap-1.5"
            >
              <span>+ New Order</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-4 sm:p-8 space-y-8 flex-1">
          {/* ─── TAB 1: USER-FRIENDLY OVERVIEW (Direct Orders & Sourcing Tracker) ─── */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Row 1: 4 Friendly Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl flex-shrink-0">
                    📦
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                    <h3 className="text-base sm:text-2xl font-black text-slate-900">{orders.length}</h3>
                    <p className="text-[10px] text-slate-400">Total Placed</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl flex-shrink-0">
                    🚚
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Transit</p>
                    <h3 className="text-base sm:text-2xl font-black text-amber-600">{activeInTransitCount}</h3>
                    <p className="text-[10px] text-slate-400">On The Way</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">
                    ✅
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Delivered</p>
                    <h3 className="text-base sm:text-2xl font-black text-emerald-600">{deliveredCount}</h3>
                    <p className="text-[10px] text-slate-400">Received Safely</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                    🤍
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saved Wishlist</p>
                    <h3 className="text-base sm:text-2xl font-black text-slate-900">{ids.length}</h3>
                    <p className="text-[10px] text-slate-400">Favorite Items</p>
                  </div>
                </div>
              </div>

              {/* Row 2: Recent Orders & Quick Order Action */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 8 Cols: What You Ordered (Recent Live Orders) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900">Your Recent Orders</h2>
                      <p className="text-xs text-slate-500">Live status of your India ➔ Nepal packages</p>
                    </div>
                    {orders.length > 0 && (
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        View All Orders ({orders.length}) ➔
                      </button>
                    )}
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-dashed border-slate-300 space-y-3">
                      <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-3xl mx-auto">
                        🛍️
                      </div>
                      <h3 className="text-base font-bold text-slate-900">You haven&apos;t placed any orders yet</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Found something you love on Amazon India, Flipkart, Myntra, boAt, or Croma? Order directly through LINKOVA with transparent NPR pricing.
                      </p>
                      <Link
                        href="/request-product"
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-blue-600/20 transition"
                      >
                        <span>🇮🇳 Order Indian Product Now</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 4).map((ord) => (
                        <div
                          key={ord.orderId}
                          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-black text-xs sm:text-sm text-slate-900">
                                {ord.orderId}
                              </span>
                              {ord.marketplace && (
                                <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700">
                                  <MarketplaceLogo marketplace={ord.marketplace} className="h-3 w-auto" />
                                  <span>{ord.marketplace}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                  ord.orderStatus === "Delivered"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : ord.orderStatus === "Cancelled"
                                    ? "bg-rose-50 text-rose-800 border-rose-200"
                                    : "bg-blue-50 text-blue-800 border-blue-200"
                                }`}
                              >
                                {ord.orderStatus}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(ord.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                              {ord.productImage ? (
                                <img
                                  src={ord.productImage}
                                  alt={ord.productName}
                                  className="h-12 w-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                                  📦
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                  {ord.productName}
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  Qty: <strong>{ord.quantity}</strong> • Landed Total: <strong className="text-slate-900">{formatNpr(ord.total)}</strong>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(ord)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                              >
                                Details
                              </button>
                              <Link
                                href={`/track-order?orderId=${ord.orderId}`}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
                              >
                                Track ➔
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right 4 Cols: Quick Cross-Border Sourcing & Delivery Steps */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Quick Order by URL */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Order by Indian Link</h3>
                      <p className="text-[11px] text-slate-400">
                        Paste any link from Amazon, Flipkart, Myntra, or boAt.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Product URL
                        </label>
                        <input
                          type="url"
                          value={quickSourcingUrl}
                          onChange={(e) => setQuickSourcingUrl(e.target.value)}
                          placeholder="https://www.amazon.in/dp/..."
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Price in India (INR ₹)
                        </label>
                        <input
                          type="number"
                          value={quickInrPrice}
                          onChange={(e) => setQuickInrPrice(e.target.value)}
                          placeholder="e.g. 2499"
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                        />
                      </div>

                      <Link
                        href={`/request-product?url=${encodeURIComponent(quickSourcingUrl)}&inr=${quickInrPrice}`}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 text-center transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                      >
                        <span>⚡ Calculate Landed NPR Quote</span>
                      </Link>
                    </div>
                  </div>

                  {/* Delivery Pipeline Progress */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <h3 className="text-sm font-black text-slate-900">Delivery Status Breakdown</h3>
                    <div className="space-y-3 pt-1">
                      {[
                        { label: "Orders Placed & Verified", count: orders.length, color: "bg-blue-600" },
                        { label: "Cross-Border Transit / Customs", count: activeInTransitCount, color: "bg-amber-500" },
                        { label: "Delivered to Doorstep in Nepal", count: deliveredCount, color: "bg-emerald-500" }
                      ].map((step, idx) => {
                        const pct = orders.length > 0 ? Math.round((step.count / orders.length) * 100) : 0;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-600">{step.label}</span>
                              <span className="text-slate-900 font-bold">{step.count}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${step.color} rounded-full transition-all duration-500`}
                                style={{ width: `${pct > 0 ? pct : 4}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: MY ORDERS (BankDash Table / Cards) ─── */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Filter Tabs & Search */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: "All Orders" },
                    { id: "processing", label: "Processing" },
                    { id: "in transit", label: "In Transit" },
                    { id: "delivered", label: "Delivered" },
                    { id: "cancelled", label: "Cancelled" }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setOrderStatusFilter(st.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                        orderStatusFilter === st.id
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => fetchOrders()}
                  disabled={ordersLoading}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition self-start sm:self-auto cursor-pointer"
                >
                  ↻ Refresh Orders
                </button>
              </div>

              {/* Orders Grid */}
              {ordersLoading && orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                  <div className="h-7 w-7 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">Loading live orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                  <p className="text-3xl">📦</p>
                  <h3 className="text-base font-bold text-slate-900">No orders found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You haven&apos;t placed any orders matching this criteria yet.
                  </p>
                  <Link
                    href="/request-product"
                    className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition"
                  >
                    + Order From India Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-sm text-slate-900">{ord.orderId}</span>
                          {ord.marketplace && (
                            <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-800">
                              <MarketplaceLogo marketplace={ord.marketplace} className="h-3 w-auto" />
                              <span>{ord.marketplace}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-0.5 text-[11px] font-bold border ${
                              ord.orderStatus === "Delivered"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : ord.orderStatus === "Cancelled"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-blue-50 text-blue-800 border-blue-200"
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-8 flex items-start gap-3">
                          {ord.productImage ? (
                            <img
                              src={ord.productImage}
                              alt={ord.productName}
                              className="h-16 w-16 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                              📦
                            </div>
                          )}
                          <div className="space-y-1">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2">
                              {ord.productName}
                            </h4>
                            <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                              <span>Qty: <strong>{ord.quantity}</strong></span>
                              {ord.variant && <span>• Variant: <strong>{ord.variant}</strong></span>}
                            </div>
                            {ord.productUrl && (
                              <a
                                href={ord.productUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                              >
                                View Indian Product Link ↗
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-4 md:text-right space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Landed Price (NPR)</span>
                          <p className="text-lg font-black text-slate-900">{formatNpr(ord.total)}</p>
                          <span className="text-[10px] text-slate-500 block">
                            Payment: <strong>{ord.paymentStatus}</strong> ({ord.paymentMethod})
                          </span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          🔍 Order Details
                        </button>
                        <a
                          href={ord.invoiceUrl || `/api/india-order/invoice/${ord.orderId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition inline-flex items-center gap-1"
                        >
                          <span>🖨️ PDF Invoice</span>
                        </a>
                        <Link
                          href={`/track-order?orderId=${ord.orderId}`}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                        >
                          Track Shipment ➔
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 3: SOURCING REQUESTS & QUOTES ─── */}
          {activeTab === "requests" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Custom India Sourcing Requests</h3>
                  <p className="text-xs text-slate-500">Track quotes generated for custom India links you requested.</p>
                </div>
                <Link
                  href="/request-product"
                  className="rounded-xl bg-blue-600 text-white font-bold text-xs px-4 py-2.5 shadow-md hover:bg-blue-700 transition"
                >
                  + Submit New Sourcing Link
                </Link>
              </div>

              {requests.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                  <p className="text-3xl">📋</p>
                  <h4 className="text-base font-bold text-slate-900">No active sourcing requests</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Found an item on Amazon, Flipkart, Myntra, or boAt? Submit the URL and our concierge team will generate a landed NPR quote.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((r) => (
                    <div key={r.requestId} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                      {/* Request item details */}
                      <p className="font-bold text-slate-900">{r.productName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 4: SAVED WISHLIST ─── */}
          {activeTab === "wishlist" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Saved Wishlist ({wishedProducts.length})</h3>
                  <p className="text-xs text-slate-500">Items you saved while exploring Indian marketplace channels.</p>
                </div>
                {wishedProducts.length > 0 && (
                  <button
                    onClick={clearWishlist}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {wishedProducts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                  <p className="text-3xl">🤍</p>
                  <h4 className="text-base font-bold text-slate-900">Your wishlist is empty</h4>
                  <p className="text-xs text-slate-500">Explore authentic Indian products and click the heart icon to save.</p>
                  <Link
                    href="/shop"
                    className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md"
                  >
                    Browse Indian Marketplace
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishedProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 5: BANKDASH SETTINGS & PROFILE ─── */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              {/* Settings Sub-Tabs (BankDash Style) */}
              <div className="flex items-center gap-6 border-b border-slate-100 pb-4">
                {[
                  { id: "profile" as const, label: "Edit Profile" },
                  { id: "shipping" as const, label: "Shipping Addresses" },
                  { id: "security" as const, label: "Security & Access" }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSettingsTab(st.id)}
                    className={`text-xs font-bold pb-2 transition cursor-pointer border-b-2 -mb-4.5 ${
                      settingsTab === st.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* 1. Edit Profile Form */}
              {settingsTab === "profile" && (
                <form onSubmit={saveProfile} className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full rounded-2xl bg-[#F5F7FA] border border-slate-200/80 px-4 py-3 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Contact Phone (Nepal)
                      </label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-2xl bg-[#F5F7FA] border border-slate-200/80 px-4 py-3 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 shadow-md shadow-blue-600/20 transition active:scale-95 cursor-pointer"
                  >
                    {isSavingProfile ? "Saving Profile..." : "Save Profile"}
                  </button>
                </form>
              )}

              {/* 2. Shipping Addresses Subtab */}
              {settingsTab === "shipping" && (
                <div className="space-y-6 max-w-3xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Saved Delivery Addresses</h4>
                      <p className="text-xs text-slate-500">Your default address is automatically loaded during checkout.</p>
                    </div>
                    {!showAddAddressForm && (
                      <button
                        type="button"
                        onClick={() => setShowAddAddressForm(true)}
                        className="rounded-2xl bg-black text-white text-xs font-bold px-4 py-2 hover:bg-neutral-800 transition"
                      >
                        + Add New Address
                      </button>
                    )}
                  </div>

                  {/* Add New Address Form */}
                  {showAddAddressForm && (
                    <form onSubmit={handleAddAddress} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <h5 className="text-xs font-black uppercase text-slate-800">Add New Delivery Address</h5>
                        <button
                          type="button"
                          onClick={() => setShowAddAddressForm(false)}
                          className="text-xs font-bold text-slate-400 hover:text-black"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Full Name *</label>
                          <input
                            required
                            value={newAddressForm.fullName}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                            className="w-full rounded-xl bg-white border border-slate-300 p-2.5 font-medium focus:border-blue-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Phone Number *</label>
                          <input
                            required
                            value={newAddressForm.phone}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                            className="w-full rounded-xl bg-white border border-slate-300 p-2.5 font-medium focus:border-blue-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Province *</label>
                          <select
                            required
                            value={newAddressForm.province}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, province: e.target.value })}
                            className="w-full rounded-xl bg-white border border-slate-300 p-2.5 font-medium focus:border-blue-600 focus:outline-none"
                          >
                            {nepalProvinces.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">District *</label>
                          <input
                            required
                            value={newAddressForm.district}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, district: e.target.value })}
                            placeholder="e.g. Kathmandu"
                            className="w-full rounded-xl bg-white border border-slate-300 p-2.5 font-medium focus:border-blue-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">City / Municipality *</label>
                          <input
                            required
                            value={newAddressForm.city}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                            placeholder="e.g. Kathmandu Metropolitan"
                            className="w-full rounded-xl bg-white border border-slate-300 p-2.5 font-medium focus:border-blue-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Ward Number (Optional)</label>
                          <input
                            value={newAddressForm.ward}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, ward: e.target.value })}
                            placeholder="e.g. 04"
                            className="w-full rounded-xl bg-white border border-slate-300 p-2.5 font-medium focus:border-blue-600 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Full Street Address *</label>
                          <textarea
                            required
                            rows={2}
                            value={newAddressForm.fullAddress}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, fullAddress: e.target.value })}
                            placeholder="e.g. House #42, Baluwatar Marg, Near PM Residence"
                            className="w-full rounded-xl bg-white border border-slate-300 p-2.5 font-medium focus:border-blue-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nearest Landmark (Optional)</label>
                          <input
                            value={newAddressForm.landmark}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, landmark: e.target.value })}
                            placeholder="e.g. Opposite Bhatbhateni"
                            className="w-full rounded-xl bg-white border border-slate-300 p-2.5 font-medium focus:border-blue-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Address Label</label>
                          <select
                            value={newAddressForm.label}
                            onChange={(e) => setNewAddressForm({ ...newAddressForm, label: e.target.value })}
                            className="w-full rounded-xl bg-white border border-slate-300 p-2.5 font-medium focus:border-blue-600 focus:outline-none"
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 pt-1">
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newAddressForm.isDefault}
                              onChange={(e) => setNewAddressForm({ ...newAddressForm, isDefault: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                            />
                            <span>Set as default delivery address</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => setShowAddAddressForm(false)}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addressSubmitting}
                          className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {addressSubmitting ? "Saving..." : "Save Address"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Saved Addresses List */}
                  {loadingAddresses ? (
                    <div className="text-xs text-slate-400 py-4">Loading saved addresses...</div>
                  ) : savedAddresses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 space-y-2">
                      <p className="text-xl">📍</p>
                      <p className="font-bold text-slate-800">No saved addresses yet</p>
                      <p>Add a delivery address to enable instant 1-click checkout.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr._id || addr.fullAddress}
                          className={`rounded-2xl border p-4 space-y-2 text-xs transition relative ${
                            addr.isDefault
                              ? "border-blue-600 bg-blue-50/20 shadow-xs"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900">{addr.fullName}</span>
                              {addr.label && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                                  {addr.label}
                                </span>
                              )}
                            </div>
                            {addr.isDefault && (
                              <span className="rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px] px-2 py-0.5">
                                ✓ Default
                              </span>
                            )}
                          </div>

                          <p className="text-slate-700 leading-relaxed">
                            {addr.fullAddress}
                            {addr.landmark ? ` (Landmark: ${addr.landmark})` : ""}
                          </p>
                          <p className="text-slate-500">
                            {[addr.city, addr.ward ? `Ward ${addr.ward}` : "", addr.district, addr.province, addr.country || "Nepal"].filter(Boolean).join(", ")}
                          </p>
                          <p className="text-slate-800 font-semibold pt-1">Phone: {addr.phone}</p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            {!addr.isDefault ? (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr._id)}
                                className="text-blue-600 font-bold hover:underline"
                              >
                                Set as Default
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-600">✓ Primary Address</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr._id)}
                              className="text-red-500 font-semibold hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Security & Access Subtab */}
              {settingsTab === "security" && (
                <div className="space-y-4 max-w-md">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-slate-900">Email Address</span>
                    <p className="text-xs text-slate-600">{user.email}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-xs font-bold text-slate-900">Account Role</span>
                    <p className="text-xs text-slate-600 uppercase font-semibold">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-5 py-2.5 transition cursor-pointer"
                  >
                    Sign Out of This Session
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ─── 3. ORDER DETAILS DRAWER / MODAL ─── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Order Snapshot</span>
                <h3 className="text-lg font-black text-slate-900 font-mono">{selectedOrder.orderId}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Product Details */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sourced Product</span>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                {selectedOrder.productImage ? (
                  <img src={selectedOrder.productImage} alt={selectedOrder.productName} className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl flex-shrink-0">
                    📦
                  </div>
                )}
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-slate-900">{selectedOrder.productName}</h4>
                  <p className="text-slate-500">Marketplace: <strong>{selectedOrder.marketplace}</strong> • Qty: {selectedOrder.quantity}</p>
                  {selectedOrder.productUrl && (
                    <a href={selectedOrder.productUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline block">
                      Original Indian Product URL ↗
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Landed Pricing Breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Financial Breakdown</span>
              <div className="rounded-2xl bg-slate-900 text-white p-4 text-xs space-y-2">
                {selectedOrder.indianPriceINR ? (
                  <div className="flex justify-between text-slate-300">
                    <span>Source Indian Price</span>
                    <span className="font-bold text-white">₹{selectedOrder.indianPriceINR.toLocaleString()} INR</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-slate-300">
                  <span>Payment Method</span>
                  <span className="font-bold text-white">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Payment Status</span>
                  <span className="font-bold text-amber-400">{selectedOrder.paymentStatus}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700 text-sm font-black">
                  <span className="text-amber-400">Final Landed NPR</span>
                  <span className="text-white">{formatNpr(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address Snapshot */}
            {selectedOrder.shippingAddress && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery Address</span>
                <div className="rounded-2xl border border-slate-200 p-3 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">{selectedOrder.shippingAddress.customerName || user.fullName}</p>
                  <p>{selectedOrder.shippingAddress.deliveryAddress}</p>
                  <p>{selectedOrder.shippingAddress.city || ""} {selectedOrder.shippingAddress.district || ""} {selectedOrder.shippingAddress.province || ""}</p>
                  <p className="text-slate-500">Phone: {selectedOrder.shippingAddress.phone || user.phone}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <a
                href={selectedOrder.invoiceUrl || `/api/india-order/invoice/${selectedOrder.orderId}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                🖨️ PDF Invoice
              </a>
              <Link
                href={`/track-order?orderId=${selectedOrder.orderId}`}
                className="flex-1 text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                Track Shipment ➔
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-12 bg-[#F5F7FA]">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
