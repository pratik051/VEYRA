import { randomBytes } from "node:crypto";
import IndiaOrderModel from "../models/india-order-model.js";
import AddressModel from "../models/address-model.js";
import { calculateOrderPrice, getCustomerFacingPrice } from "../utils/pricing.js";

export async function calculatePrice(req, res) {
  try {
    const rawPrice = Number(req.body.indianPriceINR);
    if (isNaN(rawPrice) || rawPrice <= 0) {
      return res.status(400).json({ error: "Please enter a valid positive Indian product price (INR ₹)." });
    }
    const result = getCustomerFacingPrice(rawPrice);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message || "Price calculation failed." });
  }
}

export async function createIndiaOrder(req, res) {
  try {
    const body = req.body || {};
    const customerName = String(body.customerName || body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const deliveryAddress = String(body.deliveryAddress || body.address || "").trim();
    const city = String(body.city || "").trim();
    const district = String(body.district || "").trim();
    const province = String(body.province || "").trim();
    const postalCode = String(body.postalCode || "").trim();
    const deliveryInstructions = String(body.deliveryInstructions || "").trim();

    const productUrl = String(body.productUrl || "").trim();
    const productName = String(body.productName || "Sourced Indian Product").trim();
    const productImage = String(body.productImage || "").trim();
    const productVariant = String(body.productVariant || "").trim();
    const size = String(body.size || "").trim();
    const color = String(body.color || "").trim();
    const quantity = Math.max(1, Number(body.quantity) || 1);
    const rawInrPrice = Number(body.indianPriceINR);

    const paymentMethod = body.paymentMethod === "FULL_PAYMENT" ? "FULL_PAYMENT" : "COD";
    const paymentTransactionId = String(body.paymentTransactionId || "").trim();

    if (!customerName || customerName.length < 2) {
      return res.status(400).json({ error: "Please enter a valid customer full name." });
    }
    if (!phone || phone.length < 7) {
      return res.status(400).json({ error: "Please enter a valid contact phone number." });
    }
    if (!deliveryAddress || deliveryAddress.length < 4) {
      return res.status(400).json({ error: "Please enter a complete delivery address in Nepal." });
    }
    if (!productUrl || (!productUrl.startsWith("http://") && !productUrl.startsWith("https://"))) {
      return res.status(400).json({ error: "Please provide a valid Indian product link URL." });
    }
    if (isNaN(rawInrPrice) || rawInrPrice <= 0) {
      return res.status(400).json({ error: "Please enter the exact positive INR amount (₹) shown on the product website." });
    }

    const priceCalculation = calculateOrderPrice(rawInrPrice * quantity);

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `LNK-IN-${randomSuffix}`;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${randomSuffix}`;
    const invoiceUrl = `/api/india-order/invoice/${orderId}`;

    let paymentStatus = paymentMethod === "FULL_PAYMENT" ? "PAID" : "Pending";

    const userId = req.user ? String(req.user._id) : "";

    const shippingAddress = {
      fullName: customerName,
      phone,
      email,
      deliveryAddress,
      city,
      district,
      province,
      postalCode,
      country: "Nepal",
      deliveryInstructions
    };

    if (body.saveAsDefault && userId) {
      try {
        await AddressModel.updateMany({ userId }, { $set: { isDefault: false } });
        await AddressModel.create({
          userId,
          fullName: customerName,
          phone,
          email,
          province: province || "Bagmati",
          district: district || "",
          city: city || "",
          fullAddress: deliveryAddress,
          label: "Home",
          isDefault: true
        });
      } catch (err) {
        console.warn("Failed to save default address:", err.message);
      }
    }

    const orderPayload = {
      orderId,
      invoiceNumber,
      userId,
      customerId: userId,
      customerName,
      phone,
      email,
      deliveryAddress,
      city,
      district,
      province,
      postalCode,
      deliveryInstructions,
      shippingAddress,
      marketplace: body.marketplace || "indian-marketplace",
      sourceProductId: body.sourceProductId || "",
      productUrl,
      originalSourceUrl: productUrl,
      verifiedSourceUrl: productUrl,
      canonicalSourceUrl: productUrl,
      productName,
      productImage,
      brand: body.brand || "Generic",
      category: body.category || "Everyday Essentials",
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
      paymentTransactionId,
      orderStatus: "Requested",
      invoiceUrl,
      adminVerificationStatus: "Pending Verification"
    };

    const newOrder = await IndiaOrderModel.create(orderPayload);

    return res.json({
      success: true,
      message: paymentMethod === "FULL_PAYMENT"
        ? "Payment verified & order confirmed!"
        : "Cash on Delivery order placed successfully!",
      order: newOrder
    });
  } catch (error) {
    console.error("Create order failed:", error);
    return res.status(400).json({ error: error.message || "Failed to process India order." });
  }
}

export async function getUserOrders(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const orders = await IndiaOrderModel.find({
      $or: [{ userId: String(req.user._id) }, { customerId: String(req.user._id) }, { phone: req.user.phone }]
    }).sort({ createdAt: -1 }).lean();

    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch orders." });
  }
}

export async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;
    const order = await IndiaOrderModel.findOne({ orderId }).lean();
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch order details." });
  }
}
