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
      const standardConditions = [{ fullName: req.user.fullName }];
      if (mongoose.Types.ObjectId.isValid(userId)) {
        standardConditions.push({ userId: new mongoose.Types.ObjectId(userId) });
      }
      if (userPhone) standardConditions.push({ phone: userPhone });
      if (userEmail) standardConditions.push({ email: userEmail });

      standardOrders = await OrderModel.find({ $or: standardConditions })
        .sort({ createdAt: -1 })
        .lean();
    } catch (e) {
      console.warn("OrderModel query error:", e.message);
    }

    // 3. Combine and deduplicate
    const combinedMap = new Map();

    for (const ord of standardOrders || []) {
      const key = String(ord.orderId || ord._id);
      combinedMap.set(key, {
        ...ord,
        id: String(ord._id),
        type: "standard"
      });
    }

    for (const ord of indiaOrders || []) {
      const key = String(ord.orderId || ord._id);
      combinedMap.set(key, {
        ...ord,
        id: String(ord._id),
        type: "india_sourcing"
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
      orderId,
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
        ...(req.user.phone ? [{ phone: req.user.phone }] : []),
        ...(req.user.email ? [{ email: req.user.email }] : [])
      ];
      if (mongoose.Types.ObjectId.isValid(userId)) {
        standardOr.push({ userId: new mongoose.Types.ObjectId(userId) });
      }
      order = await OrderModel.findOne({
        orderId,
        $or: standardOr
      }).lean();
    }

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    return res.json({ success: true, order });
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
    const queryConditions = [{ userId }];
    if (req.user.phone) queryConditions.push({ phone: req.user.phone });
    if (req.user.email) queryConditions.push({ email: req.user.email });

    const requests = await ProductRequestModel.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, requests: requests || [] });
  } catch (error) {
    console.error("[GET /api/user/product-requests Error]:", error?.message || error);
    return res.status(500).json({ error: error.message || "Failed to fetch product requests." });
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
