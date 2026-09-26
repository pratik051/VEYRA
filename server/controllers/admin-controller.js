import IndiaOrderModel from "../models/india-order-model.js";
import OrderModel from "../models/order-model.js";
import ProductRequestModel from "../models/product-request-model.js";
import SupportTicketModel from "../models/support-ticket-model.js";
import ProductModel from "../models/product-model.js";
import MarketplaceProductModel from "../models/marketplace-product-model.js";
import UserModel from "../models/user-model.js";
import PaymentModel from "../models/payment-model.js";
import { sendOrderDeliveredEmail, sendOrderStatusEmail } from "../services/emailService.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

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
            brand: i.brand || ord.brand || "",
            variant: i.variant || i.productVariant || "",
            color: i.color || "",
            size: i.size || "",
            quantity: i.quantity || 1,
            price: i.price || i.unitPrice || 0,
            unitPrice: i.unitPrice || i.price || 0,
            image: i.image || "",
            source: i.source || "SajiloMarts",
            productUrl: i.productUrl || ord.productUrl || ""
          }))
        : [];

      combinedMap.set(key, {
        ...ord,
        _id: String(ord._id),
        orderId: ord.orderId || String(ord._id),
        customerName: ord.customerName || ord.fullName || ord.shippingAddress?.fullName || "Customer",
        phone: ord.phone || ord.shippingAddress?.phone || "",
        email: ord.email || ord.shippingAddress?.email || "",
        productName: items[0]?.name || ord.productName || "Catalog Product",
        brand: items[0]?.brand || ord.brand || "",
        variant: items[0]?.variant || ord.variant || ord.productVariant || "",
        color: items[0]?.color || ord.color || "",
        size: items[0]?.size || ord.size || "",
        productImage: items[0]?.image || ord.productImage || "",
        productUrl: items[0]?.productUrl || ord.productUrl || "",
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
          brand: ord.brand || "",
          variant: ord.variant || ord.productVariant || "",
          color: ord.color || "",
          size: ord.size || "",
          quantity: ord.quantity || 1,
          price: ord.finalAmountNPR || 0,
          unitPrice: ord.finalAmountNPR || 0,
          image: ord.productImage || "",
          source: ord.marketplace || "Indian Marketplace",
          originalPriceINR: ord.indianPriceINR || 0,
          productUrl: ord.productUrl || ""
        }
      ];

      combinedMap.set(key, {
        ...ord,
        _id: String(ord._id),
        orderId: ord.orderId || String(ord._id),
        customerName: ord.customerName || ord.shippingAddress?.fullName || "Customer",
        phone: ord.phone || ord.shippingAddress?.phone || "",
        email: ord.email || ord.shippingAddress?.email || "",
        productName: ord.productName || "Sourced Indian Product",
        brand: ord.brand || "",
        variant: ord.variant || ord.productVariant || "",
        color: ord.color || "",
        size: ord.size || "",
        productImage: ord.productImage || "",
        productUrl: ord.productUrl || "",
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
    const cleanId = String(id || "").trim();

    let newStatus = body.status || body.orderStatus;
    const updates = { ...body, updatedAt: new Date() };

    if (body.adminVerificationStatus) {
      updates.adminVerifiedAt = new Date();
      updates.adminVerifiedBy = req.user?.fullName || req.user?.email || "Admin";
      if (body.adminVerificationStatus === "Verified / Orderable") {
        newStatus = newStatus || "Verified";
        updates.orderStatus = "Verified";
        updates.status = "Verified";
        updates.stockStatus = "In Stock";
        updates.deliveryStatus = "Delivery Available";
      } else if (body.adminVerificationStatus === "Alternative Required") {
        updates.stockStatus = "Alternative Required";
      } else if (body.adminVerificationStatus === "Unavailable") {
        updates.stockStatus = "Unavailable";
      } else if (body.adminVerificationStatus === "Rejected") {
        newStatus = "Cancelled";
        updates.orderStatus = "Cancelled";
        updates.status = "Cancelled";
        updates.stockStatus = "Rejected";
      }
    }

    if (newStatus) {
      updates.status = newStatus;
      updates.orderStatus = newStatus;
    }

    if (body.paymentStatus) {
      updates.paymentStatus = body.paymentStatus;
      updates["payment.status"] = body.paymentStatus;
    }

    const query = {
      $or: [
        { orderId: cleanId },
        { invoiceNumber: cleanId },
        ...(cleanId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanId }] : [])
      ]
    };

    // 1. Retrieve the existing order first to compare old status vs new status
    let existing = (await OrderModel.findOne(query).lean()) || (await IndiaOrderModel.findOne(query).lean());
    if (!existing) {
      return res.status(404).json({ error: "Order not found." });
    }

    const oldStatus = String(existing.orderStatus || existing.status || "").trim();

    // 2. Perform the update across both models
    const [stdUpdated, indUpdated] = await Promise.allSettled([
      OrderModel.findOneAndUpdate(query, { $set: updates }, { new: true }).lean(),
      IndiaOrderModel.findOneAndUpdate(query, { $set: updates }, { new: true }).lean()
    ]);

    const updated =
      (stdUpdated.status === "fulfilled" && stdUpdated.value) ||
      (indUpdated.status === "fulfilled" && indUpdated.value);

    if (!updated) {
      return res.status(404).json({ error: "Order not found." });
    }

    // 3. Synchronize PaymentModel if paymentStatus changed
    if (body.paymentStatus) {
      try {
        const payStatus = body.paymentStatus === "PAID" || body.paymentStatus === "Approved" ? "Approved" : "Rejected";
        await PaymentModel.updateMany(
          { orderId: updated.orderId || cleanId },
          { $set: { status: payStatus, verifiedAt: new Date() } }
        );
      } catch (pErr) {
        console.warn("[Admin Payment Sync Notice]:", pErr.message);
      }
    }

    // 4. Trigger Email Notification if status ACTUALLY changed
    const targetEmail = (updated.email || updated.shippingAddress?.email || existing.email || existing.shippingAddress?.email || "").trim();
    const cleanNewStatus = String(newStatus || "").trim();

    if (cleanNewStatus && cleanNewStatus.toLowerCase() !== oldStatus.toLowerCase() && targetEmail) {
      if (cleanNewStatus.toLowerCase() === "delivered") {
        sendOrderDeliveredEmail(targetEmail, updated).catch((err) => {
          console.warn("[Admin Delivered Email Notice]:", err?.message || err);
        });
      } else {
        sendOrderStatusEmail(targetEmail, updated, cleanNewStatus, oldStatus).catch((err) => {
          console.warn("[Admin Status Email Notice]:", err?.message || err);
        });
      }
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
    const cleanId = String(id || "").trim();

    if (!status) {
      return res.status(400).json({ error: "Verification status is required (Approved or Rejected)." });
    }

    const isApproved = status === "Approved" || status === "verified" || status === "Verified";
    const paymentStatusValue = isApproved ? "Approved" : "Rejected";
    const orderPaymentStatus = isApproved ? "PAID" : "Payment Rejected";
    const newOrderStatus = isApproved ? "Processing" : "Payment Issue";

    const paymentQuery = {
      $or: [
        { transactionCode: cleanId },
        { orderId: cleanId },
        ...(cleanId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanId }] : [])
      ]
    };

    let payment = await PaymentModel.findOneAndUpdate(
      paymentQuery,
      { $set: { status: paymentStatusValue, verifiedAt: new Date() } },
      { new: true }
    ).lean();

    const targetOrderId = payment?.orderId || cleanId;

    const orderQuery = {
      $or: [
        { orderId: targetOrderId },
        { invoiceNumber: targetOrderId },
        ...(targetOrderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: targetOrderId }] : [])
      ]
    };

    const existingOrder =
      (await OrderModel.findOne(orderQuery).lean()) ||
      (await IndiaOrderModel.findOne(orderQuery).lean());

    const orderUpdates = {
      paymentStatus: orderPaymentStatus,
      status: newOrderStatus,
      orderStatus: newOrderStatus,
      "payment.status": orderPaymentStatus,
      adminVerificationStatus: isApproved ? "Verified / Orderable" : "Rejected",
      updatedAt: new Date()
    };

    const [stdRes, indRes] = await Promise.allSettled([
      OrderModel.findOneAndUpdate(orderQuery, { $set: orderUpdates }, { new: true }).lean(),
      IndiaOrderModel.findOneAndUpdate(orderQuery, { $set: orderUpdates }, { new: true }).lean()
    ]);

    const updatedOrder =
      (stdRes.status === "fulfilled" && stdRes.value) ||
      (indRes.status === "fulfilled" && indRes.value) ||
      existingOrder;

    if (!payment && updatedOrder) {
      payment = {
        _id: String(updatedOrder._id),
        orderId: updatedOrder.orderId,
        status: paymentStatusValue,
        amount: updatedOrder.totalAmount || updatedOrder.finalAmountNPR || 0
      };
    }

    // Trigger email notification on payment verification
    if (updatedOrder) {
      const targetEmail = (
        updatedOrder.email ||
        updatedOrder.shippingAddress?.email ||
        existingOrder?.email ||
        existingOrder?.shippingAddress?.email ||
        ""
      ).trim();

      const oldStatus = existingOrder ? String(existingOrder.orderStatus || existingOrder.status || "").trim() : "";
      if (newOrderStatus.toLowerCase() !== oldStatus.toLowerCase() && targetEmail) {
        sendOrderStatusEmail(targetEmail, updatedOrder, newOrderStatus, oldStatus).catch((err) => {
          console.warn("[Admin Payment Verification Email Notice]:", err?.message || err);
        });
      }
    }

    return res.json({
      success: true,
      message: `Payment has been ${status}. Associated order status updated.`,
      payment,
      order: updatedOrder
    });
  } catch (error) {
    console.error("[Verify Payment Error]:", error);
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
    const { status, priority, reply, message } = req.body || {};
    const replyContent = reply || message;

    const ticket = await SupportTicketModel.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }, { ticketId: id }]
    });

    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found." });
    }

    if (replyContent) {
      ticket.messages.push({
        messageId: "msg-" + Math.floor(Math.random() * 100000),
        senderId: String(req.user._id),
        senderName: req.user.fullName || "Admin Support",
        senderRole: "admin",
        message: replyContent,
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

export async function updateAdminPassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "Admin user not found." });
    }
    if (user.passwordHash && currentPassword) {
      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return res.status(400).json({ error: "Incorrect current password." });
      }
    }
    const newHash = await hashPassword(newPassword);
    await UserModel.findByIdAndUpdate(user._id, { passwordHash: newHash });
    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update password." });
  }
}

