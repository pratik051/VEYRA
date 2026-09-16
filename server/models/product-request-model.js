import mongoose from "mongoose";

export const PRODUCT_REQUEST_STATUSES = [
  "Pending",
  "Reviewing",
  "Alternative Found",
  "Waiting for User",
  "Approved",
  "Rejected",
  "Converted to Order",
  "Closed"
];

const AlternativeProductSchema = new mongoose.Schema(
  {
    marketplace: { type: String, default: "" },
    productUrl: { type: String, default: "" },
    verifiedProductUrl: { type: String, default: "" },
    sourceProductId: { type: String, default: "" },
    productName: { type: String, default: "" },
    productImage: { type: String, default: "" },
    variant: { type: String, default: "" },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    priceINR: { type: Number, default: 0 },
    finalAmountNPR: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    orderable: { type: Boolean, default: false },
    stockStatus: { type: String, default: "In Stock" },
    deliveryAvailable: { type: Boolean, default: true },
    adminNote: { type: String, default: "" },
    verifiedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ProductRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: "", index: true },
    userName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    deliveryLocation: { type: String, default: "" },
    originalMarketplace: { type: String, default: "" },
    originalProductUrl: { type: String, required: true },
    sourceProductId: { type: String, default: "" },
    productName: { type: String, default: "" },
    productImage: { type: String, default: "" },
    productCategory: { type: String, default: "" },
    requestedVariant: { type: String, default: "" },
    requestedSize: { type: String, default: "" },
    requestedColor: { type: String, default: "" },
    requestedQuantity: { type: Number, default: 1, min: 1 },
    currentKnownPrice: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    verificationSnapshot: {
      urlVerified: { type: Boolean, default: false },
      stockStatus: { type: String, default: "" },
      deliveryAvailable: { type: Boolean, default: false },
      priceAvailable: { type: Boolean, default: false },
      failureReason: { type: String, default: "" },
      checkedAt: { type: String, default: "" }
    },
    alternativeProduct: { type: AlternativeProductSchema, default: null },
    customerAction: { type: String, enum: ["none", "accepted", "declined"], default: "none" },
    convertedOrderId: { type: String, default: "" },
    status: {
      type: String,
      enum: PRODUCT_REQUEST_STATUSES,
      default: "Pending",
      index: true
    },
    additionalNotes: { type: String, default: "" },
    maximumBudget: { type: String, default: "" },
    preferredDeliveryTime: { type: String, default: "" },
    screenshotUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

export const ProductRequestModel =
  mongoose.models.ProductRequest || mongoose.model("ProductRequest", ProductRequestSchema);
export default ProductRequestModel;
