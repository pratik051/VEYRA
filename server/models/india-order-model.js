import mongoose from "mongoose";

export const ORDER_STATUSES = [
  "Requested",
  "Verified",
  "Confirmed",
  "Purchased",
  "In Transit",
  "Arrived in Nepal",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

export const PAYMENT_STATUSES = [
  "Pending",
  "Pending Verification",
  "PAID",
  "Failed",
  "Refunded"
];

export const PAYMENT_METHODS = [
  "COD",
  "FULL_PAYMENT"
];

export const ADMIN_VERIFICATION_STATUSES = [
  "Pending Verification",
  "Verified / Orderable",
  "Unavailable",
  "Alternative Required",
  "Rejected"
];

const IndiaOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: "", index: true },
    customerId: { type: String, default: "", index: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    deliveryAddress: { type: String, required: true, trim: true },
    city: { type: String, default: "", trim: true },
    district: { type: String, default: "", trim: true },
    province: { type: String, default: "", trim: true },
    postalCode: { type: String, default: "", trim: true },
    deliveryInstructions: { type: String, default: "", trim: true },
    shippingAddress: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      deliveryAddress: { type: String, default: "" },
      city: { type: String, default: "" },
      district: { type: String, default: "" },
      province: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "Nepal" },
      deliveryInstructions: { type: String, default: "" }
    },
    marketplace: { type: String, default: "", index: true },
    sourceProductId: { type: String, default: "" },
    productUrl: { type: String, required: true, trim: true },
    originalSourceUrl: { type: String, default: "" },
    verifiedSourceUrl: { type: String, default: "" },
    canonicalSourceUrl: { type: String, default: "" },
    productName: { type: String, required: true, trim: true },
    productImage: { type: String, default: "" },
    brand: { type: String, default: "" },
    category: { type: String, default: "" },
    productVariant: { type: String, default: "" },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    indianPriceINR: { type: Number, required: true, min: 1 },
    conversionAmountNPR: { type: Number, required: true },
    serviceChargeNPR: { type: Number, required: true },
    deliveryChargeNPR: { type: Number, required: true, default: 200 },
    discountNPR: { type: Number, default: 0 },
    referralCode: { type: String, default: "" },
    finalAmountNPR: { type: Number, required: true },
    onlineAdvanceAmountNPR: { type: Number, default: 0 },
    codRemainingAmountNPR: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "Pending", index: true },
    onlinePaymentStatus: { type: String, default: "Pending" },
    codPaymentStatus: { type: String, default: "Pending" },
    paymentScreenshot: { type: String, default: "" },
    paymentTransactionId: { type: String, default: "" },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: "Requested", index: true },
    invoiceUrl: { type: String, default: "" },
    stockStatus: { type: String, default: "Awaiting Admin Verification" },
    deliveryStatus: { type: String, default: "Awaiting Admin Verification" },
    postalCodeChecked: { type: String, default: "" },
    canOrder: { type: Boolean, default: true },
    availabilityCheckedAt: { type: Date, default: Date.now },
    adminVerificationStatus: {
      type: String,
      enum: ADMIN_VERIFICATION_STATUSES,
      default: "Pending Verification",
      index: true
    },
    adminVerifiedAt: { type: Date },
    adminVerifiedBy: { type: String, default: "" },
    adminStockStatus: { type: String, enum: ["Available", "Unavailable", "Not Checked"], default: "Not Checked" },
    adminDeliveryStatus: { type: String, enum: ["Available", "Unavailable", "Not Checked"], default: "Not Checked" },
    adminVerifiedPriceINR: { type: Number },
    adminVerifiedVariant: { type: String, default: "" },
    adminNote: { type: String, default: "" },
    alternativeSourceUrl: { type: String, default: "" },
    alternativePriceINR: { type: Number },
    alternativeStatus: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    confirmationEmailSent: { type: Boolean, default: false },
    deliveredEmailSent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const IndiaOrderModel = mongoose.models.IndiaOrder || mongoose.model("IndiaOrder", IndiaOrderSchema);
export default IndiaOrderModel;
