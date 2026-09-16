import IndiaOrderModel from "../models/india-order-model.js";
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
    const queryConditions = [
      { userId },
      { customerId: userId }
    ];
    if (req.user.phone) {
      queryConditions.push({ phone: req.user.phone });
    }
    if (req.user.email) {
      queryConditions.push({ email: req.user.email });
    }

    const orders = await IndiaOrderModel.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, orders: orders || [] });
  } catch (error) {
    console.error("[GET /api/user/orders Error]:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch user orders." });
  }
}

// GET /api/user/orders/:orderId
export async function getUserOrderById(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access. Please log in." });
    }
    const { orderId } = req.params;
    const order = await IndiaOrderModel.findOne({
      orderId,
      $or: [
        { userId: String(req.user._id) },
        { customerId: String(req.user._id) },
        { phone: req.user.phone }
      ]
    }).lean();

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
    const addresses = await AddressModel.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 }).lean();
    return res.json({ success: true, addresses: addresses || [] });
  } catch (error) {
    console.error("[GET /api/user/addresses Error]:", error);
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
    console.error("[GET /api/user/product-requests Error]:", error);
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
    console.error("[GET /api/user/tickets Error]:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch support tickets." });
  }
}
