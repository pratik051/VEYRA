import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    province: { type: String, default: "" },
    district: { type: String, default: "" },
    city: { type: String, default: "" },
    ward: { type: String, default: "" },
    fullAddress: { type: String, required: true },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "Nepal" },
    landmark: { type: String, default: "" }
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    orderId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    province: { type: String, default: "" },
    district: { type: String, default: "" },
    city: { type: String, default: "" },
    ward: { type: String, default: "" },
    fullAddress: { type: String, required: true },
    landmark: { type: String, default: "" },
    shippingAddress: { type: ShippingAddressSchema },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: "Pending" },
    orderStatus: { type: String, default: "Order Placed" },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    referralCode: { type: String, default: "" },
    total: { type: Number, required: true },
    onlineAdvanceAmount: { type: Number, default: 0 },
    codRemainingAmount: { type: Number, default: 0 },
    onlinePaymentStatus: { type: String, default: "Pending" },
    codPaymentStatus: { type: String, default: "Pending" },
    paymentScreenshot: { type: String, default: "" },
    paymentReference: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    internalNotes: { type: String, default: "" }
  },
  { timestamps: true }
);

export const OrderModel = models.Order || model("Order", OrderSchema);
