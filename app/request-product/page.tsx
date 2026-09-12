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

  // Wizard Steps: 1: Link -> 2: Verify -> 3: Order Form -> 4: Payment -> 5: Payment Verification -> 6: Order Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 1 & 2: Link & Verification State
  const [productUrl, setProductUrl] = useState("");
  const [detectedPlatform, setDetectedPlatform] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [stockStatus, setStockStatus] = useState("In Stock");
  const [deliveryStatus, setDeliveryStatus] = useState("Delivery available");
  const [canOrder, setCanOrder] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [productImage, setProductImage] = useState("");
  const [submittingProductRequest, setSubmittingProductRequest] = useState(false);
  const [requestSubmittedSuccess, setRequestSubmittedSuccess] = useState<string | null>(null);

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

  // Step 4: Server Calculation, Payment Provider & Dynamic QR
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [finalNprAmount, setFinalNprAmount] = useState<number | null>(null);
  const [onlineAdvanceAmount, setOnlineAdvanceAmount] = useState<number>(0);
  const [codRemainingAmount, setCodRemainingAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "FULL_PAYMENT">("COD");
  const [selectedProvider, setSelectedProvider] = useState<"eSewa" | "Khalti" | "MyPay">("eSewa");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState<boolean>(false);
  const [qrError, setQrError] = useState<boolean>(false);
  const [qrKey, setQrKey] = useState<number>(0);

  // Step 5: Payment Proof Upload State
  const [transactionId, setTransactionId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submittingProof, setSubmittingProof] = useState(false);

  // Step 6: Confirmed Order Details
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    invoiceNumber: string;
    invoiceUrl: string;
    finalAmountNPR: number;
    onlineAdvanceAmountNPR?: number;
    codRemainingAmountNPR?: number;
    paymentMethod: string;
    paymentStatus: string;
    onlinePaymentStatus?: string;
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

  // Fetch dynamic payment QR when on Step 4
  useEffect(() => {
    if (step !== 4 || !finalNprAmount) return;
    let isSubscribed = true;

    async function fetchQr() {
      setQrLoading(true);
      setQrError(false);
      try {
        const rawInr = Number(inrPrice) || 0;
        const res = await fetch("/api/payments/create-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: selectedProvider,
            paymentMode: paymentMethod,
            subtotal: finalNprAmount,
            deliveryFee: 0
          })
        });

        const data = await res.json();
        if (isSubscribed) {
          if (res.ok && data.success && data.qrCode) {
            setQrCodeUrl(data.qrCode);
          } else {
            setQrError(true);
            setQrCodeUrl(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch payment QR for India order:", err);
        if (isSubscribed) {
          setQrError(true);
          setQrCodeUrl(null);
        }
      } finally {
        if (isSubscribed) setQrLoading(false);
      }
    }

    void fetchQr();
    return () => {
      isSubscribed = false;
    };
  }, [step, finalNprAmount, paymentMethod, selectedProvider, inrPrice, qrKey]);

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

  // Execute backend metadata lookup & transition smoothly to step 3
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
          variant: { size: variantSize || size, color: variantColor || color },
          quantity
        })
      });

      const data = await res.json();

      setIsVerified(true);
      setCanOrder(true);
      setStockStatus(data.stockStatusText || "⏳ Awaiting Admin Verification");
      setDeliveryStatus(data.deliveryStatusText || "⏳ Awaiting Admin Verification");
      setDetectedPlatform(data.product?.source || detectPlatformFromUrl(trimmed));
      if (data.product?.name && !productName) setProductName(data.product.name);
      if (data.product?.priceINR && !inrPrice) setInrPrice(String(data.product.priceINR));
      if (data.product?.image) setProductImage(data.product.image);
      if (data.product?.sourceProductId) setSourceProductId(data.product.sourceProductId);

      setStep(3);
      pushToast("✓ Link captured! Enter or confirm product details below.", "success");
    } catch {
      // Even if network fails, don't block customer submission
      setIsVerified(true);
      setCanOrder(true);
      setStockStatus("⏳ Awaiting Admin Verification");
      setDeliveryStatus("⏳ Awaiting Admin Verification");
      setDetectedPlatform(detectPlatformFromUrl(trimmed) || "Indian Marketplace");
      setStep(3);
      pushToast("✓ Link captured! Please complete product details below.", "info");
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
        const total = data.finalAmountNPR;
        setFinalNprAmount(total);
        const online = paymentMethod === "COD" ? Math.round(total * 0.5) : total;
        setOnlineAdvanceAmount(online);
        setCodRemainingAmount(total - online);
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

  // Step 4 -> Step 5 Transition ("I Have Paid")
  const handlePaidClicked = () => {
    if (!finalNprAmount) return;
    setStep(5);
  };

  // Step 5 -> Step 6 (Submit Payment Proof & Create Order)
  const handleProofSubmitAndCreateOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      pushToast("Please enter your Payment Reference / Transaction ID.", "error");
      return;
    }
    if (!screenshotFile) {
      pushToast("Please upload your payment screenshot.", "error");
      return;
    }

    setSubmittingProof(true);
    const rawInr = Number(inrPrice);

    try {
      // Create India Order in backend
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
          paymentTransactionId: transactionId.trim(),
          sourceProductId: sourceProductId || ""
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.order) {
        // Upload screenshot evidence to payment evidence endpoint
        const form = new FormData();
        form.append("orderId", data.order.orderId);
        form.append("paymentMethod", selectedProvider);
        form.append("transactionCode", transactionId.trim());
        form.append("screenshot", screenshotFile);
        
        await fetch("/api/payments/submit", { method: "POST", body: form }).catch(() => null);

        setConfirmedOrder({
          ...data.order,
          onlineAdvanceAmountNPR: paymentMethod === "COD" ? Math.round(data.order.finalAmountNPR * 0.5) : data.order.finalAmountNPR,
          codRemainingAmountNPR: paymentMethod === "COD" ? data.order.finalAmountNPR - Math.round(data.order.finalAmountNPR * 0.5) : 0,
          onlinePaymentStatus: "Pending Verification"
        });
        setStep(6);
        pushToast("✓ Payment proof submitted! Order confirmed for verification.", "success");
      } else {
        pushToast(data.error || "Order placement failed.", "error");
      }
    } catch {
      pushToast("Server error placing order.", "error");
    } finally {
      setSubmittingProof(false);
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

        {/* 6 Step Progress Bar */}
        <div className="flex items-center justify-center gap-1.5 pt-4">
          {[
            { num: 1, label: "Link" },
            { num: 2, label: "Verify" },
            { num: 3, label: "Order Form" },
            { num: 4, label: "Payment" },
            { num: 5, label: "Verification" },
            { num: 6, label: "Confirmation" }
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5">
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                  step === s.num
                    ? "bg-neutral-950 text-white shadow-md scale-110"
                    : step > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className={`text-[11px] font-bold hidden md:inline ${step === s.num ? "text-neutral-950" : "text-neutral-400"}`}>
                {s.label}
              </span>
              {s.num < 6 && <div className="h-0.5 w-2 sm:w-5 bg-neutral-200" />}
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
                {verifying ? "Checking..." : "Check / Continue →"}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              Supported stores: Amazon India, Flipkart, Myntra, AJIO, Meesho, Nykaa, BigBasket, and more.
            </p>
          </div>

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
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-black text-amber-800 border border-amber-300">
                  ⏳ Awaiting Admin Verification
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold text-neutral-700 border border-neutral-200">
                  🇮🇳 {detectedPlatform || "Indian Store"}
                </span>
              </div>
              <h2 className="font-display text-xl font-black text-neutral-950">
                Order Request Details
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

      {/* ─── STEP 4: PAYMENT METHOD SELECTION & REAL QR ─── */}
      {step === 4 && finalNprAmount && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Step 4: Payment</span>
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

            {/* Total Payable Amount */}
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
              {/* Option 1: Cash on Delivery (50% Advance) */}
              <div
                onClick={() => {
                  setPaymentMethod("COD");
                  setQrKey((k) => k + 1);
                }}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all space-y-2 ${
                  paymentMethod === "COD"
                    ? "border-neutral-950 bg-neutral-50/80 shadow-sm"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-900">💵 Cash on Delivery (COD)</span>
                  <input
                    type="radio"
                    name="paymentModeRadioReq"
                    checked={paymentMethod === "COD"}
                    onChange={() => {
                      setPaymentMethod("COD");
                      setQrKey((k) => k + 1);
                    }}
                    className="accent-black"
                  />
                </div>
                <div className="text-[11px] text-neutral-600 space-y-1">
                  <p className="font-bold text-amber-900">Requires 50% Online Advance</p>
                  <p>• <strong>50% Pay Online Now:</strong> {formatNpr(Math.round(finalNprAmount * 0.5))}</p>
                  <p>• <strong>50% Due on Delivery:</strong> {formatNpr(finalNprAmount - Math.round(finalNprAmount * 0.5))}</p>
                </div>
              </div>

              {/* Option 2: Full Online Payment (100%) */}
              <div
                onClick={() => {
                  setPaymentMethod("FULL_PAYMENT");
                  setQrKey((k) => k + 1);
                }}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all space-y-2 ${
                  paymentMethod === "FULL_PAYMENT"
                    ? "border-neutral-950 bg-neutral-50/80 shadow-sm"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-900">💳 Full Online Payment</span>
                  <input
                    type="radio"
                    name="paymentModeRadioReq"
                    checked={paymentMethod === "FULL_PAYMENT"}
                    onChange={() => {
                      setPaymentMethod("FULL_PAYMENT");
                      setQrKey((k) => k + 1);
                    }}
                    className="accent-black"
                  />
                </div>
                <div className="text-[11px] text-neutral-600 space-y-1">
                  <p className="font-bold text-emerald-700">100% Full Payment Online</p>
                  <p>• <strong>Pay Online Now:</strong> {formatNpr(finalNprAmount)}</p>
                  <p>• <strong>Due on Delivery:</strong> NPR 0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Provider Selector */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <label className="block text-xs font-bold text-neutral-800">
              Choose Payment Gateway
            </label>
            <div className="grid gap-3 grid-cols-3">
              {(["eSewa", "Khalti", "MyPay"] as const).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => {
                    setSelectedProvider(prov);
                    setQrKey((k) => k + 1);
                  }}
                  className={`rounded-2xl border-2 p-3 text-center transition ${
                    selectedProvider === prov
                      ? "border-black bg-neutral-50 shadow-xs font-black text-neutral-950"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  <span className="text-xs">{prov}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Real QR Display Section */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5 text-xs space-y-4 text-center">
            <div className="flex items-center justify-between text-left">
              <div>
                <p className="font-bold text-neutral-900 text-sm">Scan &amp; Pay via {selectedProvider}</p>
                <p className="text-[11px] text-neutral-500">Scan this QR code using your mobile wallet app</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                {paymentMethod === "COD" ? "50% Advance Payment" : "100% Full Payment"}
              </span>
            </div>

            {qrLoading ? (
              <div className="relative mx-auto h-64 w-64 rounded-2xl bg-white p-6 border border-neutral-200 flex flex-col items-center justify-center space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-black" />
                <p className="text-xs font-semibold text-neutral-600">Generating secure payment QR...</p>
              </div>
            ) : !qrError && qrCodeUrl ? (
              <div className="relative mx-auto h-64 w-64 rounded-2xl bg-white p-2 border border-neutral-200 flex items-center justify-center shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={qrKey}
                  src={qrCodeUrl}
                  alt={`${selectedProvider} Payment QR`}
                  className="rounded-xl object-contain h-full w-full p-1"
                  onError={() => setQrError(true)}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3 my-2">
                <p className="text-xs font-bold text-red-800">Unable to generate payment QR.</p>
                <p className="text-[11px] text-red-600">Please try again or select another payment gateway.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQrError(false);
                    setQrKey((k) => k + 1);
                  }}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition"
                >
                  Retry Payment
                </button>
              </div>
            )}

            <div className="rounded-xl bg-white p-3 border border-neutral-200 font-extrabold text-neutral-900 text-sm flex justify-between items-center">
              <span>Amount to Pay Online Now:</span>
              <span className="text-blue-700 text-base">{formatNpr(paymentMethod === "COD" ? Math.round(finalNprAmount * 0.5) : finalNprAmount)}</span>
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
              onClick={handlePaidClicked}
              className="px-8 py-3.5 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-black hover:bg-neutral-800 transition shadow-md"
            >
              I Have Paid →
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 5: PAYMENT VERIFICATION (SUBMIT PROOF) ─── */}
      {step === 5 && finalNprAmount && (
        <form onSubmit={handleProofSubmitAndCreateOrder} className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wider">Step 5: Payment Verification</span>
            <h2 className="font-display text-2xl font-black text-neutral-950">
              Submit Payment Proof
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Please upload your payment screenshot and enter the transaction reference ID below to complete your order.
            </p>
          </div>

          {/* Payment Summary Pill */}
          <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500">Selected Payment Method:</span>
              <span className="font-bold text-neutral-900">{paymentMethod === "COD" ? "COD (50% Advance)" : "Full Online Payment"} via {selectedProvider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Total Order Amount:</span>
              <span className="font-bold text-neutral-900">{formatNpr(finalNprAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-blue-800">
              <span>Amount Paid Online:</span>
              <span>{formatNpr(paymentMethod === "COD" ? Math.round(finalNprAmount * 0.5) : finalNprAmount)}</span>
            </div>
            {paymentMethod === "COD" && (
              <div className="flex justify-between text-neutral-700 font-semibold pt-1 border-t border-neutral-200/60">
                <span>Remaining Due on Delivery (COD):</span>
                <span>{formatNpr(finalNprAmount - Math.round(finalNprAmount * 0.5))}</span>
              </div>
            )}
          </div>

          {/* Proof Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-800 mb-1">
                Transaction / Reference ID *
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TXN-9840129481 or eSewa/Khalti Ref ID"
                className="w-full rounded-xl border border-neutral-300 p-3 text-xs font-medium focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-800 mb-1">
                Payment Screenshot / Proof *
              </label>
              <input
                type="file"
                required
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-neutral-300 p-2 text-xs font-medium focus:border-black focus:outline-none"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Upload JPG, PNG, or WEBP payment receipt image.</p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
            >
              ← Back to Payment QR
            </button>
            <button
              type="submit"
              disabled={submittingProof}
              className="px-8 py-3.5 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-black hover:bg-emerald-600 disabled:opacity-40 transition shadow-md"
            >
              {submittingProof ? "Submitting Proof..." : "Submit Payment Proof →"}
            </button>
          </div>
        </form>
      )}

      {/* ─── STEP 6: ORDER CONFIRMATION & RECEIPT ─── */}
      {step === 6 && confirmedOrder && (
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 sm:p-10 shadow-sm text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl font-black">
            ✓
          </div>

          <div className="space-y-1.5">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-neutral-950">
              Order Confirmation
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Thank you for ordering with LINKOVA Nepal. Your payment proof has been submitted for admin verification.
            </p>
          </div>

          {/* Details Pill */}
          <div className="rounded-2xl bg-neutral-50 p-5 max-w-md mx-auto text-xs space-y-2 text-left border border-neutral-100">
            <div className="flex justify-between">
              <span className="text-neutral-500">Order Reference ID:</span>
              <span className="font-mono font-black text-neutral-900">{confirmedOrder.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Invoice Number:</span>
              <span className="font-mono font-bold text-neutral-900">{confirmedOrder.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Product Name:</span>
              <span className="font-bold text-neutral-900 truncate max-w-[200px]">{productName || "Sourced Item"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Payment Method:</span>
              <span className="font-bold text-neutral-900">{confirmedOrder.paymentMethod === "FULL_PAYMENT" ? "Full Online Payment" : "Cash on Delivery"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Payment Status:</span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                Pending Verification
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-neutral-200 text-neutral-900 font-bold">
              <span>Total Amount:</span>
              <span>{formatNpr(confirmedOrder.finalAmountNPR)}</span>
            </div>
            {confirmedOrder.paymentMethod === "COD" ? (
              <>
                <div className="flex justify-between text-blue-700 font-semibold">
                  <span>50% Paid Online / Submitted:</span>
                  <span>{formatNpr(confirmedOrder.onlineAdvanceAmountNPR || Math.round(confirmedOrder.finalAmountNPR * 0.5))}</span>
                </div>
                <div className="flex justify-between text-neutral-700 font-semibold">
                  <span>50% Remaining on Delivery:</span>
                  <span>{formatNpr(confirmedOrder.codRemainingAmountNPR || (confirmedOrder.finalAmountNPR - Math.round(confirmedOrder.finalAmountNPR * 0.5)))}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>100% Online Submitted:</span>
                <span>{formatNpr(confirmedOrder.finalAmountNPR)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={confirmedOrder.invoiceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-black hover:bg-neutral-800 transition shadow-md"
            >
              <span>🖨️ View &amp; Print Official Receipt</span>
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
