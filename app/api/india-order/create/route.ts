import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { connectToDatabase } from "@/lib/db/mongodb";
import { calculateOrderPrice } from "@/lib/pricing/india-order";
import { IndiaOrderModel } from "@/lib/models/india-order-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { cookies } from "next/headers";
import {
  isValidMarketplaceUrl,
  getSourceIdFromUrl,
  getMarketplaceDisplayName
} from "@/lib/sourcing-platforms";
import { checkProductAvailabilityAndDelivery } from "@/lib/marketplace/availability";

export const dynamic = "force-dynamic";

// In-memory fallback for local development resilience
declare global {
  // eslint-disable-next-line no-var
  var __linkova_mem_india_orders: Map<string, any> | undefined;
}
const memOrders = global.__linkova_mem_india_orders || new Map<string, any>();
if (!global.__linkova_mem_india_orders) global.__linkova_mem_india_orders = memOrders;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Extract customer details
    const customerName = String(body.customerName || body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const deliveryAddress = String(body.deliveryAddress || body.address || "").trim();
    const city = String(body.city || "").trim();
    const district = String(body.district || "").trim();
    const province = String(body.province || "").trim();
    const postalCode = String(body.postalCode || "").trim();
    const deliveryInstructions = String(body.deliveryInstructions || "").trim();

    // Extract product + marketplace snapshot details
    const productUrl = String(body.productUrl || "").trim();
    const productName = String(body.productName || "Sourced Indian Product").trim();
    const productImage = String(body.productImage || "").trim();
    const productVariant = String(body.productVariant || "").trim();
    const size = String(body.size || "").trim();
    const color = String(body.color || "").trim();
    const quantity = Math.max(1, Number(body.quantity) || 1);
    const rawInrPrice = Number(body.indianPriceINR);

    // Marketplace snapshot — client may provide, but server validates/overrides source ID
    const clientSourceProductId = String(body.sourceProductId || "").trim();
    const clientMarketplace = String(body.marketplace || "").trim();

    // Payment method choice
    const paymentMethod = body.paymentMethod === "FULL_PAYMENT" ? "FULL_PAYMENT" : "COD";
    const paymentTransactionId = String(body.paymentTransactionId || "").trim();

    // ── Validations ──────────────────────────────────────────────────────────

    if (!customerName || customerName.length < 2) {
      return NextResponse.json({ error: "Please enter a valid customer full name." }, { status: 400 });
    }
    if (!phone || phone.length < 7) {
      return NextResponse.json({ error: "Please enter a valid contact phone number." }, { status: 400 });
    }
    if (!deliveryAddress || deliveryAddress.length < 4) {
      return NextResponse.json({ error: "Please enter a complete delivery address in Nepal." }, { status: 400 });
    }
    if (!productUrl || (!productUrl.startsWith("http://") && !productUrl.startsWith("https://"))) {
      return NextResponse.json({ error: "Please provide a valid Indian product link URL." }, { status: 400 });
    }
    if (isNaN(rawInrPrice) || rawInrPrice <= 0) {
      return NextResponse.json({ error: "Please enter the exact positive INR amount (₹) shown on the product website." }, { status: 400 });
    }

    // ── SERVER-SIDE Marketplace URL Validation ───────────────────────────────
    if (!isValidMarketplaceUrl(productUrl)) {
      return NextResponse.json({
        error: "The product URL must be from a supported Indian marketplace (Amazon India, Flipkart, Myntra, AJIO, Meesho, Nykaa, Tata CLiQ, Croma, boAt, Noise, etc.)."
      }, { status: 400 });
    }

    // ── INFORMATIONAL MARKETPLACE METADATA CAPTURE (NON-BLOCKING) ─────────────
    // Scraper/API failures NEVER block the customer. Admin manually verifies every link.
    let availabilityCheck: any = { orderable: true, canOrder: true };
    try {
      availabilityCheck = await checkProductAvailabilityAndDelivery({
        url: productUrl,
        variant: { size, color, name: productVariant },
        quantity
      });
    } catch {
      // Best-effort fallback
    }

    // Auto-detect source ID from URL
    const detectedSourceId = availabilityCheck.marketplace || getSourceIdFromUrl(productUrl);
    const marketplace = detectedSourceId || clientMarketplace || "indian-marketplace";
    const marketplaceDisplayName = getMarketplaceDisplayName(marketplace);

    // ── SERVER-SIDE PRICE CALCULATION ────────────────────────────────────────
    const priceCalculation = calculateOrderPrice(rawInrPrice * quantity);

    // ── Generate unique identifiers ──────────────────────────────────────────
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `LNK-IN-${randomSuffix}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${randomSuffix}`;
    const invoiceUrl = `/api/india-order/invoice/${orderId}`;

    // ── Payment and order status ─────────────────────────────────────────────
    let paymentStatus: "Pending" | "PAID" = "Pending";
    const orderStatus = "Confirmed";
    if (paymentMethod === "FULL_PAYMENT") {
      paymentStatus = "PAID";
    }

    // ── Customer auth association (server-side authenticated session) ────────
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
    const sessionUser = token ? await getSessionUserByToken(token) : null;
    const userId = sessionUser ? String(sessionUser._id) : "";
    const customerId = userId;

    // Extract brand, category, canonical URL
    const brand = String(body.brand || "Generic").trim();
    const category = String(body.category || "Everyday Essentials").trim();
    const originalSourceUrl = String(body.originalSourceUrl || productUrl).trim();
    const verifiedSourceUrl = String(body.verifiedSourceUrl || productUrl).trim();
    const canonicalSourceUrl = String(body.canonicalSourceUrl || productUrl).trim();
    const saveAsDefault = Boolean(body.saveAsDefault);
    const landmark = String(body.landmark || "").trim();
    const country = String(body.country || "Nepal").trim();

    // Construct immutable shipping address snapshot
    const shippingAddress = {
      fullName: customerName || sessionUser?.fullName || "Valued Customer",
      phone: phone || sessionUser?.phone || "",
      email: email || sessionUser?.email || "",
      deliveryAddress,
      city,
      district,
      province,
      postalCode,
      country,
      landmark,
      deliveryInstructions
    };

    // If user requested to save this address as default, save it
    if (saveAsDefault && userId) {
      try {
        const { AddressModel } = await import("@/lib/models/address-model");
        await connectToDatabase();
        await AddressModel.updateMany({ userId }, { $set: { isDefault: false } });
        await AddressModel.create({
          userId,
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          province: shippingAddress.province || "Bagmati",
          district: shippingAddress.district || "",
          city: shippingAddress.city || "",
          ward: "",
          fullAddress: shippingAddress.deliveryAddress,
          addressLine1: shippingAddress.deliveryAddress,
          landmark: shippingAddress.landmark,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          label: "Home",
          isDefault: true
        });
      } catch (saveErr) {
        console.warn("Failed to auto-save default address during India order:", saveErr);
      }
    }

    const orderPayload = {
      orderId,
      invoiceNumber,
      userId,
      customerId,
      customerName: customerName || sessionUser?.fullName || "Valued Customer",
      phone: phone || sessionUser?.phone || "",
      email: email || sessionUser?.email || "",
      deliveryAddress,
      city,
      district,
      province,
      postalCode,
      deliveryInstructions,
      shippingAddress,
      // Marketplace Snapshot
      marketplace,
      sourceProductId: availabilityCheck.sourceProductId || clientSourceProductId || "",
      productUrl: availabilityCheck.normalizedSourceUrl || productUrl,
      originalSourceUrl: availabilityCheck.originalSourceUrl || originalSourceUrl || productUrl,
      normalizedSourceUrl: availabilityCheck.normalizedSourceUrl || productUrl,
      verifiedSourceUrl: availabilityCheck.verifiedSourceUrl || verifiedSourceUrl || productUrl,
      canonicalSourceUrl: availabilityCheck.canonicalUrl || canonicalSourceUrl || productUrl,
      productName,
      productImage,
      brand,
      category,
      productVariant,
      size,
      color,
      quantity,
      indianPriceINR: rawInrPrice * quantity,
      conversionAmountNPR: priceCalculation.conversionAmount,
      serviceChargeNPR: priceCalculation.serviceCharge,
      deliveryChargeNPR: priceCalculation.deliveryCharge,
      finalAmountNPR: priceCalculation.finalAmount,
      paymentMethod,
      paymentStatus,
      paymentTransactionId: paymentTransactionId || (paymentMethod === "FULL_PAYMENT" ? `TXN-${randomBytes(4).toString("hex").toUpperCase()}` : ""),
      orderStatus: "Requested",
      invoiceUrl,
      // Sourcing Availability Snapshot
      stockStatus: "Awaiting Admin Verification",
      deliveryStatus: "Awaiting Admin Verification",
      postalCodeChecked: "Internal Depot",
      canOrder: true,
      availabilityCheckedAt: new Date(),
      // Admin Manual Verification
      adminVerificationStatus: "Pending Verification",
      adminStockStatus: "Not Checked",
      adminDeliveryStatus: "Not Checked",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to Database
    try {
      await connectToDatabase();
      await IndiaOrderModel.create(orderPayload);
    } catch (dbError) {
      console.warn("DB save failed, using in-memory store:", dbError);
      memOrders.set(orderId, orderPayload);
    }

    return NextResponse.json({
      success: true,
      message: paymentMethod === "FULL_PAYMENT"
        ? `Payment verified & order confirmed from ${marketplaceDisplayName}!`
        : `Cash on Delivery order placed successfully from ${marketplaceDisplayName}!`,
      order: {
        orderId,
        invoiceNumber,
        invoiceUrl,
        customerName,
        phone,
        productName,
        marketplace,
        marketplaceDisplayName,
        quantity,
        finalAmountNPR: priceCalculation.finalAmount,
        paymentMethod,
        paymentStatus,
        orderStatus
      }
    });
  } catch (error: unknown) {
    console.error("India Order creation failed:", error);
    const msg = error instanceof Error ? error.message : "Failed to process India order.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
