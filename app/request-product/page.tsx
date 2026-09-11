"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
import { formatNpr } from "@/lib/utils";
import Link from "next/link";

const PLATFORM_DISPLAY: Record<string, string> = {
  "amazon-india": "Amazon India",
  flipkart: "Flipkart",
  myntra: "Myntra",
  ajio: "AJIO",
  meesho: "Meesho",
  nykaa: "Nykaa",
  bigbasket: "BigBasket"
};

function detectPlatformFromUrl(val: string): string {
  const low = val.toLowerCase();
  if (low.includes("amazon.in") || low.includes("amzn.in")) return "Amazon India";
  if (low.includes("flipkart.com")) return "Flipkart";
  if (low.includes("myntra.com")) return "Myntra";
  if (low.includes("meesho.com")) return "Meesho";
  if (low.includes("ajio.com")) return "AJIO";
  if (low.includes("nykaa.com")) return "Nykaa";
  if (low.includes("bigbasket.com")) return "BigBasket";
  if (low.startsWith("http://") || low.startsWith("https://")) return "Indian Online Store";
  return "";
}

function RequestProductFlow() {
  const searchParams = useSearchParams();
  const { pushToast } = useToast();

  // Wizard Steps: 1: Link -> 2: Verification -> 3: Details & INR -> 4: Payment -> 5: Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1 & 2: Link & Verification State
  const [productUrl, setProductUrl] = useState("");
  const [detectedPlatform, setDetectedPlatform] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [stockStatus, setStockStatus] = useState("In Stock");
  const [deliveryStatus, setDeliveryStatus] = useState("Available to 854331");
  const [canOrder, setCanOrder] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [productImage, setProductImage] = useState("");

  // Step 3: Customer & Product Details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [isCustomAddress, setIsCustomAddress] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [productName, setProductName] = useState("");
  const [productVariant, setProductVariant] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [inrPrice, setInrPrice] = useState<string>("");
  const [sourceProductId, setSourceProductId] = useState("");  // from marketplace product

  // Step 4: Server Calculation & Payment
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [finalNprAmount, setFinalNprAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "FULL_PAYMENT">("COD");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Step 5: Confirmed Order Details
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    invoiceNumber: string;
    invoiceUrl: string;
    finalAmountNPR: number;
    paymentMethod: string;
    paymentStatus: string;
  } | null>(null);

  // Pre-fill user & addresses on mount
  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await fetch("/api/user/addresses", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const def = data.defaultAddress || data.addresses[0];
            setSelectedAddress(def);
            setFullName(def.fullName || "");
            setPhone(def.phone || "");
            setEmail(def.email || "");
            setDeliveryAddress(def.fullAddress || "");
            setCity(def.city || "");
            setDistrict(def.district || "");
            setProvince(def.province || "");
            setPostalCode(def.postalCode || "");
            setIsCustomAddress(false);
          } else {
            setIsCustomAddress(true);
            setSaveAsDefault(true);
          }
        }
      } catch (err) {
        console.error("Failed to load user addresses in request-product:", err);
      }
    }
    loadAddresses();
  }, []);

  // Pre-fill from URL params if passed from product page or LinkVerifier
  useEffect(() => {
    const urlParam = searchParams.get("url") ?? "";
    const platformParam = searchParams.get("platform") ?? "";
    const platformNameParam = searchParams.get("platformName") ?? "";
    const inrParam = searchParams.get("inr") ?? "";
    const nameParam = searchParams.get("name") ?? "";
    const sourceProductIdParam = searchParams.get("sid") ?? "";

    if (urlParam) {
      setProductUrl(urlParam);
      const detected =
        platformNameParam ||
        (platformParam ? PLATFORM_DISPLAY[platformParam] : "") ||
        detectPlatformFromUrl(urlParam);
      if (detected) setDetectedPlatform(detected);
      if (inrParam) setInrPrice(inrParam);
      if (nameParam) setProductName(decodeURIComponent(nameParam));
      if (sourceProductIdParam) setSourceProductId(sourceProductIdParam);
      
      // Auto-trigger verification for seamless order wizard entry
      void executeAvailabilityCheck(urlParam, inrParam, nameParam, sourceProductIdParam);
    }
  }, [searchParams]);

  // Execute full backend availability + postal code check
  const executeAvailabilityCheck = async (
    targetUrl: string,
    existingInr?: string,
    existingName?: string,
    existingSid?: string,
    variantSize?: string,
    variantColor?: string
  ) => {
    const trimmed = targetUrl.trim();
    if (!trimmed || (!trimmed.startsWith("http://") && !trimmed.startsWith("https://"))) {
      pushToast("Please enter a valid product link URL starting with https://", "error");
      return;
    }

    setVerifying(true);
    setCheckError(null);

    try {
      const res = await fetch("/api/products/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          postalCode: "854331",
          variant: { size: variantSize || size, color: variantColor || color },
          quantity
        })
      });

      const data = await res.json();

      if (data.canOrder && data.inStock && data.deliveryAvailable) {
        setIsVerified(true);
        setCanOrder(true);
        setStockStatus(data.stockStatusText || "✓ In Stock");
        setDeliveryStatus(data.deliveryStatusText || "✓ Available to 854331");
        setDetectedPlatform(data.product?.source || detectPlatformFromUrl(trimmed));
        if (data.product?.name && !productName) setProductName(data.product.name);
        if (data.product?.priceINR && !inrPrice) setInrPrice(String(data.product.priceINR));
        if (data.product?.image) setProductImage(data.product.image);
        if (data.product?.sourceProductId) setSourceProductId(data.product.sourceProductId);

        setStep(3);
        pushToast("✓ Product verified, in stock, and available for delivery to 854331!", "success");
      } else {
        setIsVerified(false);
        setCanOrder(false);
        setStockStatus(data.stockStatusText || "❌ Out of Stock");
        setDeliveryStatus(data.deliveryStatusText || "❌ Unavailable to 854331");
        setCheckError(data.message || "Product failed sourcing availability verification.");
        pushToast(data.message || "This product cannot currently be ordered.", "error");
      }
    } catch (err: any) {
      setIsVerified(false);
      setCanOrder(false);
      setCheckError("Unable to reach verification service. Please try again.");
      pushToast("Verification request failed. Please check connection.", "error");
    } finally {
      setVerifying(false);
    }
  };

  // Handle URL Verification Trigger
  const handleVerifyUrl = () => {
    void executeAvailabilityCheck(productUrl);
  };

  // Recalculate price whenever INR or Quantity changes
  const handleProceedToPayment = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !deliveryAddress.trim()) {
      pushToast("Please fill in your full name, phone number, and delivery address.", "error");
      return;
    }

    const rawInr = Number(inrPrice);
    if (isNaN(rawInr) || rawInr <= 0) {
      pushToast("Please enter the exact positive INR amount (₹) shown on the product website.", "error");
      return;
    }

    setCalculatingPrice(true);
    try {
      const res = await fetch("/api/india-order/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indianPriceINR: rawInr * quantity })
      });

      const data = await res.json();
      if (res.ok && data.finalAmountNPR) {
        setFinalNprAmount(data.finalAmountNPR);
        setStep(4);
      } else {
        pushToast(data.error || "Unable to calculate price.", "error");
      }
    } catch {
      pushToast("Failed to connect to calculation server.", "error");
    } finally {
      setCalculatingPrice(false);
    }
  };

  // Submit Order (COD or Full Payment)
  const handleFinalOrderSubmit = async () => {
    setSubmittingOrder(true);
    const rawInr = Number(inrPrice);

    try {
      const res = await fetch("/api/india-order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          fullName,
          phone,
          email,
          deliveryAddress,
          city,
          district,
          province,
          postalCode,
          deliveryInstructions,
          saveAsDefault: isCustomAddress ? saveAsDefault : false,
          productUrl,
          productName: productName || "Indian Marketplace Sourced Product",
          productVariant,
          size,
          color,
          quantity,
          indianPriceINR: rawInr,
          paymentMethod,
          sourceProductId: sourceProductId || ""
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setConfirmedOrder(data.order);
        setStep(5);
        pushToast(
          paymentMethod === "FULL_PAYMENT"
            ? "Payment verified & order placed successfully!"
            : "Cash on Delivery order confirmed!",
          "success"
        );
      } else {
        pushToast(data.error || "Order placement failed.", "error");
      }
    } catch {
      pushToast("Server error placing order.", "error");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Header & Step Indicator */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black tracking-wider uppercase border border-amber-200">
          🇮🇳 India-to-Nepal Sourcing Facilitator
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-neutral-950">
          Request Any Product from India
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
          Paste product links from Amazon India, Flipkart, Myntra, or any marketplace. We calculate clear landed Nepal prices and deliver directly to your doorstep.
        </p>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {[
            { num: 1, label: "Link" },
            { num: 2, label: "Verify" },
            { num: 3, label: "Order Form" },
            { num: 4, label: "Payment" },
            { num: 5, label: "Receipt" }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                  step === s.num
                    ? "bg-neutral-950 text-white shadow-md scale-110"
                    : step > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className={`text-[11px] font-bold hidden sm:inline ${step === s.num ? "text-neutral-950" : "text-neutral-400"}`}>
                {s.label}
              </span>
              {s.num < 5 && <div className="h-0.5 w-4 sm:w-8 bg-neutral-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* ─── STEP 1 & 2: PASTE PRODUCT LINK & VERIFY ─── */}
      {(step === 1 || step === 2) && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
              Paste Indian Product Link URL *
            </label>
            <div className="relative">
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://www.amazon.in/dp/... or https://www.flipkart.com/..."
                className="w-full rounded-2xl border border-neutral-300 px-4 py-3.5 text-xs sm:text-sm font-medium focus:border-neutral-950 focus:outline-none pr-28 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleVerifyUrl}
                disabled={verifying || !productUrl.trim()}
                className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-neutral-950 text-white text-xs font-black hover:bg-neutral-800 disabled:opacity-40 transition shadow-sm"
              >
                {verifying ? "Checking..." : "Verify Link →"}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              Supported stores: Amazon India, Flipkart, Myntra, AJIO, Meesho, Nykaa, BigBasket, and more.
            </p>
          </div>

          {/* Availability Check Failure Alert */}
          {checkError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-red-600 font-black text-sm">❌</span>
                <div>
                  <h4 className="text-xs font-black text-red-950 uppercase tracking-wide">
                    Product Availability Check Failed
                  </h4>
                  <p className="text-xs text-red-800 mt-0.5">{checkError}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 border border-red-200">
                  <span>{isVerified ? "✓" : "❌"}</span>
                  <span className="font-semibold text-neutral-700">Link Valid</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 border border-red-200">
                  <span>{stockStatus.includes("✓") ? "✓" : "❌"}</span>
                  <span className="font-semibold text-neutral-700">{stockStatus}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 border border-red-200">
                  <span>{deliveryStatus.includes("✓") ? "✓" : "❌"}</span>
                  <span className="font-semibold text-neutral-700">{deliveryStatus}</span>
                </div>
              </div>
            </div>
          )}

          {/* Supported Store Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
            <span className="text-[11px] font-bold text-neutral-400">Stores:</span>
            {["Amazon.in", "Flipkart", "Myntra", "AJIO", "Meesho", "Nykaa"].map((store) => (
              <span
                key={store}
                className="px-2.5 py-1 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-600"
              >
                {store}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ─── STEP 3: CUSTOMER & PRODUCT DETAILS (WITH INR AMOUNT) ─── */}
      {step === 3 && (
        <form onSubmit={handleProceedToPayment} className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-300">
                  ✓ Product Verified
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-300">
                  ✓ In Stock
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-300">
                  ✓ Delivery to 854331
                </span>
              </div>
              <h2 className="font-display text-xl font-black text-neutral-950">
                Order Request Details ({detectedPlatform})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-neutral-400 hover:text-neutral-900 underline cursor-pointer"
            >
              Change URL
            </button>
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">1. Product Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Product Name / Title
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Noise Canceling Headphones"
                  className="w-full rounded-xl border border-neutral-300 p-2.5 font-medium focus:border-neutral-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Size / Fit (Optional)
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. Medium, US 9, Free Size"
                  className="w-full rounded-xl border border-neutral-300 p-2.5 font-medium focus:border-neutral-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Color / Variant (Optional)
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Midnight Black, Silver"
                  className="w-full rounded-xl border border-neutral-300 p-2.5 font-medium focus:border-neutral-950 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-xl border border-neutral-300 p-2.5 font-bold focus:border-neutral-950 focus:outline-none"
                />
              </div>

              {/* Exact INR Product Price */}
              <div>
                <label className="block text-[11px] font-black uppercase text-red-600 mb-1">
                  Exact Indian Price (INR ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-black text-neutral-500">₹</span>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    required
                    value={inrPrice}
                    onChange={(e) => setInrPrice(e.target.value)}
                    placeholder="e.g. 2000"
                    className="w-full rounded-xl border-2 border-red-200 pl-8 p-2.5 font-black text-sm text-neutral-900 focus:border-red-600 focus:outline-none shadow-2xs"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Enter the exact price in Indian Rupees (₹) as shown on the website.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">2. Customer &amp; Delivery Details</h3>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800 underline hover:text-black"
                >
                  📍 {isCustomAddress ? "Use Saved Address" : "Change Address"}
                </button>
              )}
            </div>

            {/* CASE A: Using Saved / Default Address */}
            {!isCustomAddress && selectedAddress ? (
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/30 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                      ✓ {selectedAddress.isDefault ? "Using your default address" : "Using selected address"}
                    </span>
                    {selectedAddress.label && (
                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-700 uppercase">
                        {selectedAddress.label}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="text-xs font-bold text-neutral-900 underline hover:text-red-600"
                  >
                    Change Address
                  </button>
                </div>

                <div className="space-y-0.5">
                  <p className="font-extrabold text-neutral-900">{selectedAddress.fullName}</p>
                  <p className="text-neutral-700 leading-relaxed">
                    {selectedAddress.fullAddress}
                    {selectedAddress.landmark ? ` (Landmark: ${selectedAddress.landmark})` : ""}
                  </p>
                  <p className="text-neutral-500">
                    {[selectedAddress.city, selectedAddress.ward ? `Ward ${selectedAddress.ward}` : "", selectedAddress.district, selectedAddress.province, selectedAddress.country || "Nepal"].filter(Boolean).join(", ")}
                  </p>
                </div>

                <div className="pt-1.5 border-t border-emerald-100 flex flex-wrap items-center gap-4 text-neutral-700 font-medium">
                  <span><strong>Phone:</strong> {selectedAddress.phone}</span>
                  {selectedAddress.email && <span><strong>Email:</strong> {selectedAddress.email}</span>}
                </div>
              </div>
            ) : (
              /* CASE B: Manual / Custom Address Inputs */
              <div className="space-y-3">
                {savedAddresses.length > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                    <span>Entering a new address for this request.</span>
                    <button
                      type="button"
                      onClick={() => {
                        const def = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
                        setSelectedAddress(def);
                        setFullName(def.fullName || "");
                        setPhone(def.phone || "");
                        setEmail(def.email || "");
                        setDeliveryAddress(def.fullAddress || "");
                        setCity(def.city || "");
                        setDistrict(def.district || "");
                        setProvince(def.province || "");
                        setPostalCode(def.postalCode || "");
                        setIsCustomAddress(false);
                      }}
                      className="font-bold underline hover:text-amber-950"
                    >
                      Use Saved Address
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Pratik Sharma"
                      className="w-full rounded-xl border border-neutral-300 p-2.5 font-medium focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">Phone Number (Nepal) *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9801234567"
                      className="w-full rounded-xl border border-neutral-300 p-2.5 font-medium focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. customer@example.com"
                      className="w-full rounded-xl border border-neutral-300 p-2.5 font-medium focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Kathmandu, Pokhara, Biratnagar"
                      className="w-full rounded-xl border border-neutral-300 p-2.5 font-medium focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">Full Delivery Address *</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. House 42, Baluwatar Marg, Ward 4"
                      className="w-full rounded-xl border border-neutral-300 p-2.5 font-medium focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">Province</label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="e.g. Bagmati Province"
                      className="w-full rounded-xl border border-neutral-300 p-2.5 font-medium focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">Special Delivery Instructions</label>
                    <input
                      type="text"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g. Call before delivery, leave at reception"
                      className="w-full rounded-xl border border-neutral-300 p-2.5 font-medium focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  {/* Save as default address checkbox */}
                  <div className="sm:col-span-2 pt-1">
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

          <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={calculatingPrice}
              className="px-8 py-3.5 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-black hover:bg-neutral-800 disabled:opacity-40 transition shadow-md"
            >
              {calculatingPrice ? "Calculating Price..." : "Calculate Price & Choose Payment →"}
            </button>
          </div>
        </form>
      )}

      {/* ─── STEP 4: TOTAL PAYABLE AMOUNT & PAYMENT METHOD (NO HIDDEN FORMULA) ─── */}
      {step === 4 && finalNprAmount && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Step 4: Final Review &amp; Payment</span>
            <h2 className="font-display text-2xl font-black text-neutral-950">
              Confirm Your Order
            </h2>
          </div>

          {/* Clean Order Summary Box */}
          <div className="rounded-2xl bg-neutral-50 p-5 space-y-3 text-xs">
            <div className="flex justify-between font-bold text-neutral-900 border-b border-neutral-200/60 pb-2">
              <span>Product:</span>
              <span className="text-right truncate max-w-[240px]">{productName || "Sourced Item"} (Qty: {quantity})</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Entered Indian Price:</span>
              <span>₹{Number(inrPrice).toLocaleString()} INR</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery To:</span>
              <span className="text-right truncate max-w-[240px]">{deliveryAddress}, {city}</span>
            </div>

            {/* Total Payable Amount (Clean, no hidden formula) */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-neutral-300">
              <div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">Total Amount Payable:</span>
                <span className="text-[11px] text-neutral-400">All-inclusive landed price delivered to your address</span>
              </div>
              <span className="font-display text-2xl sm:text-3xl font-black text-red-600">
                {formatNpr(finalNprAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
              Select Payment Option *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all space-y-1.5 ${
                  paymentMethod === "COD"
                    ? "border-neutral-950 bg-neutral-50/80 shadow-sm"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-900">💵 Cash on Delivery (COD)</span>
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "COD" ? "border-neutral-950 bg-neutral-950" : "border-neutral-300"}`}>
                    {paymentMethod === "COD" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Pay {formatNpr(finalNprAmount)} in cash directly to the courier upon delivery in Nepal.
                </p>
              </div>

              {/* Option 2: Full Online Payment */}
              <div
                onClick={() => setPaymentMethod("FULL_PAYMENT")}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all space-y-1.5 ${
                  paymentMethod === "FULL_PAYMENT"
                    ? "border-neutral-950 bg-neutral-50/80 shadow-sm"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-900">💳 Full Online Payment</span>
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "FULL_PAYMENT" ? "border-neutral-950 bg-neutral-950" : "border-neutral-300"}`}>
                    {paymentMethod === "FULL_PAYMENT" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Pay {formatNpr(finalNprAmount)} now via eSewa, Khalti, or Mobile Banking for priority dispatch.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
            >
              ← Back to Details
            </button>
            <button
              type="button"
              onClick={handleFinalOrderSubmit}
              disabled={submittingOrder}
              className="px-8 py-3.5 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-black hover:bg-red-600 disabled:opacity-40 transition shadow-md hover:scale-105"
            >
              {submittingOrder ? "Processing Order..." : `Confirm & Place Order (${formatNpr(finalNprAmount)}) →`}
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 5: ORDER CONFIRMATION & PRINTABLE INVOICE ─── */}
      {step === 5 && confirmedOrder && (
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-10 shadow-sm text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl font-black">
            ✓
          </div>

          <div className="space-y-1.5">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-neutral-950">
              Order Confirmed Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Thank you for ordering with LINKOVA Nepal. Your request has been assigned to our India procurement desk.
            </p>
          </div>

          {/* Details Pill */}
          <div className="rounded-2xl bg-neutral-50 p-5 max-w-md mx-auto text-xs space-y-2 text-left border border-neutral-100">
            <div className="flex justify-between">
              <span className="text-neutral-500">Order ID:</span>
              <span className="font-mono font-black text-neutral-900">{confirmedOrder.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Invoice Number:</span>
              <span className="font-mono font-bold text-neutral-900">{confirmedOrder.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Payment Method:</span>
              <span className="font-bold text-neutral-900">{confirmedOrder.paymentMethod === "FULL_PAYMENT" ? "Full Online Payment" : "Cash on Delivery"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Payment Status:</span>
              <span className="font-bold text-emerald-600">{confirmedOrder.paymentStatus}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-neutral-900">
              <span>Total Amount:</span>
              <span className="text-red-600">{formatNpr(confirmedOrder.finalAmountNPR)}</span>
            </div>
          </div>

          {/* Action Buttons: View Invoice & Back to Store */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={confirmedOrder.invoiceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-black hover:bg-neutral-800 transition shadow-md"
            >
              <span>🖨️ View &amp; Print Official Invoice</span>
              <span>↗</span>
            </a>

            <Link
              href="/"
              className="px-6 py-3 rounded-full border border-neutral-300 text-neutral-800 text-xs sm:text-sm font-bold hover:bg-neutral-50 transition"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      )}

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
                      setFullName(addr.fullName || "");
                      setPhone(addr.phone || "");
                      setEmail(addr.email || "");
                      setDeliveryAddress(addr.fullAddress || "");
                      setCity(addr.city || "");
                      setDistrict(addr.district || "");
                      setProvince(addr.province || "");
                      setPostalCode(addr.postalCode || "");
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

export default function RequestProductPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400">Loading Order System...</div>}>
      <RequestProductFlow />
    </Suspense>
  );
}
