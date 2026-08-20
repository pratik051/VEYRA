import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    province: { type: String, default: "" },
    district: { type: String, default: "" },
    city: { type: String, default: "" },
    ward: { type: String, default: "" },
    fullAddress: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: "Pending" },
    orderStatus: { type: String, default: "Order Placed" },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    total: { type: Number, required: true },
    trackingNumber: { type: String, default: "" },
    internalNotes: { type: String, default: "" }
  },
  { timestamps: true }
);

export const OrderModel = models.Order || model("Order", OrderSchema);
