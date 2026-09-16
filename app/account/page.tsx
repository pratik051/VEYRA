"use client";

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useWishlist } from "@/components/providers/wishlist-provider";
import { products, nepalProvinces } from "@/lib/data";
import { ProductCard } from "@/components/ui/product-card";
import { formatNpr } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import { ProductRequestItem } from "@/lib/types";
import { MarketplaceLogo } from "@/components/ui/marketplace-logos";
import { SajiloMartsHeaderBrand } from "@/components/ui/sajilomarts-brand-logo";
import { SupportChat } from "@/components/support/support-chat";

export type CustomerOrder = {
  _id: string;
  orderId: string;
  invoiceNumber: string;
  invoiceUrl?: string;
  isIndiaOrder: boolean;
  productName: string;
  productImage?: string;
  productUrl?: string;
  originalSourceUrl?: string;
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
  adminVerificationStatus?: string;
  adminStockStatus?: string;
  adminDeliveryStatus?: string;
  adminNote?: string;
  alternativeSourceUrl?: string;
  alternativeStatus?: string;
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

export type CustomerTicketMessage = {
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "admin";
  message: string;
  createdAt: string;
};

export type CustomerTicket = {
  _id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  subject: string;
  category: string;
  description: string;
  orderId?: string;
  productId?: string;
  marketplace?: string;
  status: "Open" | "In Progress" | "Waiting for User" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  createdAt: string;
  updatedAt: string;
  messages: CustomerTicketMessage[];
};

type NavTab = "orders" | "tickets" | "requests" | "wishlist" | "settings";

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

// Navigation Icons
function OrdersIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function TicketsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M12 7v4" />
      <path d="M12 15h.01" />
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

const PROBLEM_CATEGORIES = [
  "Order Problem",
  "Payment Problem",
  "Product Problem",
  "Delivery Problem",
  "Account Problem",
  "Website/Technical Problem",
  "Refund/Return Problem",
  "Other"
];

function AccountContent() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab")?.toLowerCase();

  const [activeTab, setActiveTab] = useState<NavTab>(
    rawTab === "tickets" || rawTab === "support"
      ? "tickets"
      : rawTab === "requests" || rawTab === "product-requests"
      ? "requests"
      : rawTab === "wishlist"
      ? "wishlist"
      : rawTab === "settings" || rawTab === "profile"
      ? "settings"
      : "orders"
  );

  const [user, setUser] = useState<AccountUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [requests, setRequests] = useState<ProductRequestItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Support Tickets State
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<CustomerTicket | null>(null);
  const [showRaiseTicketModal, setShowRaiseTicketModal] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketFilter, setTicketFilter] = useState("all");
  const [newTicketForm, setNewTicketForm] = useState({
    subject: "",
    category: "Order Problem",
    description: "",
    orderId: "",
    productId: "",
    marketplace: "",
    priority: "Medium"
  });
  const [replyMessage, setReplyMessage] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

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

  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await fetch("/api/user/tickets", {
        credentials: "same-origin",
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tickets)) {
          setTickets(data.tickets);
        }
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  const [requestsLoading, setRequestsLoading] = useState(false);
  const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(null);
  const [decliningRequestId, setDecliningRequestId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch("/api/user/product-requests", {
        credentials: "same-origin",
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.requests)) {
          setRequests(data.requests);
        }
      }
    } catch (err) {
      console.error("Failed to load product requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const handleAcceptAlternative = async (reqItem: any) => {
    setAcceptingRequestId(reqItem.requestId);
    try {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || {};
      const res = await fetch(`/api/user/product-requests/${reqItem.requestId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          fullName: defaultAddr.fullName || user?.fullName || "Customer",
          phone: defaultAddr.phone || user?.phone || "",
          email: defaultAddr.email || user?.email || "",
          deliveryAddress: defaultAddr.fullAddress || user?.fullAddress || "Direct Nepal Delivery",
          city: defaultAddr.city || user?.city || "",
          district: defaultAddr.district || user?.district || "",
          province: defaultAddr.province || user?.province || "",
          postalCode: defaultAddr.postalCode || "",
          paymentMethod: "COD"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        pushToast(`✓ Alternative product accepted! Order ${data.order?.orderId || ""} created.`, "success");
        await fetchRequests();
        await fetchOrders();
      } else {
        pushToast(data.error || "Failed to accept alternative product.", "error");
      }
    } catch {
      pushToast("Network error accepting alternative product.", "error");
    } finally {
      setAcceptingRequestId(null);
    }
  };

  const handleDeclineAlternative = async (reqItem: any) => {
    if (!confirm("Are you sure you want to decline this alternative product?")) return;
    setDecliningRequestId(reqItem.requestId);
    try {
      const res = await fetch(`/api/user/product-requests/${reqItem.requestId}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast("Alternative product offer declined.", "info");
        await fetchRequests();
      } else {
        pushToast(data.error || "Failed to decline alternative.", "error");
      }
    } catch {
      pushToast("Network error declining alternative.", "error");
    } finally {
      setDecliningRequestId(null);
    }
  };

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchTickets();
      fetchRequests();
      loadAddresses();
    }
  }, [user, fetchOrders, fetchTickets, fetchRequests, loadAddresses]);

  const handleCreateTicket = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      pushToast("Please enter a subject and description.", "error");
      return;
    }
    setTicketSubmitting(true);
    try {
      const res = await fetch("/api/user/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicketForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast(`Support ticket ${data.ticket?.ticketId || ""} created successfully!`, "success");
        setShowRaiseTicketModal(false);
        setNewTicketForm({
          subject: "",
          category: "Order Problem",
          description: "",
          orderId: "",
          productId: "",
          marketplace: "",
          priority: "Medium"
        });
        fetchTickets();
      } else {
        pushToast(data.error || "Failed to create support ticket.", "error");
      }
    } catch {
      pushToast("Network error submitting ticket.", "error");
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleSendReply = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setReplySubmitting(true);
    try {
      const res = await fetch(`/api/user/tickets/${selectedTicket.ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast("Reply sent to support team.", "success");
        setReplyMessage("");
        if (data.ticket) {
          setSelectedTicket(data.ticket);
        }
        fetchTickets();
      } else {
        pushToast(data.error || "Failed to send reply.", "error");
      }
    } catch {
      pushToast("Network error sending reply.", "error");
    } finally {
      setReplySubmitting(false);
    }
  };

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

  const filteredTickets = useMemo(() => {
    let list = tickets;
    if (ticketFilter !== "all") {
      list = list.filter((t) => t.status.toLowerCase() === ticketFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.ticketId.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.orderId && t.orderId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [tickets, ticketFilter, searchQuery]);

  const openTicketsCount = useMemo(() => {
    return tickets.filter((t) => t.status === "Open" || t.status === "In Progress" || t.status === "Waiting for User").length;
  }, [tickets]);

  const wishedProducts = useMemo(() => {
    return products.filter((p) => ids.includes(p.id));
  }, [ids]);

  if (authChecking) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center gap-3 bg-[#F5F7FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
        <span className="text-xs font-semibold text-slate-500">Loading Account...</span>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login?redirect=/account";
    }
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center gap-3 bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-900 border-t-transparent" />
        <span className="text-xs font-semibold text-slate-600">Redirecting to Login...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex text-slate-800">
      {/* ─── 1. USER ACCOUNT LEFT SIDEBAR ─── */}
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
              <SajiloMartsHeaderBrand theme="light" />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: "orders" as NavTab, label: "My Orders", icon: <OrdersIcon />, count: orders.length },
              { id: "tickets" as NavTab, label: "Support Tickets", icon: <TicketsIcon />, count: openTicketsCount },
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

      {/* ─── 2. MAIN CONTENT AREA ─── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
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
                {activeTab === "orders" && "My Orders & Shipments"}
                {activeTab === "tickets" && "Customer Support & Problems"}
                {activeTab === "requests" && "Live Sourcing Quotes"}
                {activeTab === "wishlist" && "Saved Wishlist"}
                {activeTab === "settings" && "Account Settings"}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Welcome back, <strong>{user.fullName}</strong> • Direct India ➔ Nepal Portal
              </p>
            </div>
          </div>

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
                placeholder="Search orders, tickets..."
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

            {activeTab === "tickets" ? (
              <button
                type="button"
                onClick={() => setShowRaiseTicketModal(true)}
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-blue-600/20 transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Raise Ticket</span>
              </button>
            ) : (
              <Link
                href="/request-product"
                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-blue-600/20 transition hidden sm:inline-flex items-center gap-1.5"
              >
                <span>+ New Order</span>
              </Link>
            )}
          </div>
        </header>

        {/* Account Body */}
        <div className="p-4 sm:p-8 space-y-8 flex-1">
          {/* ─── TAB 1: MY ORDERS ─── */}
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchOrders()}
                    disabled={ordersLoading}
                    className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    ↻ Refresh Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("tickets");
                      setShowRaiseTicketModal(true);
                    }}
                    className="rounded-xl bg-slate-900 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                  >
                    ⚠️ Report an Issue
                  </button>
                </div>
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
                              ord.adminVerificationStatus === "Verified / Orderable"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : ord.adminVerificationStatus === "Alternative Required"
                                ? "bg-purple-50 text-purple-800 border-purple-200"
                                : ord.adminVerificationStatus === "Unavailable" || ord.adminVerificationStatus === "Rejected"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {ord.adminVerificationStatus || "⏳ Awaiting Admin Verification"}
                          </span>
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
                            {ord.originalSourceUrl || ord.productUrl ? (
                              <a
                                href={ord.originalSourceUrl || ord.productUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                              >
                                View Indian Product Link ↗
                              </a>
                            ) : null}
                            {ord.alternativeSourceUrl && (
                              <div className="mt-1 p-2 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900">
                                <strong>Admin Sourced Alternative:</strong>{" "}
                                <a
                                  href={ord.alternativeSourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline font-bold"
                                >
                                  View Alternative Product ↗
                                </a>
                                {ord.adminNote && <p className="mt-0.5 text-slate-600">{ord.adminNote}</p>}
                              </div>
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
                          onClick={() => {
                            setNewTicketForm((prev) => ({
                              ...prev,
                              category: "Order Problem",
                              orderId: ord.orderId,
                              productId: ord.productName,
                              marketplace: ord.marketplace || "",
                              subject: `Issue regarding Order ${ord.orderId}`
                            }));
                            setShowRaiseTicketModal(true);
                          }}
                          className="rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100/60 transition cursor-pointer"
                        >
                          ⚠️ Report Problem
                        </button>
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

          {/* ─── TAB 2: SUPPORT TICKETS / USER PROBLEMS ─── */}
          {activeTab === "tickets" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Customer Help &amp; Support Hub</h3>
                  <p className="text-xs text-slate-500">Ask our AI Shopping Assistant or submit a ticket to our support team.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchTickets()}
                    disabled={ticketsLoading}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    ↻ Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRaiseTicketModal(true)}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 shadow-md transition cursor-pointer"
                  >
                    + Raise New Ticket
                  </button>
                </div>
              </div>

              {/* Support Mode Toggle: Tickets vs Live AI Assistant */}
              <div className="rounded-2xl bg-white border border-slate-200 p-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-2">
                  <span className="text-xs font-bold text-slate-700">Choose Support Channel:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        !selectedTicket ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      🎫 Tickets ({tickets.length})
                    </button>
                  </div>
                </div>

                {/* Embedded AI Support Assistant */}
                <div className="pt-2">
                  <h4 className="text-xs font-extrabold text-slate-900 mb-3 px-2 flex items-center gap-2">
                    <span>✨ AI Concierge &amp; Live Sourcing Support</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Always Online</span>
                  </h4>
                  <SupportChat embedded={true} />
                </div>
              </div>

              {/* Status Filter Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all", label: "All Tickets" },
                  { id: "open", label: "Open" },
                  { id: "in progress", label: "In Progress" },
                  { id: "waiting for user", label: "Waiting for You" },
                  { id: "resolved", label: "Resolved" },
                  { id: "closed", label: "Closed" }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setTicketFilter(st.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      ticketFilter === st.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {ticketsLoading && tickets.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                  <div className="h-7 w-7 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">Loading your support tickets...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                  <p className="text-3xl">🎫</p>
                  <h4 className="text-base font-bold text-slate-900">No support tickets found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Need help with an order, payment, or delivery? Submit a ticket and our support team will assist you promptly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowRaiseTicketModal(true)}
                    className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md"
                  >
                    + Raise a Support Ticket
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((t) => {
                    const statusColor =
                      t.status === "Open"
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : t.status === "In Progress"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : t.status === "Waiting for User"
                        ? "bg-purple-50 text-purple-800 border-purple-200"
                        : t.status === "Resolved"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-700 border-slate-200";

                    const adminRepliesCount = (t.messages || []).filter((m) => m.senderRole === "admin").length;

                    return (
                      <div
                        key={t.ticketId}
                        className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-black text-sm text-slate-900">{t.ticketId}</span>
                            <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                              {t.category}
                            </span>
                            {t.orderId && (
                              <span className="rounded-lg bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 text-[10px] font-mono font-bold">
                                Order #{t.orderId}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold border ${statusColor}`}>
                              {t.status}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-black text-sm text-slate-900">{t.subject}</h4>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{t.description}</p>
                        </div>

                        {/* Footer Status & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                          <div className="text-slate-500 text-[11px] flex items-center gap-3">
                            <span>Messages: <strong>{(t.messages || []).length}</strong></span>
                            {adminRepliesCount > 0 && (
                              <span className="text-emerald-600 font-bold">✓ {adminRepliesCount} Admin Response{adminRepliesCount > 1 ? "s" : ""}</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedTicket(t)}
                            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
                          >
                            Open Conversation Thread ➔
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                  <p className="text-xs text-slate-500">Track quotes generated for custom India links or unavailable marketplace products.</p>
                </div>
                <Link
                  href="/request-product"
                  className="rounded-xl bg-blue-600 text-white font-bold text-xs px-4 py-2.5 shadow-md hover:bg-blue-700 transition"
                >
                  + Submit New Sourcing Link
                </Link>
              </div>

              {requestsLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading sourcing requests...</div>
              ) : requests.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3">
                  <p className="text-3xl">📋</p>
                  <h4 className="text-base font-bold text-slate-900">No active sourcing requests</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Found an item on Amazon, Flipkart, Myntra, or boAt that was unavailable for direct ordering? Submit the URL and our concierge team will find and verify an alternative link.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/request-product"
                      className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md"
                    >
                      Request a Product Now
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {requests.map((r: any) => {
                    const hasAlternative = Boolean(r.alternativeProduct && r.alternativeProduct.orderable);
                    const isConverted = r.status === "Converted to Order" || Boolean(r.convertedOrderId);
                    const isDeclined = r.customerAction === "declined" || r.status === "Rejected";

                    return (
                      <div
                        key={r.requestId}
                        className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5"
                      >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-slate-900">{r.requestId}</span>
                            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border ${
                              r.status === "Alternative Found" || r.status === "Waiting for User"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : r.status === "Converted to Order"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : r.status === "Reviewing"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }`}>
                              {r.status}
                            </span>
                            {r.originalMarketplace && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                {r.originalMarketplace}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>

                        {/* Two Columns: Original Product + Alternative Offer */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Left Column: Original Requested Product */}
                          <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 space-y-3 text-xs">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                              1. Original Requested Item
                            </span>

                            <div className="flex gap-3">
                              {r.productImage ? (
                                <img
                                  src={r.productImage}
                                  alt={r.productName}
                                  className="h-16 w-16 rounded-xl object-contain bg-white border border-slate-200 p-1 flex-shrink-0"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-xl bg-slate-200 flex items-center justify-center text-xl flex-shrink-0">
                                  📦
                                </div>
                              )}
                              <div className="space-y-1 min-w-0">
                                <h4 className="font-extrabold text-slate-900 leading-snug break-words">
                                  {r.productName || "Indian Marketplace Item"}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                                  <span>Qty: {r.requestedQuantity || 1}</span>
                                  {r.requestedSize && <span>Size: {r.requestedSize}</span>}
                                  {r.requestedColor && <span>Color: {r.requestedColor}</span>}
                                  {r.currentKnownPrice ? <span>₹{r.currentKnownPrice} INR</span> : null}
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px]">
                              <div className="truncate">
                                <span className="text-slate-400">Original URL: </span>
                                <a
                                  href={r.originalProductUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 font-bold hover:underline"
                                >
                                  Open Link ↗
                                </a>
                              </div>
                              {r.reason && (
                                <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                                  <strong>Status Note:</strong> {r.reason}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right Column: Verified Alternative Link from Admin */}
                          <div className={`rounded-2xl p-4 border space-y-3 text-xs ${
                            hasAlternative
                              ? "bg-purple-50/40 border-purple-200 shadow-2xs"
                              : "bg-slate-50/40 border-dashed border-slate-200"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 block">
                                2. Verified Alternative Offer
                              </span>
                              {hasAlternative && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-300">
                                  ✓ Verified Available
                                </span>
                              )}
                            </div>

                            {hasAlternative ? (
                              <div className="space-y-3">
                                <div className="flex gap-3">
                                  {r.alternativeProduct.productImage ? (
                                    <img
                                      src={r.alternativeProduct.productImage}
                                      alt={r.alternativeProduct.productName}
                                      className="h-16 w-16 rounded-xl object-contain bg-white border border-purple-200 p-1 flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="h-16 w-16 rounded-xl bg-purple-100 flex items-center justify-center text-xl flex-shrink-0">
                                      ✨
                                    </div>
                                  )}
                                  <div className="space-y-1 min-w-0">
                                    <h4 className="font-extrabold text-slate-900 leading-snug break-words">
                                      {r.alternativeProduct.productName}
                                    </h4>
                                    <p className="text-[11px] text-purple-700 font-bold">
                                      Marketplace: {r.alternativeProduct.marketplace}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  <div className="p-2 rounded-xl bg-white border border-purple-200">
                                    <span className="text-[10px] text-slate-400 block font-bold">Price in India</span>
                                    <span className="font-black text-slate-800">₹{r.alternativeProduct.priceINR} INR</span>
                                  </div>
                                  <div className="p-2 rounded-xl bg-white border border-purple-200">
                                    <span className="text-[10px] text-slate-400 block font-bold">Landed Nepal Price</span>
                                    <span className="font-black text-red-600">
                                      {formatNpr(r.alternativeProduct.finalAmountNPR)}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1 text-[11px] text-slate-600">
                                  <div className="flex items-center justify-between">
                                    <span>Delivery:</span>
                                    <span className="font-bold text-emerald-700">✓ Delivery available</span>
                                  </div>
                                  <div>
                                    <a
                                      href={r.alternativeProduct.productUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 font-bold hover:underline"
                                    >
                                      View Alternative Marketplace Page ↗
                                    </a>
                                  </div>
                                  {r.alternativeProduct.adminNote && (
                                    <p className="text-slate-700 bg-white p-2 rounded-lg border border-purple-100 mt-1">
                                      <strong>Admin Note:</strong> {r.alternativeProduct.adminNote}
                                    </p>
                                  )}
                                </div>

                                {/* Acceptance Actions */}
                                {!isConverted && !isDeclined && (
                                  <div className="pt-2 border-t border-purple-200/80 flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleAcceptAlternative(r)}
                                      disabled={acceptingRequestId === r.requestId}
                                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
                                    >
                                      {acceptingRequestId === r.requestId ? "Processing Order..." : "✓ Accept & Place Order"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeclineAlternative(r)}
                                      disabled={decliningRequestId === r.requestId}
                                      className="rounded-xl border border-slate-300 hover:bg-red-50 hover:text-red-600 px-3.5 py-2.5 text-xs font-bold text-slate-600 transition cursor-pointer"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                )}

                                {isConverted && (
                                  <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center justify-between">
                                    <span>✓ Order Placed: {r.convertedOrderId}</span>
                                    <button
                                      type="button"
                                      onClick={() => setActiveTab("orders")}
                                      className="underline hover:text-black font-black"
                                    >
                                      View in Orders ➔
                                    </button>
                                  </div>
                                )}

                                {isDeclined && (
                                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-medium text-center">
                                    ✕ This alternative link was declined.
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="py-6 text-center space-y-2 text-slate-400">
                                <p className="text-2xl">🔍</p>
                                <p className="font-bold text-slate-700 text-xs">Admin Review in Progress</p>
                                <p className="text-[11px] max-w-xs mx-auto">
                                  Our procurement desk is currently searching verified inventory to provide an alternative link. You will see the alternative product card here once found.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

          {/* ─── TAB 5: SETTINGS & PROFILE ─── */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
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

      {/* ─── 3. RAISE A TICKET MODAL ─── */}
      {showRaiseTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Customer Care</span>
                <h3 className="text-lg font-black text-slate-900">Raise a Support Ticket</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRaiseTicketModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Problem Category *</label>
                <select
                  required
                  value={newTicketForm.category}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 font-medium focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  {PROBLEM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Subject / Issue Summary *</label>
                <input
                  required
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  placeholder="e.g. Delivery delay for my order / Payment confirmation inquiry"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 font-medium focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Related Order ID (Optional)</label>
                {orders.length > 0 ? (
                  <select
                    value={newTicketForm.orderId}
                    onChange={(e) => {
                      const selOrd = orders.find((o) => o.orderId === e.target.value);
                      setNewTicketForm({
                        ...newTicketForm,
                        orderId: e.target.value,
                        productId: selOrd ? selOrd.productName : newTicketForm.productId,
                        marketplace: selOrd ? selOrd.marketplace || "" : newTicketForm.marketplace
                      });
                    }}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 font-medium focus:border-blue-600 focus:bg-white focus:outline-none"
                  >
                    <option value="">None / Not specific to an order</option>
                    {orders.map((o) => (
                      <option key={o.orderId} value={o.orderId}>
                        {o.orderId} — {o.productName.slice(0, 40)} ({o.orderStatus})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={newTicketForm.orderId}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, orderId: e.target.value })}
                    placeholder="e.g. LNK-XXXXXX (if applicable)"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 font-medium focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  placeholder="Describe the issue in detail so our support specialists can assist you rapidly..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 font-medium focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 font-medium focus:border-blue-600 focus:bg-white focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Contact Email</label>
                  <input
                    disabled
                    value={user.email}
                    className="w-full rounded-xl bg-slate-100 border border-slate-200 p-2.5 font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRaiseTicketModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ticketSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/20"
                >
                  {ticketSubmitting ? "Submitting Ticket..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 4. TICKET DETAILS / CONVERSATION THREAD MODAL ─── */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-slate-900 text-base">{selectedTicket.ticketId}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                    {selectedTicket.status}
                  </span>
                  <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-[10px] font-bold">
                    {selectedTicket.category}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-800 mt-1">{selectedTicket.subject}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Ticket Metadata Banner */}
            <div className="rounded-2xl bg-slate-50 p-4 text-xs space-y-2 border border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Created</span>
                  <span className="text-slate-800 font-semibold">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Priority</span>
                  <span className="text-slate-800 font-semibold">{selectedTicket.priority}</span>
                </div>
                {selectedTicket.orderId && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Related Order</span>
                    <span className="text-blue-600 font-mono font-bold">{selectedTicket.orderId}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Last Updated</span>
                  <span className="text-slate-800 font-semibold">{new Date(selectedTicket.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Initial Problem Description</span>
                <p className="text-slate-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </div>

            {/* Conversation History */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-72 p-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Conversation History ({(selectedTicket.messages || []).length})
              </span>

              {(selectedTicket.messages || []).length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No replies yet. Our support agents have received your ticket and are reviewing it.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTicket.messages.map((m) => {
                    const isAdmin = m.senderRole === "admin";
                    return (
                      <div
                        key={m.messageId}
                        className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                          <span className="font-bold text-slate-700">{m.senderName}</span>
                          {isAdmin && (
                            <span className="bg-blue-600 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-md">
                              SUPPORT AGENT
                            </span>
                          )}
                          <span>• {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                            isAdmin
                              ? "bg-slate-100 text-slate-900 border border-slate-200"
                              : "bg-blue-600 text-white shadow-xs"
                          }`}
                        >
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Reply Composer */}
            {selectedTicket.status !== "Closed" ? (
              <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100 space-y-2">
                <textarea
                  rows={2}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply to the support team..."
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xs font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none transition"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Replying will update the ticket status for our support agents.</span>
                  <button
                    type="submit"
                    disabled={replySubmitting || !replyMessage.trim()}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 transition disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    {replySubmitting ? "Sending..." : "Send Reply ➔"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl bg-slate-100 p-3 text-center text-xs text-slate-500 font-bold">
                This support ticket has been closed. If you have a new issue, please raise a new ticket.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 5. ORDER DETAILS DRAWER / MODAL ─── */}
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
              <button
                type="button"
                onClick={() => {
                  setNewTicketForm((prev) => ({
                    ...prev,
                    category: "Order Problem",
                    orderId: selectedOrder.orderId,
                    productId: selectedOrder.productName,
                    marketplace: selectedOrder.marketplace || "",
                    subject: `Issue regarding Order ${selectedOrder.orderId}`
                  }));
                  setSelectedOrder(null);
                  setActiveTab("tickets");
                  setShowRaiseTicketModal(true);
                }}
                className="flex-1 text-center py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-bold text-xs hover:bg-amber-100 transition cursor-pointer"
              >
                ⚠️ Report Problem
              </button>
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
