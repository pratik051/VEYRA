import mongoose from "mongoose";
import OrderModel from "../models/order-model.js";
import PaymentModel from "../models/payment-model.js";
import AddressModel from "../models/address-model.js";
import { sendOrderConfirmationEmail } from "../utils/mailer.js";
import { generateUniqueOrderId } from "../utils/orderId.js";

export async function createCheckoutOrder(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Please log in or create an account before placing your order." });
    }

    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return res.status(400).json({ error: "Your shopping cart is empty." });
    }

    const shipping = body.shippingAddress || {};
    const fullName = String(shipping.fullName || body.fullName || req.user.fullName || "").trim();
    const phone = String(shipping.phone || body.phone || req.user.phone || "").trim();
    const email = String(shipping.email || body.email || req.user.email || "").trim();

    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ error: "Please provide the recipient's full name." });
    }
    if (!phone || phone.length < 7) {
      return res.status(400).json({ error: "Please provide a valid Nepal contact phone number." });
    }

    const city = String(shipping.city || body.city || "Kathmandu").trim();
    const province = String(shipping.province || body.province || "Bagmati").trim();
    const area = String(shipping.area || "").trim();
    const street = String(shipping.street || "").trim();
    const postalCode = String(shipping.postalCode || "44600").trim();
    const fullAddress = String(
      shipping.fullAddress ||
      `${street ? street + ", " : ""}${area ? area + ", " : ""}${city}, ${province}`
    ).trim();

    const pricing = body.pricing || {};
    const subtotal = Number(pricing.subtotal) || items.reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    const deliveryFee = Number(pricing.deliveryFee !== undefined ? pricing.deliveryFee : 200);
    const discount = Number(pricing.discount) || 0;
    const totalAmount = Number(pricing.totalAmount) || Math.max(0, subtotal + deliveryFee - discount);
    const advancePayable = Number(pricing.advancePayable) || totalAmount;
    const codRemaining = Number(pricing.codRemaining) || 0;

    const payment = body.payment || {};
    const paymentMethod = String(payment.method || body.paymentMethod || "eSewa").trim();
    const transactionId = String(payment.transactionId || body.transactionId || "").trim();
    const paymentScreenshot = String(body.paymentScreenshot || payment.screenshot || "").trim();

    const isCod = paymentMethod.toUpperCase() === "COD" || paymentMethod.toLowerCase().includes("cash on delivery");
    const paymentStatus = paymentScreenshot || transactionId
      ? "Pending Verification"
      : isCod
      ? "Advance Pending"
      : "Pending";

    // Strictly generate server-side unique Order ID (ignoring any client inputs)
    const orderId = await generateUniqueOrderId("SM");

    const userId = String(req.user._id);

    const normalizedItems = items.map((i) => ({
      productId: String(i.productId || i._id || i.id || ""),
      name: String(i.name || i.title || "Product"),
      brand: String(i.brand || "").trim(),
      variant: String(i.variant || i.productVariant || "").trim(),
      color: String(i.color || "").trim(),
      size: String(i.size || "").trim(),
      price: Number(i.price) || 0,
      unitPrice: Number(i.price || i.unitPrice) || 0,
      quantity: Math.max(1, Number(i.quantity) || 1),
      image: String(i.image || i.imageUrl || ""),
      source: String(i.source || "SajiloMarts"),
      productUrl: String(i.productUrl || i.url || "").trim()
    }));

    const orderDoc = {
      orderId,
      userId,
      customerId: userId,
      fullName,
      customerName: fullName,
      phone,
      email,
      province,
      city,
      fullAddress,
      shippingAddress: {
        fullName,
        phone,
        email,
        province,
        city,
        area,
        street,
        postalCode,
        fullAddress,
        country: "Nepal"
      },
      paymentMethod,
      paymentStatus,
      orderStatus: "Processing",
      status: "Processing",
      items: normalizedItems,
      subtotal,
      deliveryFee,
      discount,
      total: totalAmount,
      totalAmount,
      pricing: {
        subtotal,
        deliveryFee,
        discount,
        totalAmount,
        advancePayable,
        codRemaining
      },
      payment: {
        method: paymentMethod,
        transactionId,
        status: paymentStatus,
        screenshot: paymentScreenshot
      },
      onlineAdvanceAmount: isCod ? advancePayable : totalAmount,
      codRemainingAmount: codRemaining,
      paymentScreenshot,
      paymentReference: transactionId,
      notes: String(body.notes || "").trim(),
      confirmationEmailSent: false,
      deliveredEmailSent: false
    };

    const savedOrder = await OrderModel.create(orderDoc);

    // If transaction code or screenshot is attached, record in PaymentModel for admin verification queue
    if (transactionId || paymentScreenshot) {
      try {
        await PaymentModel.create({
          userId: req.user._id,
          orderId,
          provider: paymentMethod,
          paymentMethod: paymentMethod,
          amount: isCod ? advancePayable : totalAmount,
          currency: "NPR",
          transactionCode: transactionId || `TXN-${orderId}`,
          screenshot: paymentScreenshot,
          status: "submitted",
          submittedAt: new Date()
        });
      } catch (payErr) {
        console.warn("[Payment Log Warning]:", payErr.message);
      }
    }

    // Optionally save default address if user requested
    if (body.saveAddress && userId) {
      try {
        await AddressModel.create({
          userId,
          fullName,
          phone,
          email,
          province,
          city,
          fullAddress,
          postalCode,
          label: "Home",
          isDefault: true
        });
      } catch (addrErr) {
        console.warn("[Address Save Warning]:", addrErr.message);
      }
    }

    // Send order confirmation email asynchronously
    if (savedOrder.email) {
      sendOrderConfirmationEmail(savedOrder.email, savedOrder).catch((mErr) => {
        console.warn("[Order Confirmation Email Notice]:", mErr?.message || mErr);
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: savedOrder
    });
  } catch (error) {
    console.error("[Checkout Order Error]:", error);
    return res.status(500).json({ error: error.message || "Failed to process order." });
  }
}

export async function getOrderDetails(req, res) {
  try {
    const { orderId } = req.params;
    const cleanId = String(orderId || "").trim();
    const query = {
      $or: [
        { orderId: cleanId },
        { invoiceNumber: cleanId },
        ...(cleanId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanId }] : [])
      ]
    };

    const order = (await OrderModel.findOne(query).lean()) || (await IndiaOrderModel.findOne(query).lean());

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch order." });
  }
}

export async function trackOrderPublic(req, res) {
  try {
    const rawId = req.query.orderId || req.query.id || req.params.orderId || req.params.id || "";
    const cleanId = String(rawId || "").trim();

    if (!cleanId) {
      return res.status(400).json({ success: false, error: "Please provide an Order ID or Reference Number." });
    }

    const query = {
      $or: [
        { orderId: cleanId },
        { invoiceNumber: cleanId },
        { trackingNumber: cleanId },
        { paymentReference: cleanId },
        { paymentTransactionId: cleanId },
        ...(cleanId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanId }] : [])
      ]
    };

    const [stdOrder, indOrder] = await Promise.all([
      OrderModel.findOne(query).lean(),
      IndiaOrderModel.findOne(query).lean()
    ]);

    const order = stdOrder || indOrder;

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "No active order found with this Reference ID. Please check your Order ID and try again."
      });
    }

    const currentStatus = String(order.orderStatus || order.status || "Processing").trim();
    const paymentStatus = String(order.paymentStatus || order.payment?.status || "Pending").trim();

    // Map status to timeline index (0 to 7 matching client orderTimeline array)
    const statusLower = currentStatus.toLowerCase();
    let currentStage = 0;

    if (statusLower.includes("deliver") && !statusLower.includes("out")) {
      currentStage = 7;
    } else if (statusLower.includes("out for delivery") || statusLower.includes("out_for_delivery")) {
      currentStage = 6;
    } else if (statusLower.includes("arrived in nepal") || statusLower.includes("hub") || statusLower.includes("customs")) {
      currentStage = 5;
    } else if (statusLower.includes("transit") || statusLower.includes("shipped")) {
      currentStage = 4;
    } else if (statusLower.includes("sourced") || statusLower.includes("purchased")) {
      currentStage = 3;
    } else if (statusLower.includes("processing") || statusLower.includes("verified") || statusLower.includes("confirmed")) {
      currentStage = 2;
    } else if (paymentStatus.toUpperCase() === "PAID" || paymentStatus.toLowerCase().includes("approved")) {
      currentStage = 1;
    } else {
      currentStage = 0;
    }

    const items = Array.isArray(order.items) && order.items.length > 0
      ? order.items
      : [
          {
            name: order.productName || "Sourced Product",
            quantity: order.quantity || 1,
            price: order.finalAmountNPR || order.totalAmount || 0,
            image: order.productImage || "",
            brand: order.brand || "",
            variant: order.variant || order.productVariant || "",
            color: order.color || "",
            size: order.size || ""
          }
        ];

    const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const destination = (
      order.city ||
      order.shippingAddress?.city ||
      order.deliveryAddress ||
      order.shippingAddress?.fullAddress ||
      "Nepal"
    ).trim();

    return res.json({
      success: true,
      order: {
        _id: String(order._id),
        orderId: order.orderId || String(order._id),
        status: currentStatus,
        orderStatus: currentStatus,
        paymentStatus,
        currentStage,
        createdAt: formattedDate,
        estimatedDelivery: currentStage >= 6 ? "Today / 24 Hours" : currentStage >= 4 ? "2-4 Business Days" : "5-7 Business Days",
        destination,
        items,
        totalAmount: order.totalAmount || order.finalAmountNPR || 0,
        shippingAddress: order.shippingAddress || {
          fullName: order.customerName || order.fullName || "Customer",
          city: order.city || "Kathmandu",
          province: order.province || "Bagmati"
        }
      }
    });
  } catch (error) {
    console.error("[Track Order Public Error]:", error);
    return res.status(500).json({ success: false, error: "Failed to locate package tracking details." });
  }
}
