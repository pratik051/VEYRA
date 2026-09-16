import IndiaOrderModel from "../models/india-order-model.js";
import ProductRequestModel from "../models/product-request-model.js";
import SupportTicketModel from "../models/support-ticket-model.js";
import ProductModel from "../models/product-model.js";
import MarketplaceProductModel from "../models/marketplace-product-model.js";
import UserModel from "../models/user-model.js";
import PaymentModel from "../models/payment-model.js";

// Dashboard Overview Stats
export async function getDashboardStats(req, res) {
  try {
    const totalOrdersCount = await IndiaOrderModel.countDocuments({});
    const pendingVerificationCount = await IndiaOrderModel.countDocuments({ adminVerificationStatus: "Pending Verification" });
    const verifiedOrdersCount = await IndiaOrderModel.countDocuments({ adminVerificationStatus: "Verified / Orderable" });
    const completedOrdersCount = await IndiaOrderModel.countDocuments({ orderStatus: "Delivered" });
    
    const pendingProductRequests = await ProductRequestModel.countDocuments({ status: "Pending" });
    const openTicketsCount = await SupportTicketModel.countDocuments({ status: { $in: ["Open", "In Progress"] } });
    const totalUsersCount = await UserModel.countDocuments({});

    const recentOrders = await IndiaOrderModel.find({}).sort({ createdAt: -1 }).limit(10).lean();

    return res.json({
      success: true,
      stats: {
        totalOrdersCount,
        pendingVerificationCount,
        verifiedOrdersCount,
        completedOrdersCount,
        pendingProductRequests,
        openTicketsCount,
        totalUsersCount
      },
      recentOrders
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to load dashboard stats." });
  }
}

// India Orders Management
export async function getAllIndiaOrders(req, res) {
  try {
    const orders = await IndiaOrderModel.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch orders." });
  }
}

export async function updateIndiaOrder(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const updates = { ...body, updatedAt: new Date() };

    if (body.adminVerificationStatus) {
      updates.adminVerifiedAt = new Date();
      updates.adminVerifiedBy = req.user.fullName || req.user.email;
      if (body.adminVerificationStatus === "Verified / Orderable") {
        updates.orderStatus = "Verified";
        updates.stockStatus = "In Stock";
        updates.deliveryStatus = "Delivery Available";
      } else if (body.adminVerificationStatus === "Alternative Required") {
        updates.stockStatus = "Alternative Required";
      } else if (body.adminVerificationStatus === "Unavailable") {
        updates.stockStatus = "Unavailable";
      } else if (body.adminVerificationStatus === "Rejected") {
        updates.orderStatus = "Cancelled";
        updates.stockStatus = "Rejected";
      }
    }

    const updated = await IndiaOrderModel.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }, { orderId: id }] },
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: "Order not found." });
    }
    return res.json({ success: true, order: updated });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to update order." });
  }
}

// Product Sourcing Requests
export async function getAllProductRequests(req, res) {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { productName: { $regex: search, $options: "i" } }
      ];
    }
    const requests = await ProductRequestModel.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, requests });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch requests." });
  }
}

export async function updateProductRequest(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };

    const updated = await ProductRequestModel.findOneAndUpdate(
      { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }, { requestId: id }] },
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: "Product request not found." });
    }
    return res.json({ success: true, request: updated });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to update request." });
  }
}

// Support Tickets
export async function getAllSupportTickets(req, res) {
  try {
    const tickets = await SupportTicketModel.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, tickets });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch support tickets." });
  }
}

export async function updateSupportTicket(req, res) {
  try {
    const { id } = req.params;
    const { status, priority, reply } = req.body || {};
    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;

    const ticket = await SupportTicketModel.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }, { ticketId: id }]
    });

    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found." });
    }

    if (reply) {
      ticket.messages.push({
        messageId: "msg-" + Math.floor(Math.random() * 100000),
        senderId: String(req.user._id),
        senderName: req.user.fullName || "Admin Support",
        senderRole: "admin",
        message: reply,
        createdAt: new Date()
      });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;

    await ticket.save();
    return res.json({ success: true, ticket });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to update ticket." });
  }
}

// Users Management
export async function getAllUsers(req, res) {
  try {
    const users = await UserModel.find({}).select("-passwordHash").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch users." });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    const user = await UserModel.findByIdAndUpdate(id, { role }, { new: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found." });

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to update user role." });
  }
}

// Catalog Products Management
export async function getAdminProducts(req, res) {
  try {
    const localProducts = await ProductModel.find({}).sort({ createdAt: -1 }).lean();
    const marketplaceProducts = await MarketplaceProductModel.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ success: true, products: [...localProducts, ...marketplaceProducts] });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch products." });
  }
}

export async function createProduct(req, res) {
  try {
    const product = await ProductModel.create(req.body);
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to create product." });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found." });
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to update product." });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    await ProductModel.findByIdAndDelete(id);
    return res.json({ success: true, message: "Product deleted." });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to delete product." });
  }
}
