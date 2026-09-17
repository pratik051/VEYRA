import mongoose from "mongoose";
import IndiaOrderModel from "../models/india-order-model.js";
import OrderModel from "../models/order-model.js";
import ProductRequestModel from "../models/product-request-model.js";
import SupportTicketModel from "../models/support-ticket-model.js";
import AddressModel from "../models/address-model.js";
import UserModel from "../models/user-model.js";

// GET /api/user/orders
export async function getUserOrders(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access. Please log in." });
    }
    const userId = String(req.user._id);
    const userPhone = req.user.phone ? req.user.phone.trim() : null;
    const userEmail = req.user.email ? req.user.email.trim().toLowerCase() : null;

    let indiaOrders = [];
    let standardOrders = [];

    // 1. Fetch India-to-Nepal orders
    try {
      const indiaConditions = [{ userId }, { customerId: userId }];
      if (userPhone) indiaConditions.push({ phone: userPhone });
      if (userEmail) indiaConditions.push({ email: userEmail });

      indiaOrders = await IndiaOrderModel.find({ $or: indiaConditions })
        .sort({ createdAt: -1 })
        .lean();
    } catch (e) {
      console.warn("IndiaOrderModel query error:", e.message);
    }

    // 2. Fetch standard storefront orders
    try {
      const standardConditions = [{ userId }, { customerId: userId }];
      if (mongoose.Types.ObjectId.isValid(userId)) {
        standardConditions.push({ userId: new mongoose.Types.ObjectId(userId) });
      }
      if (userPhone) standardConditions.push({ phone: userPhone });
      if (userEmail) standardConditions.push({ email: userEmail });
      if (req.user.fullName) {
        standardConditions.push({ fullName: req.user.fullName }, { customerName: req.user.fullName });
      }

      standardOrders = await OrderModel.find({ $or: standardConditions })
        .sort({ createdAt: -1 })
        .lean();
    } catch (e) {
      console.warn("OrderModel query error:", e.message);
    }

    // 3. Combine and normalize
    const combinedMap = new Map();

    for (const ord of standardOrders || []) {
      const key = String(ord.orderId || ord._id);
      const items = Array.isArray(ord.items) && ord.items.length > 0
        ? ord.items.map((i) => ({
            name: i.name || "Catalog Product",
            quantity: i.quantity || 1,
            price: i.price || i.unitPrice || 0,
            image: i.image || "",
            source: i.source || "SajiloMarts"
          }))
        : [];

      combinedMap.set(key, {
        ...ord,
        _id: String(ord._id),
        orderId: ord.orderId || String(ord._id),
        id: String(ord._id),
        type: "standard",
        status: ord.status || ord.orderStatus || "Processing",
        orderStatus: ord.orderStatus || ord.status || "Processing",
        paymentStatus: ord.paymentStatus || ord.payment?.status || "Pending Verification",
        paymentScreenshot: ord.paymentScreenshot || ord.payment?.screenshot || "",
        totalAmount: ord.totalAmount || ord.total || (ord.pricing?.totalAmount) || 0,
        items,
        pricing: ord.pricing || {
          subtotal: ord.subtotal || 0,
          deliveryFee: ord.deliveryFee || 200,
          totalAmount: ord.totalAmount || ord.total || 0
        },
        payment: ord.payment || {
          method: ord.paymentMethod || "eSewa",
          status: ord.paymentStatus || "Pending",
          screenshot: ord.paymentScreenshot || ""
        }
      });
    }

    for (const ord of indiaOrders || []) {
      const key = String(ord.orderId || ord._id);
      const items = [
        {
          name: ord.productName || "Sourced Indian Product",
          quantity: ord.quantity || 1,
          price: ord.finalAmountNPR || 0,
          unitPrice: ord.finalAmountNPR || 0,
          image: ord.productImage || "",
          source: ord.marketplace || "Indian Marketplace",
          originalPriceINR: ord.indianPriceINR || 0
        }
      ];

      combinedMap.set(key, {
        ...ord,
        _id: String(ord._id),
        orderId: ord.orderId || String(ord._id),
        id: String(ord._id),
        type: "india_sourcing",
        status: ord.orderStatus || "Processing",
        orderStatus: ord.orderStatus || "Processing",
        paymentStatus: ord.paymentStatus || "Pending Verification",
        paymentScreenshot: ord.paymentScreenshot || "",
        totalAmount: ord.finalAmountNPR || 0,
        items,
        pricing: {
          subtotal: ord.conversionAmountNPR || ord.finalAmountNPR || 0,
          deliveryFee: ord.deliveryChargeNPR || 200,
          totalAmount: ord.finalAmountNPR || 0
        },
        payment: {
          method: ord.paymentMethod || "eSewa",
          status: ord.paymentStatus || "Pending",
          screenshot: ord.paymentScreenshot || ""
        }
      });
    }

    const allOrders = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    return res.json({ success: true, orders: allOrders });
  } catch (error) {
    console.error("[GET /api/user/orders Error]:", error?.message || error);
    return res.status(500).json({ error: "Failed to fetch user orders." });
  }
}

// GET /api/user/orders/:orderId
export async function getUserOrderById(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access. Please log in." });
    }
    const { orderId } = req.params;
    const userId = String(req.user._id);

    // Check India Orders first
    let order = await IndiaOrderModel.findOne({
      $or: [{ orderId }, { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : undefined }],
      $or: [
        { userId },
        { customerId: userId },
        ...(req.user.phone ? [{ phone: req.user.phone }] : []),
        ...(req.user.email ? [{ email: req.user.email }] : [])
      ]
    }).lean();

    // If not found, check Standard Orders
    if (!order) {
      const standardOr = [
        { userId },
        { customerId: userId },
        ...(req.user.phone ? [{ phone: req.user.phone }] : []),
        ...(req.user.email ? [{ email: req.user.email }] : [])
      ];
      if (mongoose.Types.ObjectId.isValid(userId)) {
        standardOr.push({ userId: new mongoose.Types.ObjectId(userId) });
      }
      order = await OrderModel.findOne({
        $or: [{ orderId }, { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : undefined }],
        $or: standardOr
      }).lean();
    }

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const items = order.items && order.items.length > 0
      ? order.items
      : [
          {
            name: order.productName || "Product",
            quantity: order.quantity || 1,
            price: order.finalAmountNPR || order.totalAmount || 0,
            image: order.productImage || "",
            source: order.marketplace || "SajiloMarts"
          }
        ];

    const normalizedOrder = {
      ...order,
      _id: String(order._id),
      orderId: order.orderId || String(order._id),
      items,
      totalAmount: order.totalAmount || order.finalAmountNPR || order.total || 0,
      paymentStatus: order.paymentStatus || order.payment?.status || "Pending",
      orderStatus: order.orderStatus || order.status || "Processing"
    };

    return res.json({ success: true, order: normalizedOrder });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch order." });
  }
}

// GET /api/user/addresses
export async function getUserAddresses(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access. Please log in." });
    }
    const addresses = await AddressModel.find({ userId: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();
    return res.json({ success: true, addresses: addresses || [] });
  } catch (error) {
    console.error("[GET /api/user/addresses Error]:", error?.message || error);
    return res.status(500).json({ error: error.message || "Failed to fetch addresses." });
  }
}

// POST /api/user/addresses
export async function createUserAddress(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access. Please log in." });
    }
    const body = req.body || {};
    if (body.isDefault) {
      await AddressModel.updateMany({ userId: req.user._id }, { $set: { isDefault: false } });
    }

    const address = await AddressModel.create({
      ...body,
      userId: req.user._id
    });

    return res.json({ success: true, address });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to create address." });
  }
}

// GET /api/user/product-requests
export async function getUserProductRequests(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access. Please log in." });
    }
    const userId = String(req.user._id);
    const queryConditions = [{ userId }, { customerId: userId }];
    if (req.user.phone) queryConditions.push({ phone: req.user.phone });
    if (req.user.email) queryConditions.push({ email: req.user.email });

    const [requests, indiaOrders] = await Promise.all([
      ProductRequestModel.find({ $or: queryConditions }).sort({ createdAt: -1 }).lean(),
      IndiaOrderModel.find({ $or: queryConditions }).sort({ createdAt: -1 }).lean()
    ]);

    const combined = [];
    for (const r of requests || []) {
      combined.push({
        _id: String(r._id),
        requestId: r.requestId,
        productName: r.productName,
        productUrl: r.originalProductUrl,
        indianPriceINR: r.currentKnownPrice || 0,
        finalAmountNPR: r.verificationSnapshot?.finalAmountNPR || 0,
        status: r.status,
        createdAt: r.createdAt
      });
    }

    for (const io of indiaOrders || []) {
      combined.push({
        _id: String(io._id),
        requestId: io.orderId,
        productName: io.productName,
        productUrl: io.productUrl,
        indianPriceINR: io.indianPriceINR || 0,
        finalAmountNPR: io.finalAmountNPR || 0,
        status: io.adminVerificationStatus || io.orderStatus || 'Pending Review',
        paymentStatus: io.paymentStatus || 'Pending Verification',
        createdAt: io.createdAt
      });
    }

    combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return res.json({ success: true, requests: combined });
  } catch (error) {
    console.error("[GET /api/user/product-requests Error]:", error?.message || error);
    return res.status(500).json({ error: "Failed to fetch product requests." });
  }
}

// GET /api/user/tickets
export async function getUserTickets(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access. Please log in." });
    }
    const tickets = await SupportTicketModel.find({ userId: String(req.user._id) })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, tickets: tickets || [] });
  } catch (error) {
    console.error("[GET /api/user/tickets Error]:", error?.message || error);
    return res.status(500).json({ error: error.message || "Failed to fetch support tickets." });
  }
}
