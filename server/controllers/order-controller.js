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
      price: Number(i.price) || 0,
      unitPrice: Number(i.price || i.unitPrice) || 0,
      quantity: Math.max(1, Number(i.quantity) || 1),
      image: String(i.image || i.imageUrl || ""),
      source: String(i.source || "SajiloMarts")
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
    const order = await OrderModel.findOne({
      $or: [{ orderId }, { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : undefined }]
    }).lean();

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch order." });
  }
}
