"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { formatNpr } from "@/lib/utils";
import { categories, orderTimeline, products as defaultProducts } from "@/lib/data";

type AdminProduct = {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  badge?: string;
  featured?: boolean;
  trending?: boolean;
  image?: string;
  description?: string;
};

type AdminOrder = {
  _id: string;
  orderId: string;
  fullName: string;
  phone?: string;
  fullAddress?: string;
  total?: number;
  orderStatus: string;
  paymentStatus: string;
  trackingNumber?: string;
  createdAt?: string;
};

type AdminIndiaOrder = {
  _id: string;
  orderId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  deliveryInstructions?: string;
  marketplace?: string;
  sourceProductId?: string;
  productUrl: string;
  originalSourceUrl?: string;
  productName: string;
  productImage?: string;
  productVariant?: string;
  size?: string;
  color?: string;
  quantity: number;
  indianPriceINR: number;
  conversionAmountNPR: number;
  serviceChargeNPR: number;
  deliveryChargeNPR: number;
  finalAmountNPR: number;
  paymentMethod: "COD" | "FULL_PAYMENT";
  paymentStatus: "Pending" | "PAID" | "Failed" | "Refunded";
  paymentTransactionId?: string;
  orderStatus: string;
  invoiceUrl?: string;
  stockStatus?: string;
  deliveryStatus?: string;
  postalCodeChecked?: string;
  canOrder?: boolean;
  availabilityCheckedAt?: string;
  adminVerificationStatus?: "Pending Verification" | "Verified / Orderable" | "Unavailable" | "Alternative Required" | "Rejected";
  adminVerifiedAt?: string;
  adminVerifiedBy?: string;
  adminStockStatus?: "Available" | "Unavailable" | "Not Checked";
  adminDeliveryStatus?: "Available" | "Unavailable" | "Not Checked";
  adminVerifiedPriceINR?: number;
  adminVerifiedVariant?: string;
  adminNote?: string;
  alternativeSourceUrl?: string;
  alternativePriceINR?: number;
  alternativeStatus?: "None" | "Proposed" | "Accepted" | "Rejected";
  createdAt?: string;
};

type AdminPayment = {
  _id: string;
  orderId: string;
  paymentMethod?: string;
  provider?: string;
  amount: number;
  transactionCode?: string;
  status: string;
  submittedAt?: string;
  createdAt?: string;
  userId?: { fullName?: string; email?: string; phone?: string } | string;
};

type MarketplaceProviderStatus = {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  importedCount: number;
  lastSyncedAt: string | null;
};

type MarketplaceProductItem = {
  _id: string;
  source: string;
  sourceProductId: string;
  sourceUrl: string;
  originalSourceUrl?: string;
  verifiedSourceUrl?: string;
  canonicalSourceUrl?: string;
  title: string;
  brand: string;
  category: string;
  priceINR: number;
  rating: number;
  images: string[];
  isActive?: boolean;
  published?: boolean;
  verificationStatus?: "pending" | "verified" | "failed";
  verificationMethod?: "original_url" | "ai_candidate" | "api" | "feed" | "manual";
  matchConfidence?: number;
  verificationCheckedAt?: string;
  verificationError?: string;
  imageVerified?: boolean;
  priceVerified?: boolean;
};

export type AdminTicketMessage = {
  messageId: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "admin";
  message: string;
  messageType?: "reply" | "internal_note";
  createdAt: string;
};

export type AdminTicket = {
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
  messages: AdminTicketMessage[];
  relatedOrder?: AdminIndiaOrder | AdminOrder | null;
};

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span
        className={`text-xs font-semibold text-slate-800 break-words ${
          mono ? "font-mono text-slate-600 text-[11px]" : ""
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

type AdminUserItem = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "admin" | "user";
  authProvider?: string;
  createdAt?: string;
};

const adminTabs = [
  "Overview",
  "👑 Master Control Panel",
  "India Orders & Invoices",
  "Product Requests",
  "User Problems",
  "Products",
  "Store Orders",
  "Payment Verification",
  "Coupons & Settings"
] as const;

export function AdminDashboard() {
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<(typeof adminTabs)[number]>("Overview");

  const [productsList, setProductsList] = useState<AdminProduct[]>(defaultProducts);
  const [ordersList, setOrdersList] = useState<AdminOrder[]>([]);
  const [indiaOrdersList, setIndiaOrdersList] = useState<AdminIndiaOrder[]>([]);
  const [paymentsList, setPaymentsList] = useState<AdminPayment[]>([]);
  const [marketplaceProviders, setMarketplaceProviders] = useState<MarketplaceProviderStatus[]>([]);
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProductItem[]>([]);
  
  // Support Tickets State
  const [ticketsList, setTicketsList] = useState<AdminTicket[]>([]);
  const [ticketCounts, setTicketCounts] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    waitingForUser: 0,
    resolved: 0,
    closed: 0
  });
  const [ticketFilterStatus, setTicketFilterStatus] = useState("all");
  const [ticketFilterCategory, setTicketFilterCategory] = useState("all");
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<AdminTicket | null>(null);
  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [ticketReplyType, setTicketReplyType] = useState<"reply" | "internal_note">("reply");
  const [ticketReplySubmitting, setTicketReplySubmitting] = useState(false);
  const [ticketStatusUpdating, setTicketStatusUpdating] = useState(false);

  // Product Requests & Alternative Sourcing State
  const [productRequestsList, setProductRequestsList] = useState<any[]>([]);
  const [productRequestCounts, setProductRequestCounts] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    alternativeFound: 0,
    waitingForUser: 0,
    converted: 0,
    closed: 0
  });
  const [productRequestFilterStatus, setProductRequestFilterStatus] = useState("all");
  const [selectedProductRequest, setSelectedProductRequest] = useState<any | null>(null);
  const [alternativeModalOpen, setAlternativeModalOpen] = useState(false);
  const [alternativeUrlInput, setAlternativeUrlInput] = useState("");
  const [alternativePriceInr, setAlternativePriceInr] = useState("");
  const [alternativeAdminNote, setAlternativeAdminNote] = useState("");
  const [alternativeSubmitting, setAlternativeSubmitting] = useState(false);
  const [alternativeVerificationError, setAlternativeVerificationError] = useState<string | null>(null);

  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [reverifyingId, setReverifyingId] = useState<string | null>(null);
  const [auditingAll, setAuditingAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Master Control Panel State
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"user" | "admin">("user");
  const [addingUser, setAddingUser] = useState(false);

  // Full order detail panel (fetches fresh from API, not stale table row)
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<AdminIndiaOrder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Manual Product Link Verification Modal State for India Orders
  const [orderVerificationModalOpen, setOrderVerificationModalOpen] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState<AdminIndiaOrder | null>(null);
  const [adminVerificationStatus, setAdminVerificationStatus] = useState<string>("Pending Verification");
  const [adminStockStatus, setAdminStockStatus] = useState<string>("Available");
  const [adminDeliveryStatus, setAdminDeliveryStatus] = useState<string>("Available");
  const [adminVerifiedPriceINR, setAdminVerifiedPriceINR] = useState<string>("");
  const [adminVerifiedVariant, setAdminVerifiedVariant] = useState<string>("");
  const [alternativeSourceUrl, setAlternativeSourceUrl] = useState<string>("");
  const [adminNote, setAdminNote] = useState<string>("");
  const [savingVerification, setSavingVerification] = useState(false);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch {
      // ignore
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const handleToggleUserRole = async (userId: string, currentRole: "user" | "admin") => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast(`User role updated to ${nextRole.toUpperCase()}`, "success");
        setUsersList((prev) => prev.map((u) => (u._id === userId ? { ...u, role: nextRole } : u)));
      } else {
        pushToast(data.error || "Failed to update user role", "error");
      }
    } catch {
      pushToast("Network error updating user role", "error");
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user account "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast(`Deleted user account ${name}`, "info");
        setUsersList((prev) => prev.filter((u) => u._id !== userId));
      } else {
        pushToast(data.error || "Failed to delete user", "error");
      }
    } catch {
      pushToast("Network error deleting user", "error");
    }
  };

  const handleSaveAdminPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword || newAdminPassword.length < 6) {
      pushToast("Password must be at least 6 characters long.", "error");
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      pushToast("Passwords do not match.", "error");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newAdminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast("Admin password updated successfully!", "success");
        setNewAdminPassword("");
        setConfirmAdminPassword("");
      } else {
        pushToast(data.error || "Failed to update password", "error");
      }
    } catch {
      pushToast("Network error updating password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAddUserSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) {
      pushToast("Name, email and password are required.", "error");
      return;
    }
    setAddingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newUserName,
          email: newUserEmail,
          phone: newUserPhone,
          password: newUserPassword,
          role: newUserRole
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast(`User ${newUserName} created successfully!`, "success");
        setAddUserModalOpen(false);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPhone("");
        setNewUserPassword("");
        setNewUserRole("user");
        await loadUsers();
      } else {
        pushToast(data.error || "Failed to create user", "error");
      }
    } catch {
      pushToast("Network error creating user", "error");
    } finally {
      setAddingUser(false);
    }
  };

  const openOrderVerificationModal = (order: AdminIndiaOrder) => {
    setVerifyingOrder(order);
    setAdminVerificationStatus(order.adminVerificationStatus || "Pending Verification");
    setAdminStockStatus(order.adminStockStatus || "Available");
    setAdminDeliveryStatus(order.adminDeliveryStatus || "Available");
    setAdminVerifiedPriceINR(order.adminVerifiedPriceINR ? String(order.adminVerifiedPriceINR) : (order.indianPriceINR ? String(order.indianPriceINR) : ""));
    setAdminVerifiedVariant(order.adminVerifiedVariant || order.productVariant || "");
    setAlternativeSourceUrl(order.alternativeSourceUrl || "");
    setAdminNote(order.adminNote || "");
    setOrderVerificationModalOpen(true);
  };

  const handleSaveOrderVerification = async (e: FormEvent) => {
    e.preventDefault();
    if (!verifyingOrder) return;
    setSavingVerification(true);
    try {
      const res = await fetch(`/api/admin/india-orders/${verifyingOrder._id || verifyingOrder.orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminVerificationStatus,
          adminStockStatus,
          adminDeliveryStatus,
          adminVerifiedPriceINR: adminVerifiedPriceINR ? Number(adminVerifiedPriceINR) : undefined,
          adminVerifiedVariant,
          alternativeSourceUrl,
          adminNote,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast("Product link verification status updated successfully!", "success");
        setOrderVerificationModalOpen(false);
        await loadAll();
        if (selectedOrderDetail && (selectedOrderDetail._id === verifyingOrder._id || selectedOrderDetail.orderId === verifyingOrder.orderId)) {
          openOrderDetail(verifyingOrder.orderId);
        }
      } else {
        pushToast(data.error || "Failed to update verification.", "error");
      }
    } catch {
      pushToast("Network error saving order verification.", "error");
    } finally {
      setSavingVerification(false);
    }
  };

  // Open order details: fetch fresh data from API
  const openOrderDetail = async (orderId: string) => {
    setDetailLoading(true);
    setSelectedOrderDetail(null);
    const local = indiaOrdersList.find((o) => o.orderId === orderId || o._id === orderId);
    if (local) setSelectedOrderDetail(local);
    try {
      const res = await fetch(`/api/admin/india-orders/${orderId}`);
      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrderDetail(data.order);
      }
    } catch {
      // fallback to optimistic local already set
    } finally {
      setDetailLoading(false);
    }
  };

  // Open ticket details: fetch fresh data from API
  const openTicketDetail = async (ticketId: string) => {
    setTicketDetailLoading(true);
    const local = ticketsList.find((t) => t.ticketId === ticketId || t._id === ticketId);
    if (local) setSelectedTicketDetail(local);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`);
      const data = await res.json();
      if (data.success && data.ticket) {
        setSelectedTicketDetail(data.ticket);
      }
    } catch {
      // fallback to optimistic local
    } finally {
      setTicketDetailLoading(false);
    }
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [productRes, orderRes, indiaOrderRes, paymentRes, mktRes, mktProductsRes, ticketRes, requestRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
        fetch("/api/admin/india-orders"),
        fetch("/api/admin/payments"),
        fetch("/api/admin/marketplace/status"),
        fetch("/api/admin/marketplace/products"),
        fetch("/api/admin/tickets"),
        fetch("/api/admin/product-requests")
      ]);
      if (productRes.ok) {
        const p = await productRes.json();
        if (p.products && p.products.length > 0) setProductsList(p.products);
      }
      if (orderRes.ok) {
        const o = await orderRes.json();
        setOrdersList(o.orders || []);
      }
      if (indiaOrderRes.ok) {
        const r = await indiaOrderRes.json();
        setIndiaOrdersList(r.orders || []);
      }
      if (paymentRes.ok) {
        const p = await paymentRes.json();
        setPaymentsList(p.payments || []);
      }
      if (mktRes.ok) {
        const m = await mktRes.json();
        if (m.providers) setMarketplaceProviders(m.providers);
      }
      if (mktProductsRes.ok) {
        const mp = await mktProductsRes.json();
        if (mp.products) setMarketplaceProducts(mp.products);
      }
      if (ticketRes.ok) {
        const t = await ticketRes.json();
        if (Array.isArray(t.tickets)) {
          setTicketsList(t.tickets);
        }
        if (t.counts) {
          setTicketCounts(t.counts);
        }
      }
      if (requestRes.ok) {
        const reqData = await requestRes.json();
        if (Array.isArray(reqData.requests)) {
          setProductRequestsList(reqData.requests);
        }
        if (reqData.counts) {
          setProductRequestCounts(reqData.counts);
        }
      }
      await loadUsers();
    } catch (e) {
      console.error("Admin loadAll error:", e);
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const updateIndiaOrderStatus = async (id: string, orderStatus: string, paymentStatus: string) => {
    try {
      await fetch(`/api/admin/india-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus, paymentStatus })
      });
      setIndiaOrdersList((prev) =>
        prev.map((o) =>
          o._id === id || o.orderId === id
            ? { ...o, orderStatus, paymentStatus: paymentStatus as any }
            : o
        )
      );
      pushToast("India Order status updated successfully.", "success");
    } catch {
      pushToast("Failed to update order status.", "error");
    }
  };

  const handleAdminTicketReply = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTicketDetail || !ticketReplyText.trim()) return;
    setTicketReplySubmitting(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicketDetail.ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: ticketReplyText.trim(),
          messageType: ticketReplyType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast(
          ticketReplyType === "internal_note"
            ? "Internal note saved (visible to admins only)."
            : "Reply sent to customer.",
          "success"
        );
        setTicketReplyText("");
        if (data.ticket) {
          setSelectedTicketDetail((prev) => ({
            ...prev,
            ...data.ticket,
            relatedOrder: prev?.relatedOrder || data.ticket.relatedOrder
          }));
        }
        await loadAll();
      } else {
        pushToast(data.error || "Failed to send reply.", "error");
      }
    } catch {
      pushToast("Network error submitting reply.", "error");
    } finally {
      setTicketReplySubmitting(false);
    }
  };

  const handleUpdateTicketStatus = async (status: string, priority?: string) => {
    if (!selectedTicketDetail) return;
    setTicketStatusUpdating(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicketDetail.ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          priority: priority || selectedTicketDetail.priority
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast(`Ticket status updated to "${status}".`, "success");
        if (data.ticket) {
          setSelectedTicketDetail((prev) => ({
            ...prev,
            ...data.ticket,
            relatedOrder: prev?.relatedOrder || data.ticket.relatedOrder
          }));
        }
        await loadAll();
      } else {
        pushToast(data.error || "Failed to update ticket status.", "error");
      }
    } catch {
      pushToast("Network error updating ticket.", "error");
    } finally {
      setTicketStatusUpdating(false);
    }
  };

  const syncMarketplace = async (providerId?: string) => {
    setSyncingProvider(providerId || "ALL");
    try {
      const res = await fetch("/api/admin/marketplace/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId })
      });
      const data = await res.json();
      if (data.success) {
        pushToast(data.message || "Marketplace synchronization complete!", "success");
      } else {
        pushToast(data.error || "Sync completed with warnings.", "info");
      }
      await loadAll();
    } catch {
      pushToast("Network error during sync.", "error");
    } finally {
      setSyncingProvider(null);
    }
  };

  const toggleProvider = async (providerId: string, enabled: boolean) => {
    try {
      const res = await fetch("/api/admin/marketplace/provider", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, enabled })
      });
      if (res.ok) {
        setMarketplaceProviders((prev) =>
          prev.map((p) => (p.id === providerId ? { ...p, enabled } : p))
        );
        pushToast(`Provider ${providerId} is now ${enabled ? "enabled" : "disabled"}.`, "success");
      }
    } catch {
      pushToast("Failed to toggle provider.", "error");
    }
  };

  const reverifyMarketplaceProduct = async (id: string) => {
    setReverifyingId(id);
    try {
      const res = await fetch(`/api/admin/marketplace/products/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        pushToast(data.message || "Product verified successfully!", "success");
      } else {
        pushToast(data.error || "Verification failed for this product.", "error");
      }
      await loadAll();
    } catch {
      pushToast("Network error during reverification.", "error");
    } finally {
      setReverifyingId(null);
    }
  };

  const toggleProductPublish = async (id: string, currentPublished?: boolean) => {
    try {
      const res = await fetch(`/api/admin/marketplace/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentPublished, isActive: !currentPublished })
      });
      const data = await res.json();
      if (data.success) {
        pushToast(
          `Product is now ${!currentPublished ? "Published" : "Unpublished"}.`,
          "success"
        );
        await loadAll();
      } else {
        pushToast(data.error || "Failed to update publication status.", "error");
      }
    } catch {
      pushToast("Network error updating product.", "error");
    }
  };

  const handleUpdateProductRequestStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/product-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        pushToast(`Request ${id} status updated to "${status}".`, "success");
        await loadAll();
      } else {
        pushToast(data.error || "Failed to update request status.", "error");
      }
    } catch {
      pushToast("Network error updating request status.", "error");
    }
  };

  const handleOpenAlternativeModal = (reqItem: any) => {
    setSelectedProductRequest(reqItem);
    setAlternativeUrlInput(reqItem.alternativeProduct?.productUrl || "");
    setAlternativePriceInr(reqItem.alternativeProduct?.priceINR ? String(reqItem.alternativeProduct.priceINR) : "");
    setAlternativeAdminNote(reqItem.alternativeProduct?.adminNote || "");
    setAlternativeVerificationError(null);
    setAlternativeModalOpen(true);
  };

  const handleSubmitAlternativeProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProductRequest || !alternativeUrlInput.trim()) return;

    setAlternativeSubmitting(true);
    setAlternativeVerificationError(null);

    try {
      const res = await fetch(`/api/admin/product-requests/${selectedProductRequest.requestId}/alternative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productUrl: alternativeUrlInput.trim(),
          priceINR: alternativePriceInr ? Number(alternativePriceInr) : undefined,
          adminNote: alternativeAdminNote.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        pushToast("✓ Alternative product independently verified & offered to customer!", "success");
        setAlternativeModalOpen(false);
        setSelectedProductRequest(null);
        setAlternativeUrlInput("");
        setAlternativePriceInr("");
        setAlternativeAdminNote("");
        await loadAll();
      } else {
        setAlternativeVerificationError(data.error || "Alternative verification failed.");
        pushToast(data.error || "Alternative product failed backend verification.", "error");
      }
    } catch {
      pushToast("Network error submitting alternative product.", "error");
    } finally {
      setAlternativeSubmitting(false);
    }
  };

  const auditAllProducts = async () => {
    setAuditingAll(true);
    try {
      const res = await fetch("/api/marketplace/verify");
      const data = await res.json();
      if (data.success) {
        const verified = data.summary?.verifiedAndPublished || 0;
        const failed = data.summary?.failedAndUnpublished || 0;
        pushToast(
          `Verification Complete: ${verified} verified & published, ${failed} failed/unpublished.`,
          "success"
        );
        await loadAll();
      } else {
        pushToast(data.error || "Verification audit encountered errors.", "error");
      }
    } catch {
      pushToast("Network error during verification audit.", "error");
    } finally {
      setAuditingAll(false);
    }
  };

  const updatePaymentStatus = async (id: string, status: "verified" | "rejected") => {
    const response = await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      pushToast("Unable to update payment status.", "error");
      return;
    }
    setPaymentsList((prev) => prev.map((payment) => payment._id === id ? { ...payment, status } : payment));
    pushToast(`Payment ${status}.`, "success");
  };

  const createProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      category: String(form.get("category") || "").trim(),
      brand: String(form.get("brand") || "").trim(),
      price: Number(form.get("price") || 0),
      originalPrice: Number(form.get("originalPrice") || 0),
      stock: Number(form.get("stock") || 0),
      badge: String(form.get("badge") || ""),
      image: String(form.get("image") || "").trim(),
      description: String(form.get("description") || "").trim()
    };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        pushToast("Product created successfully in MongoDB!", "success");
        e.currentTarget.reset();
        await loadAll();
      } else {
        setProductsList([payload as AdminProduct, ...productsList]);
        pushToast("Product added to catalog.", "success");
        e.currentTarget.reset();
      }
    } catch {
      setProductsList([payload as AdminProduct, ...productsList]);
      pushToast("Product added to local state.", "success");
    }
  };

  const deleteProduct = async (id: string, name: string) => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      setProductsList((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      pushToast(`Deleted ${name}`, "info");
    } catch {
      setProductsList((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      pushToast(`Deleted ${name}`, "info");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
      case "Confirmed":
      case "PAID":
      case "verified":
      case "Verified":
      case "Verified / Orderable":
      case "Resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "In Transit":
      case "Arrived in Nepal":
      case "Purchased":
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending":
      case "Pending Verification":
      case "Requested":
      case "submitted":
      case "Open":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Waiting for User":
      case "Alternative Required":
      case "Alternative Found":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Cancelled":
      case "Failed":
      case "rejected":
      case "Rejected":
      case "Unavailable":
      case "Closed":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const totalIndiaRevenue = indiaOrdersList
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((acc, curr) => acc + (curr.finalAmountNPR || 0), 0);

  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getTime();
  const thisMonthRevenue = indiaOrdersList
    .filter((o) => o.orderStatus !== "Cancelled" && new Date(o.createdAt || 0).getTime() >= thisMonthStart)
    .reduce((acc, curr) => acc + (curr.finalAmountNPR || 0), 0);
  const lastMonthRevenue = indiaOrdersList
    .filter((o) => {
      const t = new Date(o.createdAt || 0).getTime();
      return o.orderStatus !== "Cancelled" && t >= lastMonthStart && t < thisMonthStart;
    })
    .reduce((acc, curr) => acc + (curr.finalAmountNPR || 0), 0);
  const growthPct = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : (thisMonthRevenue > 0 ? 100 : 0);

  const filteredTickets = ticketsList.filter((t) => {
    if (ticketFilterStatus !== "all" && t.status.toLowerCase() !== ticketFilterStatus.toLowerCase()) {
      return false;
    }
    if (ticketFilterCategory !== "all" && t.category.toLowerCase() !== ticketFilterCategory.toLowerCase()) {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchId = t.ticketId.toLowerCase().includes(q);
      const matchUser = t.userName?.toLowerCase().includes(q);
      const matchEmail = t.userEmail?.toLowerCase().includes(q);
      const matchOrder = t.orderId?.toLowerCase().includes(q);
      const matchSubject = t.subject?.toLowerCase().includes(q);
      if (!matchId && !matchUser && !matchEmail && !matchOrder && !matchSubject) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── 1. TOP STATS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Sourcing Volume */}
        <button
          onClick={() => setActiveTab("India Orders & Invoices")}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between text-left w-full hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sourcing Volume</span>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
              {formatNpr(totalIndiaRevenue)}
            </p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 ${
              growthPct > 0 ? "text-emerald-600" : growthPct < 0 ? "text-red-500" : "text-slate-400"
            }`}>
              {growthPct > 0 ? "↑" : growthPct < 0 ? "↓" : "→"} {Math.abs(growthPct)}% MoM
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-2xs group-hover:bg-emerald-100 transition-colors">
            💰
          </div>
        </button>

        {/* Card 2: India Orders */}
        <button
          onClick={() => setActiveTab("India Orders & Invoices")}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between text-left w-full hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">India Orders</span>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
              {indiaOrdersList.length}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 mt-1">
              {indiaOrdersList.filter((o) => o.paymentStatus === "PAID").length} Paid
              {" • "}
              {indiaOrdersList.filter((o) => o.paymentMethod === "COD").length} COD
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-2xs group-hover:bg-blue-100 transition-colors">
            🇮🇳
          </div>
        </button>

        {/* Card 3: User Problems / Tickets */}
        <button
          onClick={() => setActiveTab("User Problems")}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between text-left w-full hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">User Problems</span>
            <p className="mt-1 text-xl sm:text-2xl font-black text-rose-600 group-hover:text-rose-700 transition-colors">
              {ticketCounts.open + ticketCounts.inProgress}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 mt-1">
              {ticketCounts.open} Open • {ticketCounts.total} Total
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shadow-2xs group-hover:bg-rose-100 transition-colors">
            ⚠️
          </div>
        </button>

        {/* Card 4: Store Orders */}
        <button
          onClick={() => setActiveTab("Store Orders")}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between text-left w-full hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Store Orders</span>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
              {ordersList.length}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-1">
              {ordersList.filter((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length} In Progress
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-2xs group-hover:bg-amber-100 transition-colors">
            📦
          </div>
        </button>

        {/* Card 5: Payment Evidence */}
        <button
          onClick={() => setActiveTab("Payment Verification")}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between text-left w-full hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payments</span>
            <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 group-hover:text-purple-700 transition-colors">
              {paymentsList.length}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 mt-1">
              {paymentsList.filter((p) => p.status === "submitted").length} Review Pending
            </span>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shadow-2xs group-hover:bg-purple-100 transition-colors">
            💳
          </div>
        </button>
      </div>

      {/* ─── 2. TAB CONTROL STRIP ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {adminTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab === "India Orders & Invoices" && `🇮🇳 India Orders (${indiaOrdersList.length})`}
              {tab === "Product Requests" && (
                <span className="flex items-center gap-1.5">
                  <span>Product Requests</span>
                  {productRequestCounts.pending > 0 ? (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {productRequestCounts.pending}
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {productRequestsList.length}
                    </span>
                  )}
                </span>
              )}
              {tab === "User Problems" && (
                <span className="flex items-center gap-1.5">
                  <span>User Problems</span>
                  {ticketCounts.open > 0 ? (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {ticketCounts.open}
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {ticketsList.length}
                    </span>
                  )}
                </span>
              )}
              {tab === "Store Orders" && `Store Orders (${ordersList.length})`}
              {tab === "Products" && `Catalog (${productsList.length})`}
              {tab === "Payment Verification" && `Payments (${paymentsList.filter((p) => p.status === "submitted").length})`}
              {tab !== "India Orders & Invoices" && tab !== "Product Requests" && tab !== "User Problems" && tab !== "Store Orders" && tab !== "Products" && tab !== "Payment Verification" && tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search records..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
          />
          <button
            onClick={loadAll}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition whitespace-nowrap cursor-pointer"
          >
            {loading ? "..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* ─── 3. TAB CONTENT ─── */}

      {/* 3.1 Overview Tab */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent India Orders Box */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">Recent Nepal → India Orders</h3>
                  <p className="text-xs text-slate-400">Customer requests with calculated pricing &amp; invoices</p>
                </div>
                <button
                  onClick={() => setActiveTab("India Orders & Invoices")}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  View All ({indiaOrdersList.length}) →
                </button>
              </div>

              <div className="space-y-3">
                {indiaOrdersList.slice(0, 4).map((order) => (
                  <div
                    key={order.orderId}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition border border-slate-100"
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900">{order.orderId}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate">{order.productName}</p>
                      <p className="text-[11px] text-slate-500">{order.customerName} ({order.phone})</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-red-600 block">
                        {formatNpr(order.finalAmountNPR)}
                      </span>
                      <button
                        onClick={() => openOrderDetail(order.orderId)}
                        className="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Inspect ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Problems / Support Snapshot */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">User Problems &amp; Tickets</h3>
                  <p className="text-xs text-slate-400">Live issues requiring customer support attention</p>
                </div>
                <button
                  onClick={() => setActiveTab("User Problems")}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Manage All ({ticketsList.length}) →
                </button>
              </div>

              {ticketsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  ✓ No user problems submitted. All customer requests are clear!
                </div>
              ) : (
                <div className="space-y-3">
                  {ticketsList.slice(0, 4).map((ticket) => (
                    <div
                      key={ticket.ticketId}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition border border-slate-100"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-900">{ticket.ticketId}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                            {ticket.category}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 truncate">{ticket.subject}</p>
                        <p className="text-[11px] text-slate-500">{ticket.userName} ({ticket.userEmail})</p>
                      </div>
                      <button
                        onClick={() => openTicketDetail(ticket.ticketId)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                      >
                        Reply ➔
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3.1.5 Master Control Panel Tab */}
      {activeTab === "👑 Master Control Panel" && (
        <div className="space-y-6">
          {/* Admin Password Management & Quick Action Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin Security Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Admin Security</span>
                <h3 className="text-base font-black text-slate-900">Set Admin Account Password</h3>
                <p className="text-xs text-slate-400">Update the primary admin login credentials for SajiloMarts portal</p>
              </div>

              <form onSubmit={handleSaveAdminPassword} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">New Admin Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new admin password..."
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Confirm Admin Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new admin password..."
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 focus:border-purple-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs transition cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {savingPassword ? "Updating..." : "🔐 Update Admin Password"}
                </button>
              </form>
            </div>

            {/* Platform Control & Global Sourcing Rules */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">System Parameters</span>
                  <h3 className="text-base font-black text-slate-900">India ➔ Nepal Sourcing Rules</h3>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  Live Active
                </span>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span><strong>Base Currency Rate:</strong> 1 INR</span>
                  <span className="font-mono font-black text-slate-900">1.65 NPR</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span><strong>Service &amp; Clearance Charge:</strong></span>
                  <span className="font-mono font-black text-slate-900">+20%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span><strong>Nepal Flat Delivery:</strong></span>
                  <span className="font-mono font-black text-slate-900">Rs. 200</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span><strong>Default Payment Mode:</strong></span>
                  <span className="font-mono font-black text-slate-900">COD (50% Advance) / Full Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* User & Admin Roles Control Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Master User &amp; Role Management</h3>
                <p className="text-xs text-slate-400">View all registered accounts, grant/revoke Admin access, or manage accounts</p>
              </div>
              <button
                onClick={() => setAddUserModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                ➕ Add New User / Admin
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Auth Provider</th>
                    <th className="pb-3">Current Role</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersLoading && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                        Loading users list...
                      </td>
                    </tr>
                  )}
                  {!usersLoading && usersList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                        No registered users found.
                      </td>
                    </tr>
                  )}
                  {!usersLoading &&
                    usersList.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50/60">
                        <td className="py-3.5">
                          <span className="font-bold text-slate-900 block">{user.fullName || "Unnamed User"}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{user._id}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="font-medium text-slate-800 block">{user.email}</span>
                          <span className="text-[11px] text-slate-500">{user.phone || "No phone"}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {user.authProvider || "Local / Credentials"}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {user.role === "admin" ? "👑 ADMIN" : "👤 USER"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleToggleUserRole(user._id, user.role)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              user.role === "admin"
                                ? "bg-amber-50 text-amber-800 hover:bg-amber-100"
                                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                            }`}
                          >
                            {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id, user.fullName)}
                            className="px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {addUserModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setAddUserModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Master Control</span>
                <h3 className="text-base font-black text-slate-900">Create New Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setAddUserModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:text-black hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pratik Sharma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+977 9800000000"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Account Password *</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">Account Role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as "user" | "admin")}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold focus:border-purple-600 focus:outline-none bg-white"
                >
                  <option value="user">👤 Regular User</option>
                  <option value="admin">👑 Platform Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black transition disabled:opacity-50 shadow-md cursor-pointer"
                >
                  {addingUser ? "Creating..." : "Create Account ➔"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3.2 India Orders & Invoices Tab */}
      {activeTab === "India Orders & Invoices" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Nepal → India Order Management ({indiaOrdersList.length})</h3>
                <p className="text-xs text-slate-400">Manage orders, view internal pricing breakdown &amp; print invoices</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3">Order &amp; Invoice</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Product / Store</th>
                    <th className="pb-3">INR Price</th>
                    <th className="pb-3">Final NPR</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Link Verification</th>
                    <th className="pb-3">Order Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {indiaOrdersList.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <span className="text-4xl">📭</span>
                          <span className="text-sm font-bold">No India orders yet</span>
                          <span className="text-xs">Orders placed by customers will appear here in real-time.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {indiaOrdersList.map((o) => (
                    <tr key={o.orderId} className="hover:bg-slate-50/60">
                      <td className="py-3.5">
                        <span className="font-mono font-black text-slate-900 block">{o.orderId}</span>
                        <span className="font-mono text-[10px] text-slate-500">{o.invoiceNumber}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-bold text-slate-900 block">{o.customerName}</span>
                        <span className="text-[11px] text-slate-500">{o.phone}</span>
                        {o.marketplace && (
                          <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            🇮🇳 {o.marketplace.replace("amazon-india","Amazon IN").replace("tatacliq","Tata CLiQ").replace("boat","boAt").replace(/-/g," ").replace(/\b\w/g,(c)=>c.toUpperCase())}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 max-w-[220px]">
                        <span className="font-bold text-slate-800 line-clamp-1 block">{o.productName}</span>
                        <a
                          href={o.originalSourceUrl || o.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 underline mt-0.5"
                        >
                          Open Original Product ↗
                        </a>
                      </td>
                      <td className="py-3.5 font-bold text-slate-700">
                        ₹{Number(o.indianPriceINR).toLocaleString()} INR
                      </td>
                      <td className="py-3.5 font-black text-red-600">
                        {formatNpr(o.finalAmountNPR)}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border block w-fit mb-1 ${getStatusBadge(o.paymentStatus)}`}>
                          {o.paymentStatus} ({o.paymentMethod === "FULL_PAYMENT" ? "Online" : "COD"})
                        </span>
                        <select
                          defaultValue={o.paymentStatus}
                          onChange={(e) => updateIndiaOrderStatus(o._id || o.orderId, o.orderStatus, e.target.value)}
                          className="text-[10px] font-bold rounded border border-slate-200 bg-white p-1"
                        >
                          <option value="Pending">Pending</option>
                          <option value="PAID">PAID</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border inline-block mb-1.5 ${getStatusBadge(o.adminVerificationStatus || "Pending Verification")}`}>
                          {o.adminVerificationStatus || "Pending Verification"}
                        </span>
                        <div>
                          <button
                            type="button"
                            onClick={() => openOrderVerificationModal(o)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[10px] transition cursor-pointer"
                          >
                            🔍 Verify Link
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <select
                          defaultValue={o.orderStatus}
                          onChange={(e) => updateIndiaOrderStatus(o._id || o.orderId, e.target.value, o.paymentStatus)}
                          className="text-xs font-bold rounded-lg border border-slate-300 bg-white p-1.5 focus:border-slate-900"
                        >
                          <option value="Requested">Requested</option>
                          <option value="Verified">Verified</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Purchased">Purchased</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Arrived in Nepal">Arrived in Nepal</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 text-right space-y-1.5">
                        <button
                          onClick={() => openOrderDetail(o.orderId)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer block w-full"
                        >
                          Details ➔
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3.3 Product Requests & Alternative Sourcing Tab */}
      {activeTab === "Product Requests" && (
        <div className="space-y-6">
          {/* Real-time DB Statistics Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
            {[
              { id: "all", label: "Total", count: productRequestCounts.total, bg: "bg-slate-900 text-white" },
              { id: "Pending", label: "Pending", count: productRequestCounts.pending, bg: "bg-amber-500 text-white" },
              { id: "Reviewing", label: "Reviewing", count: productRequestCounts.reviewing, bg: "bg-blue-600 text-white" },
              { id: "Alternative Found", label: "Alt Found", count: productRequestCounts.alternativeFound, bg: "bg-purple-600 text-white" },
              { id: "Waiting for User", label: "Waiting User", count: productRequestCounts.waitingForUser, bg: "bg-indigo-600 text-white" },
              { id: "Converted to Order", label: "Converted", count: productRequestCounts.converted, bg: "bg-emerald-600 text-white" },
              { id: "Closed", label: "Closed", count: productRequestCounts.closed, bg: "bg-slate-700 text-white" }
            ].map((st) => (
              <div
                key={st.id}
                onClick={() => setProductRequestFilterStatus(st.id)}
                className={`rounded-2xl p-4 border text-center transition cursor-pointer ${
                  productRequestFilterStatus === st.id ? `${st.bg} border-transparent shadow-sm` : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">{st.label}</span>
                <p className="text-xl font-black mt-0.5">{st.count}</p>
              </div>
            ))}
          </div>

          {/* Product Requests Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Unavailable Product Requests &amp; Alternative Sourcing</h3>
                <p className="text-xs text-slate-400">Review customer requests for items that failed automated availability and provide independently verified alternative links.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3">Request ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Original Product &amp; URL</th>
                    <th className="pb-3">Variant / Qty</th>
                    <th className="pb-3">Failure Reason / Verification</th>
                    <th className="pb-3">Alternative Product Offer</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productRequestsList
                    .filter((r) => {
                      if (productRequestFilterStatus !== "all" && r.status !== productRequestFilterStatus) return false;
                      if (searchFilter.trim()) {
                        const q = searchFilter.toLowerCase();
                        return (
                          r.requestId?.toLowerCase().includes(q) ||
                          r.userName?.toLowerCase().includes(q) ||
                          r.phone?.toLowerCase().includes(q) ||
                          r.email?.toLowerCase().includes(q) ||
                          r.productName?.toLowerCase().includes(q) ||
                          r.originalMarketplace?.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((reqItem) => {
                      return (
                        <tr key={reqItem.requestId} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 font-mono font-black text-slate-900">
                            <div>{reqItem.requestId}</div>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {reqItem.createdAt ? new Date(reqItem.createdAt).toLocaleDateString() : ""}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <p className="font-extrabold text-slate-900">{reqItem.userName}</p>
                            <p className="text-[11px] text-slate-500">{reqItem.phone}</p>
                            {reqItem.email && <p className="text-[10px] text-slate-400">{reqItem.email}</p>}
                          </td>
                          <td className="py-3.5 max-w-[220px]">
                            <div className="flex items-center gap-2">
                              {reqItem.productImage && (
                                <img
                                  src={reqItem.productImage}
                                  alt=""
                                  className="h-9 w-9 rounded-lg object-contain bg-slate-100 p-0.5 flex-shrink-0"
                                />
                              )}
                              <div className="truncate">
                                <p className="font-bold text-slate-800 truncate">{reqItem.productName || "Product"}</p>
                                <a
                                  href={reqItem.originalProductUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5"
                                >
                                  <span>Original Link ↗</span>
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className="font-bold">Qty: {reqItem.requestedQuantity || 1}</span>
                            {(reqItem.requestedSize || reqItem.requestedColor) && (
                              <p className="text-[10px] text-slate-500">
                                {[reqItem.requestedSize, reqItem.requestedColor].filter(Boolean).join(" • ")}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 max-w-[180px]">
                            <p className="text-[11px] text-amber-800 bg-amber-50 rounded-lg p-1.5 border border-amber-200/60 leading-tight">
                              {reqItem.reason || "Direct order unavailable"}
                            </p>
                          </td>
                          <td className="py-3.5 max-w-[200px]">
                            {reqItem.alternativeProduct?.productUrl ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800">
                                  ✓ Verified (₹{reqItem.alternativeProduct.priceINR})
                                </span>
                                <p className="text-[11px] font-bold text-slate-800 truncate">
                                  {reqItem.alternativeProduct.productName}
                                </p>
                                <a
                                  href={reqItem.alternativeProduct.productUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-purple-700 font-bold hover:underline block truncate"
                                >
                                  Alternative URL ↗
                                </a>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No alternative provided yet</span>
                            )}
                          </td>
                          <td className="py-3.5">
                            <select
                              value={reqItem.status}
                              onChange={(e) => handleUpdateProductRequestStatus(reqItem.requestId, e.target.value)}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Reviewing">Reviewing</option>
                              <option value="Alternative Found">Alternative Found</option>
                              <option value="Waiting for User">Waiting for User</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Converted to Order">Converted to Order</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                          <td className="py-3.5 text-right space-y-1">
                            <button
                              onClick={() => handleOpenAlternativeModal(reqItem)}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                            >
                              {reqItem.alternativeProduct ? "Update Alt ➔" : "+ Alt Link ➔"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  {productRequestsList.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <span className="text-4xl">📋</span>
                          <span className="text-sm font-bold">No product requests submitted</span>
                          <span className="text-xs">When users encounter unavailable items or submit requests, they will appear here.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3.4 User Problems & Support Tickets Tab (Complete Specification) */}
      {activeTab === "User Problems" && (
        <div className="space-y-6">
          {/* Real-time DB Statistics Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <div
              onClick={() => setTicketFilterStatus("all")}
              className={`rounded-2xl p-4 border text-center transition cursor-pointer ${
                ticketFilterStatus === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Total</span>
              <p className="text-xl font-black mt-0.5">{ticketCounts.total}</p>
            </div>

            <div
              onClick={() => setTicketFilterStatus("open")}
              className={`rounded-2xl p-4 border text-center transition cursor-pointer ${
                ticketFilterStatus === "open" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50/50"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Open</span>
              <p className="text-xl font-black mt-0.5">{ticketCounts.open}</p>
            </div>

            <div
              onClick={() => setTicketFilterStatus("in progress")}
              className={`rounded-2xl p-4 border text-center transition cursor-pointer ${
                ticketFilterStatus === "in progress" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50/50"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">In Progress</span>
              <p className="text-xl font-black mt-0.5">{ticketCounts.inProgress}</p>
            </div>

            <div
              onClick={() => setTicketFilterStatus("waiting for user")}
              className={`rounded-2xl p-4 border text-center transition cursor-pointer ${
                ticketFilterStatus === "waiting for user" ? "bg-purple-600 text-white border-purple-600" : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50/50"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Waiting User</span>
              <p className="text-xl font-black mt-0.5">{ticketCounts.waitingForUser}</p>
            </div>

            <div
              onClick={() => setTicketFilterStatus("resolved")}
              className={`rounded-2xl p-4 border text-center transition cursor-pointer ${
                ticketFilterStatus === "resolved" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50/50"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Resolved</span>
              <p className="text-xl font-black mt-0.5">{ticketCounts.resolved}</p>
            </div>

            <div
              onClick={() => setTicketFilterStatus("closed")}
              className={`rounded-2xl p-4 border text-center transition cursor-pointer ${
                ticketFilterStatus === "closed" ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Closed</span>
              <p className="text-xl font-black mt-0.5">{ticketCounts.closed}</p>
            </div>
          </div>

          {/* Ticket Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">User Support Tickets &amp; Complaints ({filteredTickets.length})</h3>
                <p className="text-xs text-slate-400">Review tickets submitted by customers, send replies, or add internal notes.</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={ticketFilterCategory}
                  onChange={(e) => setTicketFilterCategory(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Order Problem">Order Problem</option>
                  <option value="Payment Problem">Payment Problem</option>
                  <option value="Product Problem">Product Problem</option>
                  <option value="Delivery Problem">Delivery Problem</option>
                  <option value="Account Problem">Account Problem</option>
                  <option value="Website/Technical Problem">Website/Technical Problem</option>
                  <option value="Refund/Return Problem">Refund/Return Problem</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3">Ticket ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Subject &amp; Category</th>
                    <th className="pb-3">Related Order</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <span className="text-4xl">🎫</span>
                          <span className="text-sm font-bold">No support tickets found</span>
                          <span className="text-xs">Any reported customer problems will be displayed here in real-time.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => (
                      <tr key={t.ticketId} className="hover:bg-slate-50/60">
                        <td className="py-3.5 font-mono font-black text-slate-900">
                          {t.ticketId}
                        </td>
                        <td className="py-3.5">
                          <span className="font-bold text-slate-900 block">{t.userName}</span>
                          <span className="text-[11px] text-slate-500">{t.userEmail}</span>
                        </td>
                        <td className="py-3.5 max-w-[220px]">
                          <span className="font-bold text-slate-800 line-clamp-1 block">{t.subject}</span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3.5">
                          {t.orderId ? (
                            <span className="font-mono text-blue-600 font-bold">{t.orderId}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.priority === "Urgent" ? "bg-red-100 text-red-800" : t.priority === "High" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-500 text-[11px]">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => openTicketDetail(t.ticketId)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                          >
                            Manage Ticket ➔
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* 3.5 Products Tab */}
      {activeTab === "Products" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Add New Product to Store Catalog</h3>
            <form onSubmit={createProduct} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Product Title *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Category *</label>
                <select
                  name="category"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Brand Name</label>
                <input
                  name="brand"
                  placeholder="e.g. Sony"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Selling Price (NPR) *</label>
                <input
                  name="price"
                  type="number"
                  required
                  placeholder="e.g. 45000"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Original Price (Strike)</label>
                <input
                  name="originalPrice"
                  type="number"
                  placeholder="e.g. 52000"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Stock Quantity *</label>
                <input
                  name="stock"
                  type="number"
                  required
                  defaultValue={15}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Highlight Badge</label>
                <select
                  name="badge"
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="NEW">NEW</option>
                  <option value="TRENDING">TRENDING</option>
                  <option value="BEST SELLER">BEST SELLER</option>
                  <option value="SALE">SALE</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Image URL *</label>
                <input
                  name="image"
                  required
                  defaultValue="https://images.unsplash.com/photo-1545454675-3531b543be5d"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Description</label>
                <input
                  name="description"
                  placeholder="Short description..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4 pt-2">
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-8 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition cursor-pointer"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Store Catalog ({productsList.length} Items)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock Status</th>
                    <th className="pb-3">Badge</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productsList.map((p) => (
                    <tr key={p._id || p.id || p.name} className="hover:bg-slate-50/60">
                      <td className="py-3.5 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3.5 text-slate-600">{p.category}</td>
                      <td className="py-3.5 font-extrabold text-slate-900">{formatNpr(p.price)}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${p.stock > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                          {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                        </span>
                      </td>
                      <td className="py-3.5">
                        {p.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px]">
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => deleteProduct(p._id || p.id || "", p.name)}
                          className="px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3.6 Store Orders Tab */}
      {activeTab === "Store Orders" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Manage Store Catalog Orders</h3>
            <div className="space-y-4">
              {ordersList.map((o) => (
                <div
                  key={o._id}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 font-mono">{o.orderId}</span>
                      <span className="text-slate-500 ml-2 font-semibold">• {o.fullName} ({o.phone})</span>
                    </div>
                    <span className="font-black text-sm text-slate-900">{formatNpr(o.total || 0)}</span>
                  </div>
                  <p className="text-slate-600"><strong>Shipping Address:</strong> {o.fullAddress}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3.7 Payment Verification Tab */}
      {activeTab === "Payment Verification" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900">Payment Evidence Review</h3>
          <div className="space-y-4">
            {paymentsList.length === 0 && <p className="text-xs text-slate-500">No payment screenshots submitted yet.</p>}
            {paymentsList.map((payment) => (
              <div key={payment._id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 text-xs space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-semibold">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Order Reference</span>
                    <span className="font-mono text-slate-900">{payment.orderId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Amount</span>
                    <span className="font-black text-slate-900">{formatNpr(payment.amount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Method</span>
                    <span className="text-slate-900">{payment.paymentMethod || payment.provider || "eSewa/Khalti"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                  <a
                    href={`/api/admin/payments/${payment._id}/screenshot`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    View Screenshot ↗
                  </a>
                  {payment.status === "submitted" && (
                    <>
                      <button
                        onClick={() => updatePaymentStatus(payment._id, "verified")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-500 transition cursor-pointer"
                      >
                        Approve Payment
                      </button>
                      <button
                        onClick={() => updatePaymentStatus(payment._id, "rejected")}
                        className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-500 transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3.8 Coupons & Settings Tab */}
      {activeTab === "Coupons & Settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Active Coupons</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 py-2.5">
                <span className="font-mono font-black text-slate-900">WELCOME10</span>
                <span className="text-slate-600">10% Off (Min Rs. 1,500)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2.5">
                <span className="font-mono font-black text-slate-900">SAJILOMARTS500</span>
                <span className="text-slate-600">Rs. 500 Flat Off (Min Rs. 3,500)</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="font-mono font-black text-slate-900">FESTIVE15</span>
                <span className="text-slate-600">15% Off (Min Rs. 5,000)</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900">System Parameters</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <p>• <strong>India Base Conversion:</strong> 1 INR = 1.65 NPR</p>
              <p>• <strong>India Service Charge:</strong> 20% of converted amount</p>
              <p>• <strong>Nepal Flat Delivery:</strong> Rs. 200</p>
              <p>• <strong>Payment Methods:</strong> COD &amp; Full Online Payment</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. FULL ORDER DETAILS SLIDE-OVER PANEL ─── */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrderDetail(null)}>
          <div
            className="relative w-full sm:w-[640px] lg:w-[720px] h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto bg-white sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 text-white px-6 py-4 sm:rounded-t-3xl">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Admin — Order Details</span>
                <h2 className="text-base font-black mt-0.5">{selectedOrderDetail.orderId}</h2>
                <span className="text-xs text-slate-400 font-mono">{selectedOrderDetail.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                {detailLoading && <span className="text-xs text-slate-400 animate-pulse">Refreshing...</span>}
                <button onClick={() => setSelectedOrderDetail(null)} className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition cursor-pointer">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* ORDER INFO */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="Order ID" value={selectedOrderDetail.orderId} mono />
                  <InfoRow label="Invoice Number" value={selectedOrderDetail.invoiceNumber} mono />
                  <InfoRow label="Created At" value={selectedOrderDetail.createdAt ? new Date(selectedOrderDetail.createdAt).toLocaleString("en-NP", { dateStyle: "medium", timeStyle: "short" }) : "—"} />
                  <InfoRow label="Order Status" value={
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedOrderDetail.orderStatus)}`}>{selectedOrderDetail.orderStatus}</span>
                  } />
                </div>
              </section>

              {/* CUSTOMER */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="Full Name" value={selectedOrderDetail.customerName} />
                  <InfoRow label="Phone" value={selectedOrderDetail.phone} />
                  <InfoRow label="Email" value={selectedOrderDetail.email || "—"} />
                  <InfoRow label="Customer ID" value={selectedOrderDetail.customerId || "Guest"} mono />
                </div>
              </section>

              {/* DELIVERY */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Delivery Address (Order Snapshot)</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="Street / Area" value={selectedOrderDetail.deliveryAddress || "—"} />
                  <InfoRow label="City" value={selectedOrderDetail.city || "—"} />
                  <InfoRow label="District" value={selectedOrderDetail.district || "—"} />
                  <InfoRow label="Province" value={selectedOrderDetail.province || "—"} />
                  <InfoRow label="Postal Code" value={selectedOrderDetail.postalCode || "—"} />
                  {selectedOrderDetail.deliveryInstructions && (
                    <div className="col-span-2">
                      <InfoRow label="Delivery Instructions" value={selectedOrderDetail.deliveryInstructions} />
                    </div>
                  )}
                </div>
              </section>

              {/* PRODUCT & MARKETPLACE */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Product &amp; Indian Marketplace</h3>
                <div className="flex gap-3 mb-3">
                  {selectedOrderDetail.productImage && (
                    <img
                      src={selectedOrderDetail.productImage}
                      alt={selectedOrderDetail.productName}
                      className="h-20 w-20 rounded-xl object-contain border border-slate-200 bg-slate-50 p-1 flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm leading-snug">{selectedOrderDetail.productName}</p>
                    {selectedOrderDetail.marketplace && (
                      <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        🇮🇳 {selectedOrderDetail.marketplace.replace("amazon-india","Amazon India").replace("tatacliq","Tata CLiQ").replace("boat","boAt").replace(/-/g," ").replace(/\b\w/g,(c: string)=>c.toUpperCase())}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="Quantity" value={String(selectedOrderDetail.quantity)} />
                  <InfoRow label="Variant" value={selectedOrderDetail.productVariant || "—"} />
                  <InfoRow label="Size" value={selectedOrderDetail.size || "—"} />
                  <InfoRow label="Color" value={selectedOrderDetail.color || "—"} />
                </div>
                {/* Submitted Link & Open Original Product */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Customer Submitted Indian Product Link
                  </span>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <a
                      href={selectedOrderDetail.originalSourceUrl || selectedOrderDetail.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-[11px] text-blue-600 hover:underline font-mono truncate p-2.5 rounded-xl bg-slate-50 border border-slate-200 block"
                    >
                      {selectedOrderDetail.originalSourceUrl || selectedOrderDetail.productUrl}
                    </a>
                    <a
                      href={selectedOrderDetail.originalSourceUrl || selectedOrderDetail.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition shadow-xs flex items-center justify-center gap-1"
                    >
                      🇮🇳 Open Original Product ↗
                    </a>
                  </div>
                </div>
              </section>

              {/* ADMIN PRODUCT VERIFICATION & SOURCING */}
              <section className="border-t border-slate-100 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-700">Admin Control</span>
                    <h3 className="text-xs font-black text-slate-900">
                      Product Link Verification &amp; Sourcing Status
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => openOrderVerificationModal(selectedOrderDetail)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition cursor-pointer shadow-xs"
                  >
                    🔍 Verify / Update Product Link
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Verification Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border inline-block mt-1 ${getStatusBadge(selectedOrderDetail.adminVerificationStatus || "Pending Verification")}`}>
                      {selectedOrderDetail.adminVerificationStatus || "Pending Verification"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Stock Status</span>
                    <span className="font-bold text-slate-900 mt-1 block">
                      {selectedOrderDetail.adminStockStatus || selectedOrderDetail.stockStatus || "Awaiting Verification"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Delivery Status</span>
                    <span className="font-bold text-slate-900 mt-1 block">
                      {selectedOrderDetail.adminDeliveryStatus || selectedOrderDetail.deliveryStatus || "Awaiting Verification"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Verified INR Price</span>
                    <span className="font-bold text-slate-900 mt-1 block">
                      {selectedOrderDetail.adminVerifiedPriceINR ? `₹${selectedOrderDetail.adminVerifiedPriceINR.toLocaleString()} INR` : `₹${selectedOrderDetail.indianPriceINR.toLocaleString()} INR (Entered)`}
                    </span>
                  </div>
                </div>

                {/* Verified Variant & Alternative Link Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Verified Variant / Note</span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {selectedOrderDetail.adminVerifiedVariant || selectedOrderDetail.productVariant || selectedOrderDetail.adminNote || "None specified"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Alternative Source Link</span>
                    {selectedOrderDetail.alternativeSourceUrl ? (
                      <a
                        href={selectedOrderDetail.alternativeSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-purple-700 hover:underline block truncate mt-0.5"
                      >
                        {selectedOrderDetail.alternativeSourceUrl} ↗
                      </a>
                    ) : (
                      <span className="text-slate-400 mt-0.5 block">No alternative required</span>
                    )}
                  </div>
                </div>
              </section>

              {/* PRICE BREAKDOWN */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Price &amp; Payment Breakdown</h3>
                <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Indian Product Price (INR ₹)</span>
                    <span className="font-bold text-white">₹{Number(selectedOrderDetail.indianPriceINR).toLocaleString("en-IN")} INR</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Base Conversion (× 1.65)</span>
                    <span>Rs. {Number(selectedOrderDetail.conversionAmountNPR).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Service Fee (+ 20%)</span>
                    <span>Rs. {Number(selectedOrderDetail.serviceChargeNPR).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Nepal Delivery</span>
                    <span>Rs. {Number(selectedOrderDetail.deliveryChargeNPR || 200).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700 font-black text-sm">
                    <span className="text-amber-400">Total Order Amount (NPR)</span>
                    <span className="text-red-400">Rs. {Number(selectedOrderDetail.finalAmountNPR).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Online Advance Required (50%):</span>
                      <span>Rs. {Number((selectedOrderDetail as any).onlineAdvanceAmountNPR || Math.round(selectedOrderDetail.finalAmountNPR * (selectedOrderDetail.paymentMethod === "COD" ? 0.5 : 1))).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 font-bold">
                      <span>Remaining COD on Delivery:</span>
                      <span>Rs. {Number((selectedOrderDetail as any).codRemainingAmountNPR || (selectedOrderDetail.paymentMethod === "COD" ? selectedOrderDetail.finalAmountNPR - Math.round(selectedOrderDetail.finalAmountNPR * 0.5) : 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* PAYMENT */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Payment Details</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <InfoRow label="Payment Method" value={selectedOrderDetail.paymentMethod === "FULL_PAYMENT" ? "Full Online Payment (100%)" : "COD (50% Online Advance)"} />
                  <InfoRow label="Payment Status" value={
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedOrderDetail.paymentStatus)}`}>{selectedOrderDetail.paymentStatus}</span>
                  } />
                  <InfoRow label="Transaction / Reference ID" value={selectedOrderDetail.paymentTransactionId || "—"} mono />
                  <InfoRow label="Online Advance Status" value={(selectedOrderDetail as any).onlinePaymentStatus || selectedOrderDetail.paymentStatus} />
                </div>
              </section>

              {/* ADMIN CONTROLS */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Admin Controls</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Update Payment Status</label>
                    <select
                      defaultValue={selectedOrderDetail.paymentStatus}
                      onChange={(e) => {
                        updateIndiaOrderStatus(selectedOrderDetail._id || selectedOrderDetail.orderId, selectedOrderDetail.orderStatus, e.target.value);
                        setSelectedOrderDetail((prev) => prev ? { ...prev, paymentStatus: e.target.value as any } : prev);
                      }}
                      className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white p-2 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="PAID">PAID</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Update Order Status</label>
                    <select
                      defaultValue={selectedOrderDetail.orderStatus}
                      onChange={(e) => {
                        updateIndiaOrderStatus(selectedOrderDetail._id || selectedOrderDetail.orderId, e.target.value, selectedOrderDetail.paymentStatus);
                        setSelectedOrderDetail((prev) => prev ? { ...prev, orderStatus: e.target.value as any } : prev);
                      }}
                      className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white p-2 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="Requested">Requested</option>
                      <option value="Verified">Verified</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Purchased">Purchased</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Arrived in Nepal">Arrived in Nepal</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            {/* Sticky footer actions */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-2 sm:rounded-b-3xl">
              <a
                href={selectedOrderDetail.productUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
              >
                🇮🇳 Open Original Product ↗
              </a>
              <a
                href={selectedOrderDetail.invoiceUrl || `/api/india-order/invoice/${selectedOrderDetail.orderId}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                🖨️ Print Invoice ↗
              </a>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. FULL TICKET DETAILS SLIDE-OVER PANEL (User Problems) ─── */}
      {selectedTicketDetail && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedTicketDetail(null)}
        >
          <div
            className="relative w-full sm:w-[680px] lg:w-[760px] h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto bg-white sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 text-white px-6 py-4 sm:rounded-t-3xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    User Problem Ticket
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedTicketDetail.status)}`}>
                    {selectedTicketDetail.status}
                  </span>
                </div>
                <h2 className="text-base font-black mt-0.5">{selectedTicketDetail.ticketId} — {selectedTicketDetail.subject}</h2>
                <span className="text-xs text-slate-400">Category: <strong>{selectedTicketDetail.category}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                {ticketDetailLoading && <span className="text-xs text-slate-400 animate-pulse">Refreshing...</span>}
                <button
                  onClick={() => setSelectedTicketDetail(null)}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* 1. Customer Info */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Customer Profile</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <InfoRow label="Customer Name" value={selectedTicketDetail.userName} />
                  <InfoRow label="Email Address" value={selectedTicketDetail.userEmail} />
                  <InfoRow label="Phone" value={selectedTicketDetail.userPhone || "—"} />
                  <InfoRow label="User ID" value={selectedTicketDetail.userId} mono />
                </div>
              </section>

              {/* 2. Problem Information */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Problem Information</h3>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <InfoRow label="Category" value={selectedTicketDetail.category} />
                    <InfoRow label="Priority" value={
                      <span className={`font-bold ${selectedTicketDetail.priority === "Urgent" ? "text-red-600 font-black" : ""}`}>
                        {selectedTicketDetail.priority}
                      </span>
                    } />
                    <InfoRow label="Submitted At" value={new Date(selectedTicketDetail.createdAt).toLocaleString()} />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Customer Description</span>
                    <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-800 border border-slate-200 leading-relaxed whitespace-pre-wrap">
                      {selectedTicketDetail.description}
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Related Order Snapshot (Live DB Object) */}
              {selectedTicketDetail.orderId && (
                <section className="border-t border-slate-100 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Related Order Snapshot (Order #{selectedTicketDetail.orderId})
                    </h3>
                    <span className="text-[10px] font-bold text-blue-600 font-mono">Live DB Record</span>
                  </div>

                  {selectedTicketDetail.relatedOrder ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-3">
                      <div className="flex items-start gap-3">
                        {(selectedTicketDetail.relatedOrder as any).productImage && (
                          <img
                            src={(selectedTicketDetail.relatedOrder as any).productImage}
                            alt=""
                            className="h-14 w-14 rounded-xl object-contain bg-white border border-slate-200 p-1 flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-slate-900">
                            {(selectedTicketDetail.relatedOrder as any).productName || "Order Item"}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Qty: {(selectedTicketDetail.relatedOrder as any).quantity || 1} • Total: <strong className="text-slate-900">{formatNpr((selectedTicketDetail.relatedOrder as any).finalAmountNPR || (selectedTicketDetail.relatedOrder as any).total || 0)}</strong>
                          </p>
                          {(selectedTicketDetail.relatedOrder as any).marketplace && (
                            <span className="inline-block mt-1 text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              🇮🇳 {(selectedTicketDetail.relatedOrder as any).marketplace}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80">
                        <InfoRow label="Order Status" value={
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge((selectedTicketDetail.relatedOrder as any).orderStatus || "Pending")}`}>
                            {(selectedTicketDetail.relatedOrder as any).orderStatus}
                          </span>
                        } />
                        <InfoRow label="Payment Status" value={
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge((selectedTicketDetail.relatedOrder as any).paymentStatus || "Pending")}`}>
                            {(selectedTicketDetail.relatedOrder as any).paymentStatus}
                          </span>
                        } />
                        <InfoRow label="Payment Method" value={(selectedTicketDetail.relatedOrder as any).paymentMethod || "COD"} />
                        <InfoRow label="City" value={(selectedTicketDetail.relatedOrder as any).city || (selectedTicketDetail.relatedOrder as any).shippingAddress?.city || "Nepal"} />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => openOrderDetail(selectedTicketDetail.orderId!)}
                          className="text-xs text-blue-600 font-bold hover:underline"
                        >
                          View Full Order Details Modal ➔
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-500 border border-slate-200">
                      Referenced Order ID: <strong className="font-mono text-slate-800">{selectedTicketDetail.orderId}</strong>
                    </div>
                  )}
                </section>
              )}

              {/* 4. Complete Conversation Thread */}
              <section className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Conversation History &amp; Internal Notes ({(selectedTicketDetail.messages || []).length})
                  </h3>
                </div>

                {(selectedTicketDetail.messages || []).length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No messages yet in this thread.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto p-2">
                    {selectedTicketDetail.messages.map((m) => {
                      const isInternal = m.messageType === "internal_note";
                      const isAdmin = m.senderRole === "admin";

                      return (
                        <div
                          key={m.messageId}
                          className={`rounded-2xl p-3.5 text-xs space-y-1.5 border ${
                            isInternal
                              ? "bg-amber-50/80 border-amber-300 text-amber-950"
                              : isAdmin
                              ? "bg-slate-900 text-white border-slate-800"
                              : "bg-slate-100 text-slate-900 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-[11px]">{m.senderName}</span>
                              {isInternal ? (
                                <span className="bg-amber-200 text-amber-900 text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase">
                                  🔒 INTERNAL NOTE (ADMINS ONLY)
                                </span>
                              ) : isAdmin ? (
                                <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase">
                                  ADMIN REPLY (CUSTOMER VISIBLE)
                                </span>
                              ) : (
                                <span className="bg-slate-200 text-slate-700 text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase">
                                  CUSTOMER
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] ${isAdmin && !isInternal ? "text-slate-400" : "text-slate-500"}`}>
                              {new Date(m.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 5. Reply / Internal Note Composer */}
              <section className="border-t border-slate-100 pt-5 space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Compose Response or Internal Note
                </h3>

                <form onSubmit={handleAdminTicketReply} className="space-y-3">
                  {/* Mode Selector */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="replyType"
                        checked={ticketReplyType === "reply"}
                        onChange={() => setTicketReplyType("reply")}
                        className="accent-slate-900"
                      />
                      <span>Reply to Customer (Visible in User Account)</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800 cursor-pointer">
                      <input
                        type="radio"
                        name="replyType"
                        checked={ticketReplyType === "internal_note"}
                        onChange={() => setTicketReplyType("internal_note")}
                        className="accent-amber-600"
                      />
                      <span>🔒 Internal Note (Hidden from Customer)</span>
                    </label>
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    placeholder={
                      ticketReplyType === "internal_note"
                        ? "Write an internal staff note for admin team eyes only..."
                        : "Type message to be sent directly to the customer..."
                    }
                    className={`w-full rounded-2xl border p-3 text-xs font-medium focus:outline-none transition ${
                      ticketReplyType === "internal_note"
                        ? "bg-amber-50/40 border-amber-300 focus:border-amber-600"
                        : "bg-slate-50 border-slate-200 focus:border-slate-900 focus:bg-white"
                    }`}
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {ticketReplyType === "internal_note"
                        ? "🔒 Will be saved to ticket history but NEVER sent to user."
                        : "✓ Customer will see this reply in their account."}
                    </span>
                    <button
                      type="submit"
                      disabled={ticketReplySubmitting || !ticketReplyText.trim()}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer disabled:opacity-50 ${
                        ticketReplyType === "internal_note"
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {ticketReplySubmitting
                        ? "Saving..."
                        : ticketReplyType === "internal_note"
                        ? "Save Internal Note"
                        : "Send Reply to Customer ➔"}
                    </button>
                  </div>
                </form>
              </section>

              {/* 6. Status & Priority Manager */}
              <section className="border-t border-slate-100 pt-5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Ticket Status &amp; Priority Management
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Change Status</label>
                    <select
                      value={selectedTicketDetail.status}
                      disabled={ticketStatusUpdating}
                      onChange={(e) => handleUpdateTicketStatus(e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white p-2.5 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting for User">Waiting for User</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Change Priority</label>
                    <select
                      value={selectedTicketDetail.priority}
                      disabled={ticketStatusUpdating}
                      onChange={(e) => handleUpdateTicketStatus(selectedTicketDetail.status, e.target.value)}
                      className="w-full text-xs font-bold rounded-xl border border-slate-200 bg-white p-2.5 focus:border-slate-900 focus:outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center sm:rounded-b-3xl">
              <span className="text-xs text-slate-400 font-mono">{selectedTicketDetail.ticketId}</span>
              <button
                onClick={() => setSelectedTicketDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Close Ticket View
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── 6. ALTERNATIVE PRODUCT SUBMISSION MODAL (Admin Verified Sourcing) ─── */}
      {alternativeModalOpen && selectedProductRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setAlternativeModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Verified Alternative Sourcing</span>
                <h3 className="text-base font-black text-slate-900">Provide Alternative Link ({selectedProductRequest.requestId})</h3>
              </div>
              <button
                type="button"
                onClick={() => setAlternativeModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:text-black hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Original Item Details Snapshot */}
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Customer Requested:</span>
              <p className="font-extrabold text-slate-900">{selectedProductRequest.productName}</p>
              <p className="text-slate-600 text-[11px]">
                Marketplace: {selectedProductRequest.originalMarketplace || "Indian Store"} • Qty: {selectedProductRequest.requestedQuantity || 1}
              </p>
              <p className="text-amber-800 text-[11px] bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                <strong>Failure Reason:</strong> {selectedProductRequest.reason || "Direct ordering failed"}
              </p>
            </div>

            {/* Verification Error Notice */}
            {alternativeVerificationError && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 space-y-1">
                <span className="font-bold block">❌ Backend Verification Rejected Alternative:</span>
                <p className="text-[11px] leading-relaxed">{alternativeVerificationError}</p>
                <p className="text-[10px] text-rose-600 font-bold mt-1">
                  Note: An unverified or out-of-stock alternative will never be marked as orderable.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitAlternativeProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                  Alternative Indian Marketplace URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.amazon.in/dp/... or https://www.flipkart.com/..."
                  value={alternativeUrlInput}
                  onChange={(e) => setAlternativeUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-[11px] focus:border-purple-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  The backend will independently check stock, delivery, and pricing for this URL before offering it.
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                  Price in India (INR ₹) (Optional - auto-extracted if empty)
                </label>
                <input
                  type="number"
                  min={1}
                  step="any"
                  placeholder="e.g. 1599"
                  value={alternativePriceInr}
                  onChange={(e) => setAlternativePriceInr(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-bold focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                  Admin Note to Customer (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Original seller was out of stock. We found the exact product from an authorized seller on Flipkart."
                  value={alternativeAdminNote}
                  onChange={(e) => setAlternativeAdminNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAlternativeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={alternativeSubmitting || !alternativeUrlInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black transition disabled:opacity-50 shadow-md cursor-pointer"
                >
                  {alternativeSubmitting ? "Verifying Alternative..." : "Verify & Submit Alternative ➔"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 7. INDIA ORDER PRODUCT LINK MANUAL VERIFICATION MODAL ─── */}
      {orderVerificationModalOpen && verifyingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setOrderVerificationModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Admin Sourcing Desk</span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Verify Product Link ({verifyingOrder.orderId})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOrderVerificationModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:text-black hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Customer Submitted Product Summary */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Customer Submitted Item:</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{verifyingOrder.productName}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Customer: <strong>{verifyingOrder.customerName}</strong> ({verifyingOrder.phone}) • Quantity: <strong>{verifyingOrder.quantity}</strong>
                  </p>
                </div>
                <span className="font-mono font-black text-red-600 text-sm bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                  ₹{Number(verifyingOrder.indianPriceINR).toLocaleString()} INR
                </span>
              </div>

              {/* Direct Open Button */}
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 font-mono truncate">
                  {verifyingOrder.originalSourceUrl || verifyingOrder.productUrl}
                </span>
                <a
                  href={verifyingOrder.originalSourceUrl || verifyingOrder.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition shadow-xs flex items-center justify-center gap-1 shrink-0"
                >
                  🇮🇳 Open Original Product ↗
                </a>
              </div>
            </div>

            {/* Form to Update Verification Status */}
            <form onSubmit={handleSaveOrderVerification} className="space-y-4 text-xs">
              {/* Verification Status */}
              <div>
                <label className="text-[11px] font-black uppercase text-slate-700 block mb-1">
                  Product Link Verification Status *
                </label>
                <select
                  value={adminVerificationStatus}
                  onChange={(e) => setAdminVerificationStatus(e.target.value)}
                  className="w-full rounded-xl border-2 border-purple-200 bg-white p-2.5 font-bold text-slate-900 focus:border-purple-600 focus:outline-none"
                >
                  <option value="Pending Verification">⏳ Pending Verification</option>
                  <option value="Verified / Orderable">✓ Verified / Orderable</option>
                  <option value="Unavailable">❌ Unavailable</option>
                  <option value="Alternative Required">🔄 Alternative Required</option>
                  <option value="Rejected">🚫 Rejected</option>
                </select>
              </div>

              {/* Stock & Delivery Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                    Marketplace Stock Status *
                  </label>
                  <select
                    value={adminStockStatus}
                    onChange={(e) => setAdminStockStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 font-semibold text-slate-800 focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Available">✓ Available</option>
                    <option value="Unavailable">❌ Unavailable</option>
                    <option value="Not Checked">⏳ Not Checked</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                    Marketplace Delivery Status *
                  </label>
                  <select
                    value={adminDeliveryStatus}
                    onChange={(e) => setAdminDeliveryStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 font-semibold text-slate-800 focus:border-purple-600 focus:outline-none"
                  >
                    <option value="Available">✓ Available</option>
                    <option value="Unavailable">❌ Unavailable</option>
                    <option value="Not Checked">⏳ Not Checked</option>
                  </select>
                </div>
              </div>

              {/* Verified Price & Verified Variant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                    Verified Indian Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    placeholder="e.g. 1999"
                    value={adminVerifiedPriceINR}
                    onChange={(e) => setAdminVerifiedPriceINR(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-bold text-slate-900 focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                    Verified Variant / Size / Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Size L / Midnight Black"
                    value={adminVerifiedVariant}
                    onChange={(e) => setAdminVerifiedVariant(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 font-medium text-slate-800 focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Alternative Source URL (If Alternative Required) */}
              {(adminVerificationStatus === "Alternative Required" || alternativeSourceUrl) && (
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <label className="text-[10px] font-black uppercase text-purple-900 block">
                    Alternative Product Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.flipkart.com/... or alternative store link"
                    value={alternativeSourceUrl}
                    onChange={(e) => setAlternativeSourceUrl(e.target.value)}
                    className="w-full rounded-xl border border-purple-300 bg-white p-2 font-mono text-[11px] focus:border-purple-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-purple-800">
                    Both the customer&apos;s original link and this alternative link will be preserved on the order.
                  </p>
                </div>
              )}

              {/* Admin Note */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-600 block mb-1">
                  Admin Verification Note (Visible to Customer in Order Details)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Product link verified with official brand seller. Proceeding with India transit dispatch."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 font-medium text-slate-800 focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOrderVerificationModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVerification}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition disabled:opacity-50 shadow-md cursor-pointer"
                >
                  {savingVerification ? "Saving..." : "Save Verification & Update Order ➔"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
