import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: "" },
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String, default: "" },
    source: { type: String, default: "SajiloMarts" }
  },
  { _id: false }
);

const ShippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    province: { type: String, default: "" },
    district: { type: String, default: "" },
    city: { type: String, default: "" },
    ward: { type: String, default: "" },
    area: { type: String, default: "" },
    street: { type: String, default: "" },
    fullAddress: { type: String, default: "" },
    addressLine1: { type: String, default: "" },
    addressLine2: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "Nepal" },
    landmark: { type: String, default: "" }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.Mixed, index: true },
    customerId: { type: String, default: "", index: true },
    orderId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, default: "" },
    customerName: { type: String, default: "" },
    phone: { type: String, default: "", index: true },
    email: { type: String, default: "", index: true },
    province: { type: String, default: "" },
    district: { type: String, default: "" },
    city: { type: String, default: "" },
    ward: { type: String, default: "" },
    fullAddress: { type: String, default: "" },
    landmark: { type: String, default: "" },
    shippingAddress: { type: ShippingAddressSchema, default: () => ({}) },
    paymentMethod: { type: String, default: "eSewa" },
    paymentStatus: { type: String, default: "Pending Verification" },
    orderStatus: { type: String, default: "Processing" },
    status: { type: String, default: "Processing" },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    referralCode: { type: String, default: "" },
    total: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    pricing: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    payment: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    onlineAdvanceAmount: { type: Number, default: 0 },
    codRemainingAmount: { type: Number, default: 0 },
    onlinePaymentStatus: { type: String, default: "Pending" },
    codPaymentStatus: { type: String, default: "Pending" },
    paymentScreenshot: { type: String, default: "" },
    paymentReference: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    notes: { type: String, default: "" },
    internalNotes: { type: String, default: "" },
    confirmationEmailSent: { type: Boolean, default: false },
    deliveredEmailSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export default OrderModel;
