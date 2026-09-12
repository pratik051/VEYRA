"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/providers/cart-provider";
import { formatNpr, generateId } from "@/lib/utils";
import { nepalProvinces } from "@/lib/data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";

interface SavedAddress {
  _id?: string;
  fullName: string;
  phone: string;
  email?: string;
  province: string;
  district: string;
  city: string;
  ward?: string;
  fullAddress: string;
  landmark?: string;
  postalCode?: string;
  country?: string;
  label?: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [orderId, setOrderId] = useState("");
  const [confirmedAmount, setConfirmedAmount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"Khalti" | "eSewa" | "MyPay">("eSewa");
  const [paymentMode, setPaymentMode] = useState<"COD" | "FULL_PAYMENT">("COD");
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [appliedReferral, setAppliedReferral] = useState<string>("");
  const [referralResult, setReferralResult] = useState<{ applied: boolean; message: string; discount: number } | null>(null);
  const [calculatingBreakdown, setCalculatingBreakdown] = useState(false);
  const [qrError, setQrError] = useState(false);
  const [qrKey, setQrKey] = useState(0);

  const [breakdown, setBreakdown] = useState<{
    subtotal: number;
    deliveryFee: number;
    discount: number;
    finalAmount: number;
    onlineAmount: number;
    codAmount: number;
  }>({
    subtotal: 0,
    deliveryFee: 0,
    discount: 0,
    finalAmount: 0,
    onlineAmount: 0,
    codAmount: 0
  });

  const [paymentInfo, setPaymentInfo] = useState<{ provider?: string; status?: string; redirectUrl?: string } | null>(null);
  const [transactionCode, setTransactionCode] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const { pushToast } = useToast();

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [isCustomAddress, setIsCustomAddress] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Manual / New Address Form State
  const [manualForm, setManualForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    province: nepalProvinces[2], // Bagmati
    district: "",
    city: "",
    ward: "",
    fullAddress: "",
    landmark: "",
    postalCode: "",
    label: "Home"
  });

  useEffect(() => {
    if (!items.length) {
      setIsAuthReady(true);
      return;
    }

    let isMounted = true;
    const initAuthAndAddresses = async () => {
      try {
        const authRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (!isMounted) return;

        if (!authRes.ok) {
          router.replace("/account?tab=Security%20%26%20Auth");
          return;
        }

        const authData = await authRes.json();
        const user = authData.user;
        if (user) {
          setManualForm((prev) => ({
            ...prev,
            fullName: user.fullName || "",
            phone: user.phone || "",
            email: user.email || "",
            province: user.province || nepalProvinces[2],
            district: user.district || "",
            city: user.city || "",
            ward: user.ward || "",
            fullAddress: user.fullAddress || "",
            landmark: user.landmark || ""
          }));
        }

        // Fetch user addresses
        const addrRes = await fetch("/api/user/addresses", { cache: "no-store" });
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          if (addrData.success && Array.isArray(addrData.addresses) && addrData.addresses.length > 0) {
            setSavedAddresses(addrData.addresses);
            const def = addrData.defaultAddress || addrData.addresses[0];
            setSelectedAddress(def);
            setIsCustomAddress(false);
          } else {
            setIsCustomAddress(true);
            setSaveAsDefault(true);
          }
        } else {
          setIsCustomAddress(true);
          setSaveAsDefault(true);
        }

        setIsAuthReady(true);
      } catch (error) {
        if (!isMounted) return;
        console.error("Checkout auth / address check failed", error);
        router.replace("/account?tab=Security%20%26%20Auth");
      }
    };

    void initAuthAndAddresses();
    return () => {
      isMounted = false;
    };
  }, [items.length, router]);
  useEffect(() => {
    if (!items.length) return;
    let isSubscribed = true;

    async function fetchBackendBreakdown() {
      setCalculatingBreakdown(true);
      try {
        const delFee = subtotal >= 3000 ? 0 : 200;
        const res = await fetch("/api/checkout/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subtotal,
            deliveryFee: delFee,
            referralCode: appliedReferral,
            paymentMethod: paymentMode
          })
        });

        const data = await res.json();
        if (isSubscribed && res.ok && data.success) {
          setBreakdown({
            subtotal: data.subtotal,
            deliveryFee: data.deliveryFee,
            discount: data.discount,
            finalAmount: data.finalAmount,
            onlineAmount: data.onlineAmount,
            codAmount: data.codAmount
          });
        }
      } catch (err) {
        console.error("Backend breakdown calculation failed:", err);
      } finally {
        if (isSubscribed) setCalculatingBreakdown(false);
      }
    }

    void fetchBackendBreakdown();
    return () => {
      isSubscribed = false;
    };
  }, [items.length, subtotal, paymentMode, appliedReferral]);

  const handleApplyReferral = async (e: FormEvent) => {
    e.preventDefault();
    const code = referralCodeInput.trim().toUpperCase();
    if (!code) return;

    try {
      const delFee = subtotal >= 3000 ? 0 : 200;
      const res = await fetch("/api/checkout/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtotal,
          deliveryFee: delFee,
          referralCode: code,
          paymentMethod: paymentMode
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.referralApplied) {
          setAppliedReferral(code);
          setReferralResult({ applied: true, message: data.referralMessage, discount: data.discount });
          pushToast(data.referralMessage, "success");
        } else {
          setReferralResult({ applied: false, message: data.referralMessage, discount: 0 });
          pushToast(data.referralMessage, "error");
        }
      }
    } catch {
      pushToast("Unable to validate referral code right now.", "error");
    }
  };

  const delivery = items.length ? (subtotal >= 3000 ? 0 : 200) : 0;
  const total = subtotal + delivery;
  const paymentMethods: Array<{ id: "Khalti" | "eSewa" | "MyPay"; name: string; desc: string }> = [
    { id: "Khalti", name: "Khalti", desc: "Pay securely with Khalti QR." },
    { id: "eSewa", name: "eSewa", desc: "Pay securely with eSewa QR." },
    { id: "MyPay", name: "MyPay", desc: "Pay securely with MyPay QR." }
  ];

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!items.length) {
      pushToast("Your cart is empty.", "error");
      return;
    }
    setLoading(true);
    setError("");

    // Determine which address to send: selected saved address OR custom manual form
    const activeAddress = (!isCustomAddress && selectedAddress) ? selectedAddress : manualForm;

    if (!activeAddress.fullName || !activeAddress.phone || !activeAddress.fullAddress) {
      setError("Please complete all required delivery address fields.");
      pushToast("Please complete all required delivery address fields.", "error");
      setLoading(false);
      return;
    }

    const payload = {
      fullName: activeAddress.fullName.trim(),
      phone: activeAddress.phone.trim(),
      email: (activeAddress.email || "").trim(),
      province: activeAddress.province || "Bagmati",
      district: activeAddress.district || "",
      city: activeAddress.city || "",
      ward: activeAddress.ward || "",
      fullAddress: activeAddress.fullAddress.trim(),
      landmark: activeAddress.landmark || "",
      postalCode: activeAddress.postalCode || "",
      country: "Nepal",
      saveAsDefault: isCustomAddress ? saveAsDefault : false,
      paymentMethod: paymentMode === "COD" ? "COD" : selectedPayment,
      referralCode: appliedReferral,
      items: items.map((item) => ({ productId: item.id, quantity: item.quantity, unitPrice: item.price }))
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Checkout failed.");
        pushToast(data.error || "Checkout failed.", "error");
        setLoading(false);
        return;
      }
      const confirmedId = data.orderId || generateId("ORD");
      setOrderId(confirmedId);
      setConfirmedAmount(data.payment?.amount || total);
      setPaymentInfo(data.payment || null);
      pushToast(`Order ${confirmedId} placed successfully!`, "success");
      clearCart();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Network error occurred. Please try again.");
      setLoading(false);
    }
  };

  const submitPaymentEvidence = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!screenshot || !transactionCode.trim()) return;
    setPaymentSubmitting(true);
    setPaymentMessage("");
    const form = new FormData();
    form.append("orderId", orderId);
    form.append("paymentMethod", selectedPayment);
    form.append("transactionCode", transactionCode.trim());
    form.append("screenshot", screenshot);
    const response = await fetch("/api/payments/submit", { method: "POST", body: form });
    const data = await response.json();
    setPaymentSubmitting(false);
    setPaymentMessage(data.message || data.error || "Unable to submit payment.");
  };

  if (orderId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-12 shadow-card text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
            ✓
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900">Order Confirmed!</h1>
            <p className="mt-2 text-sm text-neutral-500">
              Thank you for shopping with LINKOVA. We are preparing your order for dispatch.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-6 text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 font-medium">Order Reference ID:</span>
              <strong className="text-sm font-extrabold text-neutral-900">{orderId}</strong>
            </div>

            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 font-medium">Selected Payment:</span>
              <strong className="text-neutral-900">{selectedPayment}</strong>
            </div>

            <div className="flex justify-between border-b border-neutral-200 pb-2">
              <span className="text-neutral-500 font-medium">Payment Status:</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                Pending Verification
              </span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-neutral-500 font-medium">Estimated Nepal Delivery:</span>
              <strong className="text-neutral-900">2-4 Business Days</strong>
            </div>

          </div>

          {!paymentMessage && (
            <form onSubmit={submitPaymentEvidence} className="rounded-2xl border border-neutral-200 bg-white p-5 text-left space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">Submit {selectedPayment} Payment</h2>
                <span className="text-xs font-semibold text-neutral-500">Amount: {formatNpr(confirmedAmount)}</span>
              </div>
              <p className="text-xs text-neutral-500">Upload the successful payment screenshot and enter the transaction/reference code. Your evidence will be reviewed by an administrator.</p>
              <label className="block text-xs font-semibold">Payment Screenshot *
                <input required type="file" accept="image/png,image/jpeg,image/webp" onChange={(e: ChangeEvent<HTMLInputElement>) => setScreenshot(e.target.files?.[0] || null)} className="mt-1 block w-full text-xs" />
              </label>
              <label className="block text-xs font-semibold">Transaction Code / Reference ID *
                <input required value={transactionCode} onChange={(e) => setTransactionCode(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-xs" />
              </label>
              <button disabled={paymentSubmitting} className="w-full rounded-xl bg-black py-3 text-xs font-bold text-white disabled:opacity-60">
                {paymentSubmitting ? "Submitting..." : "Submit Payment"}
              </button>
            </form>
          )}
          {paymentMessage && <p className="rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">{paymentMessage}</p>}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href={`/track-order?orderId=${orderId}`}
              className="rounded-xl bg-black px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 transition"
            >
              Track My Order
            </Link>
            <Link
              href="/shop"
              className="rounded-xl border border-black bg-white px-6 py-3.5 text-xs font-bold text-black hover:bg-neutral-50 transition"
            >
              Continue Shopping
            </Link>
            <button
              onClick={() => window.print()}
              className="rounded-xl border border-neutral-300 bg-white px-5 py-3.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
            >
              🖨️ Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Your Cart is Empty</h1>
        <p className="mt-2 text-xs text-neutral-500">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/shop" className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-xs font-bold text-white">
          Return to Shop
        </Link>
      </div>
    );
  }

  if (!isAuthReady) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Checking your account</h1>
        <p className="mt-2 text-xs text-neutral-500">Please wait while we confirm you are signed in before placing your order.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-neutral-900">Checkout</h1>
      <p className="mt-1 text-xs text-neutral-500">Complete your delivery address and choose a payment method.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Checkout Form */}
        <form onSubmit={onSubmit} className="space-y-8 lg:col-span-8">
          {/* Customer & Delivery Information */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-base font-bold text-neutral-900">
                1. Delivery Address
              </h2>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:border-black transition"
                >
                  <span>📍</span>
                  <span>{isCustomAddress ? "Choose Saved Address" : "Change Address"}</span>
                </button>
              )}
            </div>

            {/* CASE A: Using Saved / Default Address */}
            {!isCustomAddress && selectedAddress ? (
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/30 p-5 space-y-3 transition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      ✓ {selectedAddress.isDefault ? "Using your default address" : "Using selected address"}
                    </span>
                    {selectedAddress.label && (
                      <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-[10px] font-bold text-neutral-700 uppercase">
                        {selectedAddress.label}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="text-xs font-bold text-neutral-900 underline hover:text-red-600 transition"
                  >
                    Change Address
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-neutral-900">{selectedAddress.fullName}</p>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {selectedAddress.fullAddress}
                    {selectedAddress.landmark ? ` (Landmark: ${selectedAddress.landmark})` : ""}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {[
                      selectedAddress.city,
                      selectedAddress.ward ? `Ward ${selectedAddress.ward}` : "",
                      selectedAddress.district,
                      selectedAddress.province,
                      selectedAddress.country || "Nepal"
                    ].filter(Boolean).join(", ")}
                  </p>
                </div>

                <div className="pt-2 border-t border-emerald-100 flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-700">
                  <span><strong>Phone:</strong> {selectedAddress.phone}</span>
                  {selectedAddress.email && <span><strong>Email:</strong> {selectedAddress.email}</span>}
                </div>
              </div>
            ) : (
              /* CASE B: Manual / New Address Entry Form */
              <div className="space-y-4">
                {savedAddresses.length > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800">
                    <span>Entering a new address for this order.</span>
                    <button
                      type="button"
                      onClick={() => {
                        const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
                        setSelectedAddress(def);
                        setIsCustomAddress(false);
                      }}
                      className="font-bold underline hover:text-amber-950"
                    >
                      Use Saved Address
                    </button>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Full Name *</label>
                    <input
                      name="fullName"
                      required
                      value={manualForm.fullName}
                      onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                      placeholder="e.g. Pratik Sharma"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Phone Number *</label>
                    <input
                      name="phone"
                      required
                      value={manualForm.phone}
                      onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                      placeholder="e.g. 9801234567"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={manualForm.email}
                      onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                      placeholder="e.g. pratik@example.com"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  {/* Province Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Province *</label>
                    <select
                      name="province"
                      required
                      value={manualForm.province}
                      onChange={(e) => setManualForm({ ...manualForm, province: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    >
                      {nepalProvinces.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">District *</label>
                    <input
                      name="district"
                      required
                      value={manualForm.district}
                      onChange={(e) => setManualForm({ ...manualForm, district: e.target.value })}
                      placeholder="e.g. Kathmandu / Kaski / Morang"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">City / Municipality *</label>
                    <input
                      name="city"
                      required
                      value={manualForm.city}
                      onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                      placeholder="e.g. Kathmandu Metropolitan"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Ward No. (Optional)</label>
                    <input
                      name="ward"
                      value={manualForm.ward}
                      onChange={(e) => setManualForm({ ...manualForm, ward: e.target.value })}
                      placeholder="e.g. Ward 4"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Full Street Address *</label>
                    <textarea
                      name="fullAddress"
                      required
                      value={manualForm.fullAddress}
                      onChange={(e) => setManualForm({ ...manualForm, fullAddress: e.target.value })}
                      placeholder="e.g. House No. 42, Baluwatar Marg, near Prime Minister Residence"
                      rows={2}
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase text-neutral-500 mb-1">Nearest Landmark (Optional)</label>
                    <input
                      name="landmark"
                      value={manualForm.landmark}
                      onChange={(e) => setManualForm({ ...manualForm, landmark: e.target.value })}
                      placeholder="e.g. Opposite Bhatbhateni Supermarket"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs font-medium focus:border-black focus:outline-none"
                    />
                  </div>

                  {/* Save as default address checkbox */}
                  <div className="sm:col-span-2 pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300 accent-black"
                      />
                      <span>Save this address as my default address for future orders</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector & COD 50% Advance Logic */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              2. Payment Method
            </h2>

            {/* Payment Mode Selection: COD (50% Advance) vs Full Online (100%) */}
            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
                Select Order Payment Option *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mode 1: COD with 50% Online Advance */}
                <div
                  onClick={() => setPaymentMode("COD")}
                  className={`cursor-pointer rounded-2xl border-2 p-5 transition-all space-y-2 ${
                    paymentMode === "COD"
                      ? "border-black bg-neutral-50 shadow-sm"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">💵 Cash on Delivery (COD)</span>
                    <input
                      type="radio"
                      name="paymentModeRadio"
                      checked={paymentMode === "COD"}
                      onChange={() => setPaymentMode("COD")}
                      className="accent-black"
                    />
                  </div>
                  <div className="text-[11px] text-neutral-600 space-y-1">
                    <p className="font-semibold text-amber-900">Requires 50% Online Advance Now</p>
                    <p>• <strong>50% Pay Online Now:</strong> {formatNpr(breakdown.onlineAmount)}</p>
                    <p>• <strong>50% Due on Delivery:</strong> {formatNpr(breakdown.codAmount)}</p>
                  </div>
                </div>

                {/* Mode 2: Full Online Payment (100%) */}
                <div
                  onClick={() => setPaymentMode("FULL_PAYMENT")}
                  className={`cursor-pointer rounded-2xl border-2 p-5 transition-all space-y-2 ${
                    paymentMode === "FULL_PAYMENT"
                      ? "border-black bg-neutral-50 shadow-sm"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">💳 Full Online Payment</span>
                    <input
                      type="radio"
                      name="paymentModeRadio"
                      checked={paymentMode === "FULL_PAYMENT"}
                      onChange={() => setPaymentMode("FULL_PAYMENT")}
                      className="accent-black"
                    />
                  </div>
                  <div className="text-[11px] text-neutral-600 space-y-1">
                    <p className="font-semibold text-emerald-700">100% Full Payment Online</p>
                    <p>• <strong>Pay Online Now:</strong> {formatNpr(breakdown.onlineAmount)}</p>
                    <p>• <strong>Due on Delivery:</strong> NPR 0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Selector (eSewa / Khalti / MyPay) */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <label className="block text-xs font-bold text-neutral-800">
                Choose Online Wallet / Gateway for Payment
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {paymentMethods.map((p) => (
                  <label
                    key={p.id}
                    onClick={() => {
                      setSelectedPayment(p.id);
                      setQrError(false);
                      setQrKey((k) => k + 1);
                    }}
                    className={`flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-4 transition ${
                      selectedPayment === p.id
                        ? "border-black bg-neutral-50 shadow-sm"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">{p.name}</span>
                      <input
                        type="radio"
                        name="paymentMethodRadio"
                        checked={selectedPayment === p.id}
                        onChange={() => {
                          setSelectedPayment(p.id);
                          setQrError(false);
                          setQrKey((k) => k + 1);
                        }}
                        className="accent-black"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-neutral-500">{p.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* QR Code Section with Error Handling & Retry */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-neutral-900">Scan to Pay via {selectedPayment}</p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  {paymentMode === "COD" ? "50% Online Advance Required" : "100% Full Payment Required"}
                </span>
              </div>

              {!qrError ? (
                <div className="relative mx-auto h-64 w-64 rounded-2xl bg-white p-2 border border-neutral-200 flex items-center justify-center">
                  <Image
                    key={qrKey}
                    src={`/payment-qr/${selectedPayment === "Khalti" ? "khalti" : selectedPayment === "eSewa" ? "esewa" : "mypay"}-qr.png`}
                    alt={`${selectedPayment} Payment QR`}
                    fill
                    className="rounded-xl object-contain p-1"
                    onError={() => setQrError(true)}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3 my-2">
                  <p className="text-xs font-bold text-red-800">Unable to load payment QR.</p>
                  <p className="text-[11px] text-red-600">Please try again or use the available online payment option.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQrError(false);
                      setQrKey((k) => k + 1);
                    }}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition"
                  >
                    Retry Loading QR
                  </button>
                </div>
              )}

              <div className="space-y-1 rounded-xl bg-white p-3 border border-neutral-200">
                <div className="flex justify-between font-extrabold text-neutral-900 text-sm">
                  <span>Amount to Pay Online Now:</span>
                  <span className="text-blue-700">{formatNpr(breakdown.onlineAmount)}</span>
                </div>
                <div className="flex justify-between text-neutral-500 text-[11px]">
                  <span>Payment Method:</span>
                  <span>{paymentMode === "COD" ? "COD (50% Advance)" : "Full Online Payment"} via {selectedPayment}</span>
                </div>
                {paymentMode === "COD" && (
                  <div className="flex justify-between text-neutral-600 text-[11px] pt-1 border-t border-neutral-100">
                    <span>Remaining COD on Delivery:</span>
                    <span className="font-bold text-neutral-900">{formatNpr(breakdown.codAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || calculatingBreakdown}
            className="w-full rounded-2xl bg-black py-4 text-sm font-bold text-white shadow-lg hover:bg-neutral-800 disabled:opacity-60 transition"
          >
            {loading
              ? "Placing Your Order..."
              : `Place Order • Pay ${formatNpr(breakdown.onlineAmount)} Online Now`}
          </button>
        </form>

        {/* Order Summary Aside with Referral Code Input & Payment Breakdown */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 rounded-3xl border border-neutral-200 bg-white p-6 shadow-card space-y-5">
            <h3 className="text-base font-bold text-neutral-900">Items Summary ({items.length})</h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-700">{item.quantity}x</span>
                    <span className="truncate max-w-[150px] text-neutral-800 font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-neutral-900">{formatNpr(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Referral Code Form */}
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <label className="block text-xs font-bold text-neutral-800">Have a referral code?</label>
              <form onSubmit={handleApplyReferral} className="flex gap-2">
                <input
                  type="text"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value)}
                  placeholder="Enter referral code"
                  className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium focus:border-black focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-neutral-950 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition"
                >
                  Apply
                </button>
              </form>
              {referralResult && (
                <p className={`text-xs font-semibold ${referralResult.applied ? "text-emerald-600" : "text-red-600"}`}>
                  {referralResult.message}
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-neutral-100 pt-3 space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatNpr(breakdown.subtotal)}</span>
              </div>

              {breakdown.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Referral Discount</span>
                  <span>-{formatNpr(breakdown.discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-neutral-900">
                  {breakdown.deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatNpr(breakdown.deliveryFee)}
                </span>
              </div>

              <div className="flex justify-between border-t border-neutral-100 pt-2 text-sm font-extrabold text-neutral-900">
                <span>Final Amount</span>
                <span>{formatNpr(breakdown.finalAmount)}</span>
              </div>
            </div>

            {/* Clear Payment Summary Box */}
            <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-200 text-xs space-y-2">
              <p className="font-bold text-neutral-900">Payment Breakdown</p>
              <div className="flex justify-between font-extrabold text-blue-800">
                <span>50% Online Advance Now:</span>
                <span>{formatNpr(breakdown.onlineAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-700">
                <span>{paymentMode === "COD" ? "50% Due on Delivery (COD):" : "Due on Delivery:"}</span>
                <span>{formatNpr(breakdown.codAmount)}</span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 text-center">
              By placing this order, you agree to LINKOVA terms and delivery policies.
            </p>
          </div>
        </aside>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-extrabold text-neutral-900">Select Delivery Address</h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-black transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {savedAddresses.map((addr) => {
                const isSelected = !isCustomAddress && selectedAddress?._id === addr._id;
                return (
                  <div
                    key={addr._id || addr.fullAddress}
                    onClick={() => {
                      setSelectedAddress(addr);
                      setIsCustomAddress(false);
                      setShowAddressModal(false);
                    }}
                    className={`cursor-pointer rounded-2xl border-2 p-4 transition text-xs space-y-1.5 ${
                      isSelected
                        ? "border-black bg-neutral-50 shadow-sm"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-neutral-900 text-sm">{addr.fullName}</span>
                        {addr.label && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 uppercase">
                            {addr.label}
                          </span>
                        )}
                        {addr.isDefault && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-neutral-900">{isSelected ? "✓ Active" : "Deliver Here →"}</span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed">
                      {addr.fullAddress}
                      {addr.landmark ? ` (Landmark: ${addr.landmark})` : ""}
                    </p>
                    <p className="text-neutral-500">
                      {[addr.city, addr.ward ? `Ward ${addr.ward}` : "", addr.district, addr.province, addr.country || "Nepal"].filter(Boolean).join(", ")}
                    </p>
                    <p className="text-neutral-700 font-semibold pt-1">Phone: {addr.phone}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCustomAddress(true);
                  setShowAddressModal(false);
                }}
                className="w-full sm:w-auto rounded-xl border border-black bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-neutral-50 transition"
              >
                + Add / Enter New Address
              </button>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="w-full sm:w-auto rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
