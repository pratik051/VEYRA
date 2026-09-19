import IndiaOrderModel from "../models/india-order-model.js";
import OrderModel from "../models/order-model.js";
import ProductRequestModel from "../models/product-request-model.js";
import SupportTicketModel from "../models/support-ticket-model.js";
import ProductModel from "../models/product-model.js";
import MarketplaceProductModel from "../models/marketplace-product-model.js";
import UserModel from "../models/user-model.js";
import PaymentModel from "../models/payment-model.js";
import { sendOrderDeliveredEmail } from "../utils/mailer.js";

// Dashboard Overview Stats
export async function getDashboardStats(req, res) {
  try {
    const [totalIndia, totalStandard] = await Promise.all([
      IndiaOrderModel.countDocuments({}),
      OrderModel.countDocuments({})
    ]);
    const totalOrdersCount = totalIndia + totalStandard;

    const [pendingIndia, pendingStandard] = await Promise.all([
      IndiaOrderModel.countDocuments({ adminVerificationStatus: "Pending Verification" }),
      OrderModel.countDocuments({ paymentStatus: "Pending Verification" })
    ]);
    const pendingVerificationCount = pendingIndia + pendingStandard;

    const verifiedOrdersCount = await IndiaOrderModel.countDocuments({ adminVerificationStatus: "Verified / Orderable" });
    const completedOrdersCount = (await IndiaOrderModel.countDocuments({ orderStatus: "Delivered" })) +
      (await OrderModel.countDocuments({ orderStatus: "Delivered" }));
    
    const pendingProductRequests = await ProductRequestModel.countDocuments({ status: "Pending" });
    const openTicketsCount = await SupportTicketModel.countDocuments({ status: { $in: ["Open", "In Progress"] } });
    const totalUsersCount = await UserModel.countDocuments({});

    const [recentIndia, recentStandard] = await Promise.all([
      IndiaOrderModel.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      OrderModel.find({}).sort({ createdAt: -1 }).limit(10).lean()
    ]);

    const recentOrders = [...recentStandard, ...recentIndia]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10);

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

// Unified Orders Management (Storefront + India Sourcing)
export async function getAllOrders(req, res) {
  try {
    const [standardOrders, indiaOrders] = await Promise.all([
      OrderModel.find({}).sort({ createdAt: -1 }).lean(),
      IndiaOrderModel.find({}).sort({ createdAt: -1 }).lean()
    ]);

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
        customerName: ord.customerName || ord.fullName || ord.shippingAddress?.fullName || "Customer",
        phone: ord.phone || ord.shippingAddress?.phone || "",
        email: ord.email || ord.shippingAddress?.email || "",
        shippingAddress: {
          fullName: ord.shippingAddress?.fullName || ord.fullName || "Customer",
          phone: ord.shippingAddress?.phone || ord.phone || "",
          email: ord.shippingAddress?.email || ord.email || "",
          city: ord.shippingAddress?.city || ord.city || "Kathmandu",
          province: ord.shippingAddress?.province || ord.province || "Bagmati",
          district: ord.shippingAddress?.district || ord.district || "",
          fullAddress: ord.shippingAddress?.fullAddress || ord.fullAddress || ""
        },
        payment: {
          method: ord.paymentMethod || ord.payment?.method || "eSewa",
          status: ord.paymentStatus || ord.payment?.status || "Pending",
          transactionId: ord.paymentReference || ord.payment?.transactionId || "",
          screenshot: ord.paymentScreenshot || ord.payment?.screenshot || ""
        },
        pricing: {
          totalAmount: ord.totalAmount || ord.total || (ord.pricing?.totalAmount) || 0,
          deliveryFee: ord.deliveryFee !== undefined ? ord.deliveryFee : (ord.pricing?.deliveryFee || 200),
          subtotal: ord.subtotal || ord.pricing?.subtotal || 0
        },
        totalAmount: ord.totalAmount || ord.total || (ord.pricing?.totalAmount) || 0,
        status: ord.status || ord.orderStatus || "Processing",
        orderStatus: ord.orderStatus || ord.status || "Processing",
        paymentStatus: ord.paymentStatus || ord.payment?.status || "Pending Verification",
        paymentScreenshot: ord.paymentScreenshot || ord.payment?.screenshot || "",
        items,
        type: "standard",
        createdAt: ord.createdAt
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
        customerName: ord.customerName || ord.shippingAddress?.fullName || "Customer",
        phone: ord.phone || ord.shippingAddress?.phone || "",
        email: ord.email || ord.shippingAddress?.email || "",
        shippingAddress: {
          fullName: ord.shippingAddress?.fullName || ord.customerName || "Customer",
          phone: ord.shippingAddress?.phone || ord.phone || "",
          email: ord.shippingAddress?.email || ord.email || "",
          city: ord.city || ord.shippingAddress?.city || "Kathmandu",
          province: ord.province || ord.shippingAddress?.province || "Bagmati",
          district: ord.district || ord.shippingAddress?.district || "",
          fullAddress: ord.deliveryAddress || ord.shippingAddress?.fullAddress || ""
        },
        payment: {
          method: ord.paymentMethod || "eSewa",
          status: ord.paymentStatus || "Pending",
          transactionId: ord.paymentTransactionId || "",
          screenshot: ord.paymentScreenshot || ""
        },
        pricing: {
          totalAmount: ord.finalAmountNPR || 0,
          deliveryFee: ord.deliveryChargeNPR || 200,
          subtotal: ord.conversionAmountNPR || 0
        },
        totalAmount: ord.finalAmountNPR || 0,
        status: ord.orderStatus || "Processing",
        orderStatus: ord.orderStatus || "Processing",
        paymentStatus: ord.paymentStatus || "Pending Verification",
        paymentScreenshot: ord.paymentScreenshot || "",
        items,
        type: "india_sourcing",
        createdAt: ord.createdAt
      });
    }

    const allOrders = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    return res.json({ success: true, orders: allOrders });
  } catch (error) {
    console.error("[GET /api/admin/orders Error]:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch admin orders." });
  }
}

export async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const newStatus = body.status || body.orderStatus;
    const updates = { ...body, updatedAt: new Date() };

    if (newStatus) {
      updates.status = newStatus;
      updates.orderStatus = newStatus;
    }

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

    const query = {
      $or: [
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
        { orderId: id }
      ]
    };

    // Try Standard OrderModel first
    let updated = await OrderModel.findOneAndUpdate(query, { $set: updates }, { new: true }).lean();

    // If not found, try IndiaOrderModel
    if (!updated) {
      updated = await IndiaOrderModel.findOneAndUpdate(query, { $set: updates }, { new: true }).lean();
    }

    if (!updated) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Check if status transitioned to Delivered and delivered email has not been sent yet
    const isDelivered = (newStatus && String(newStatus).toLowerCase() === "delivered") ||
      (body.status && String(body.status).toLowerCase() === "delivered") ||
      (body.orderStatus && String(body.orderStatus).toLowerCase() === "delivered");

    if (isDelivered && !updated.deliveredEmailSent && updated.email) {
      sendOrderDeliveredEmail(updated.email, updated)
        .then(async (mRes) => {
          if (mRes?.success) {
            await Promise.all([
              OrderModel.updateOne(query, { $set: { deliveredEmailSent: true } }),
              IndiaOrderModel.updateOne(query, { $set: { deliveredEmailSent: true } })
            ]);
          }
        })
        .catch((mErr) => {
          console.warn("[Delivered Email Notice]:", mErr?.message || mErr);
        });
    }

    return res.json({ success: true, order: updated });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to update order status." });
  }
}

// Payments Verification Queue Management
export async function getAllPayments(req, res) {
  try {
    const payments = await PaymentModel.find({}).sort({ createdAt: -1 }).lean();

    // Map and enrich with order/proof details
    const normalizedPayments = payments.map((p) => ({
      ...p,
      _id: String(p._id),
      transactionId: p.transactionCode || p.transactionId || `TXN-${String(p._id).slice(-6)}`,
      method: p.paymentMethod || p.provider || "eSewa",
      provider: p.provider || p.paymentMethod || "eSewa",
      amount: p.amount || 0,
      orderId: p.orderId || "",
      screenshot: p.screenshot || "",
      status: p.status || "submitted",
      submittedAt: p.submittedAt || p.createdAt
    }));

    return res.json({ success: true, payments: normalizedPayments });
  } catch (error) {
    console.error("[GET /api/admin/payments Error]:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch payments." });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status) {
      return res.status(400).json({ error: "Verification status is required (Approved or Rejected)." });
    }

    const paymentQuery = {
      $or: [
        ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
        { transactionCode: id }
      ]
    };

    const payment = await PaymentModel.findOneAndUpdate(
      paymentQuery,
      { $set: { status, verifiedAt: new Date() } },
      { new: true }
    ).lean();

    if (!payment) {
      return res.status(404).json({ error: "Payment record not found." });
    }

    const isApproved = status === "Approved" || status === "verified" || status === "Verified";
    const newPaymentStatus = isApproved ? "PAID" : "Payment Rejected";
    const newOrderStatus = isApproved ? "Processing" : "Payment Issue";

    // Update associated order across both OrderModel and IndiaOrderModel
    if (payment.orderId) {
      await Promise.allSettled([
        OrderModel.updateOne(
          { $or: [{ orderId: payment.orderId }, { _id: payment.orderId.match(/^[0-9a-fA-F]{24}$/) ? payment.orderId : undefined }] },
          { $set: { paymentStatus: newPaymentStatus, status: newOrderStatus, orderStatus: newOrderStatus } }
        ),
        IndiaOrderModel.updateOne(
          { $or: [{ orderId: payment.orderId }, { _id: payment.orderId.match(/^[0-9a-fA-F]{24}$/) ? payment.orderId : undefined }] },
          { $set: { paymentStatus: newPaymentStatus, orderStatus: isApproved ? "Verified" : "Cancelled" } }
        )
      ]);
    }

    return res.json({
      success: true,
      message: `Payment has been ${status}. Associated order status updated.`,
      payment
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Failed to verify payment." });
  }
}

// Backwards compatibility alias for India Orders
export async function getAllIndiaOrders(req, res) {
  return getAllOrders(req, res);
}

export async function updateIndiaOrder(req, res) {
  return updateOrder(req, res);
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
